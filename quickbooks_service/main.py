"""
QuickBooks Online Integration Service for CEO Payroll Analytics Platform
Comprehensive Python SDK implementation with OAuth 2.0, data sync, and PostgreSQL integration
"""

import asyncio
import asyncpg
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import os
import json

from fastapi import FastAPI, HTTPException, BackgroundTasks, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

# QuickBooks SDK imports (based on research recommendation)
from quickbooks import QuickBooks
from quickbooks.objects import Employee, CompanyInfo, Preferences
from quickbooks.exceptions import QuickbooksException
from intuit.oauth import AuthClient

# Database and async handling
from contextlib import asynccontextmanager

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="QuickBooks Integration API",
    description="Fortune 500-grade QuickBooks Online integration for executive payroll analytics",
    version="1.0.0"
)

# CORS configuration for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://work-payroll-project-*.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Environment variables
DATABASE_URL = os.getenv("NEON_DATABASE_URL")
QUICKBOOKS_CLIENT_ID = os.getenv("QUICKBOOKS_CLIENT_ID")
QUICKBOOKS_CLIENT_SECRET = os.getenv("QUICKBOOKS_CLIENT_SECRET")
QUICKBOOKS_REDIRECT_URI = os.getenv("QUICKBOOKS_REDIRECT_URI", "http://localhost:3000/api/quickbooks/callback")
QUICKBOOKS_BASE_URL = os.getenv("QUICKBOOKS_BASE_URL", "https://sandbox-quickbooks.api.intuit.com")

if not all([DATABASE_URL, QUICKBOOKS_CLIENT_ID, QUICKBOOKS_CLIENT_SECRET]):
    raise ValueError("Missing required environment variables for QuickBooks integration")

# Database connection manager
@asynccontextmanager
async def get_db_connection():
    """Database connection manager matching existing patterns from lib/database.ts"""
    conn = await asyncpg.connect(DATABASE_URL)
    try:
        yield conn
    finally:
        await conn.close()

# Pydantic models matching existing TypeScript interfaces
class QuickBooksCredentials(BaseModel):
    """OAuth credentials for QuickBooks integration"""
    access_token: str
    refresh_token: str
    realm_id: str  # Company ID
    token_expires_at: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)

class EmployeeSync(BaseModel):
    """Employee data synchronization model"""
    quickbooks_id: str
    employee_name: str
    active: bool
    hire_date: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    hourly_rate: Optional[float] = None
    salary: Optional[float] = None
    last_sync: datetime = Field(default_factory=datetime.utcnow)

class SyncResponse(BaseModel):
    """Response model for sync operations"""
    success: bool
    records_processed: int
    errors: List[str] = []
    summary: Dict[str, Any]
    sync_duration: float
    last_sync: str

class AuthRequest(BaseModel):
    """OAuth initialization request"""
    state: Optional[str] = None

class AuthResponse(BaseModel):
    """OAuth authorization response"""
    authorization_url: str
    state: str

# QuickBooks client management
class QuickBooksManager:
    """Manages QuickBooks API connections and operations"""
    
    def __init__(self):
        self.auth_client = AuthClient(
            client_id=QUICKBOOKS_CLIENT_ID,
            client_secret=QUICKBOOKS_CLIENT_SECRET,
            redirect_uri=QUICKBOOKS_REDIRECT_URI,
            environment='sandbox'  # Change to 'production' for live environment
        )
        self.active_clients: Dict[str, QuickBooks] = {}
    
    async def get_client(self, realm_id: str) -> Optional[QuickBooks]:
        """Get authenticated QuickBooks client for company"""
        if realm_id in self.active_clients:
            return self.active_clients[realm_id]
        
        # Load credentials from database
        async with get_db_connection() as conn:
            credentials = await conn.fetchrow("""
                SELECT access_token, refresh_token, token_expires_at
                FROM quickbooks_credentials 
                WHERE realm_id = $1 AND active = true
            """, realm_id)
            
            if not credentials:
                return None
            
            # Check if token needs refresh
            if credentials['token_expires_at'] < datetime.utcnow():
                await self.refresh_token(realm_id)
                # Reload credentials after refresh
                credentials = await conn.fetchrow("""
                    SELECT access_token, refresh_token, token_expires_at
                    FROM quickbooks_credentials 
                    WHERE realm_id = $1 AND active = true
                """, realm_id)
            
            if credentials:
                client = QuickBooks(
                    auth_client=self.auth_client,
                    refresh_token=credentials['refresh_token'],
                    company_id=realm_id
                )
                self.active_clients[realm_id] = client
                return client
        
        return None
    
    async def refresh_token(self, realm_id: str) -> bool:
        """Refresh OAuth token for company"""
        try:
            async with get_db_connection() as conn:
                credentials = await conn.fetchrow("""
                    SELECT refresh_token FROM quickbooks_credentials 
                    WHERE realm_id = $1 AND active = true
                """, realm_id)
                
                if not credentials:
                    return False
                
                # Refresh token using intuit-oauth
                refresh_response = self.auth_client.refresh(credentials['refresh_token'])
                
                # Update credentials in database
                await conn.execute("""
                    UPDATE quickbooks_credentials 
                    SET access_token = $1, 
                        refresh_token = $2,
                        token_expires_at = $3,
                        updated_at = NOW()
                    WHERE realm_id = $4
                """, 
                refresh_response['access_token'],
                refresh_response['refresh_token'],
                datetime.utcnow() + timedelta(seconds=refresh_response.get('expires_in', 3600)),
                realm_id)
                
                logger.info(f"Successfully refreshed token for realm_id: {realm_id}")
                
                # Clear cached client to force reload
                if realm_id in self.active_clients:
                    del self.active_clients[realm_id]
                
                return True
                
        except Exception as e:
            logger.error(f"Token refresh failed for realm_id {realm_id}: {str(e)}")
            return False

# Initialize QuickBooks manager
qb_manager = QuickBooksManager()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "quickbooks_sdk": "python-quickbooks v0.9.12",
        "oauth_client": "intuit-oauth v1.2.6",
        "database": "connected" if DATABASE_URL else "disconnected",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.post("/api/auth/initialize", response_model=AuthResponse)
async def initialize_oauth(request: AuthRequest):
    """Initialize QuickBooks OAuth 2.0 flow"""
    try:
        # Generate authorization URL
        auth_url = qb_manager.auth_client.get_authorization_url([
            'com.intuit.quickbooks.accounting'
        ], state=request.state or "payroll-analytics")
        
        return AuthResponse(
            authorization_url=auth_url,
            state=request.state or "payroll-analytics"
        )
        
    except Exception as e:
        logger.error(f"OAuth initialization error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OAuth initialization failed: {str(e)}")

@app.post("/api/auth/callback")
async def oauth_callback(code: str, realm_id: str, state: str):
    """Handle OAuth callback and store credentials"""
    try:
        # Exchange authorization code for tokens
        token_response = qb_manager.auth_client.get_bearer_token(code, realm_id=realm_id)
        
        # Store credentials in database
        async with get_db_connection() as conn:
            # Deactivate existing credentials for this realm
            await conn.execute("""
                UPDATE quickbooks_credentials 
                SET active = false 
                WHERE realm_id = $1
            """, realm_id)
            
            # Insert new credentials
            await conn.execute("""
                INSERT INTO quickbooks_credentials (
                    realm_id, access_token, refresh_token, 
                    token_expires_at, active, created_at
                ) VALUES ($1, $2, $3, $4, true, NOW())
            """,
            realm_id,
            token_response['access_token'],
            token_response['refresh_token'],
            datetime.utcnow() + timedelta(seconds=token_response.get('expires_in', 3600)))
            
        logger.info(f"Successfully stored credentials for realm_id: {realm_id}")
        
        return {
            "success": True,
            "message": "QuickBooks integration authorized successfully",
            "realm_id": realm_id,
            "expires_at": (datetime.utcnow() + timedelta(seconds=token_response.get('expires_in', 3600))).isoformat()
        }
        
    except Exception as e:
        logger.error(f"OAuth callback error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OAuth callback failed: {str(e)}")

@app.post("/api/sync/employees/{realm_id}", response_model=SyncResponse)
async def sync_employees(realm_id: str, background_tasks: BackgroundTasks):
    """Sync employee data from QuickBooks to PostgreSQL"""
    start_time = datetime.utcnow()
    
    try:
        # Get authenticated QuickBooks client
        qb_client = await qb_manager.get_client(realm_id)
        if not qb_client:
            raise HTTPException(status_code=401, detail="QuickBooks authentication required")
        
        # Fetch employees from QuickBooks
        employees = Employee.all(qb=qb_client)
        
        synced_employees = []
        errors = []
        
        async with get_db_connection() as conn:
            for employee in employees:
                try:
                    # Extract employee data
                    employee_data = {
                        'quickbooks_id': employee.Id,
                        'employee_name': employee.Name or f"{employee.GivenName or ''} {employee.FamilyName or ''}".strip(),
                        'active': employee.Active,
                        'hire_date': employee.HiredDate.strftime('%Y-%m-%d') if employee.HiredDate else None,
                        'email': employee.PrimaryEmailAddr.Address if employee.PrimaryEmailAddr else None,
                        'phone': employee.PrimaryPhone.FreeFormNumber if employee.PrimaryPhone else None,
                        'last_sync': datetime.utcnow()
                    }
                    
                    # Upsert employee data
                    await conn.execute("""
                        INSERT INTO quickbooks_employees (
                            quickbooks_id, employee_name, active, hire_date, 
                            email, phone, last_sync, realm_id
                        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                        ON CONFLICT (quickbooks_id, realm_id) 
                        DO UPDATE SET
                            employee_name = EXCLUDED.employee_name,
                            active = EXCLUDED.active,
                            hire_date = EXCLUDED.hire_date,
                            email = EXCLUDED.email,
                            phone = EXCLUDED.phone,
                            last_sync = EXCLUDED.last_sync
                    """, 
                    employee_data['quickbooks_id'],
                    employee_data['employee_name'],
                    employee_data['active'],
                    employee_data['hire_date'],
                    employee_data['email'],
                    employee_data['phone'],
                    employee_data['last_sync'],
                    realm_id)
                    
                    synced_employees.append(employee_data)
                    
                except Exception as emp_error:
                    error_msg = f"Employee {getattr(employee, 'Name', 'Unknown')}: {str(emp_error)}"
                    errors.append(error_msg)
                    logger.error(f"Employee sync error: {error_msg}")
        
        # Calculate sync duration
        sync_duration = (datetime.utcnow() - start_time).total_seconds()
        
        return SyncResponse(
            success=len(errors) == 0,
            records_processed=len(synced_employees),
            errors=errors,
            summary={
                "total_employees": len(employees),
                "synced_successfully": len(synced_employees),
                "active_employees": sum(1 for emp in synced_employees if emp['active']),
                "realm_id": realm_id
            },
            sync_duration=sync_duration,
            last_sync=datetime.utcnow().isoformat()
        )
        
    except QuickbooksException as qb_error:
        logger.error(f"QuickBooks API error: {str(qb_error)}")
        raise HTTPException(status_code=502, detail=f"QuickBooks API error: {str(qb_error)}")
    
    except Exception as e:
        logger.error(f"Employee sync error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Employee sync failed: {str(e)}")

@app.get("/api/companies/{realm_id}/info")
async def get_company_info(realm_id: str):
    """Get company information from QuickBooks"""
    try:
        qb_client = await qb_manager.get_client(realm_id)
        if not qb_client:
            raise HTTPException(status_code=401, detail="QuickBooks authentication required")
        
        # Get company information
        company_info = CompanyInfo.get(1, qb=qb_client)  # CompanyInfo always has ID = 1
        
        return {
            "success": True,
            "company_info": {
                "name": company_info.CompanyName,
                "legal_name": company_info.LegalName,
                "email": company_info.Email.Address if company_info.Email else None,
                "phone": company_info.PrimaryPhone.FreeFormNumber if company_info.PrimaryPhone else None,
                "country": company_info.Country,
                "created_time": company_info.CreateTime.isoformat() if company_info.CreateTime else None,
                "last_updated": company_info.LastUpdatedTime.isoformat() if company_info.LastUpdatedTime else None
            },
            "realm_id": realm_id
        }
        
    except Exception as e:
        logger.error(f"Company info error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch company info: {str(e)}")

@app.get("/api/employees/{realm_id}")
async def get_employees(realm_id: str):
    """Get synchronized employee data from PostgreSQL"""
    try:
        async with get_db_connection() as conn:
            employees = await conn.fetch("""
                SELECT quickbooks_id, employee_name, active, hire_date, 
                       email, phone, last_sync
                FROM quickbooks_employees 
                WHERE realm_id = $1
                ORDER BY employee_name
            """, realm_id)
            
            return {
                "success": True,
                "employees": [dict(emp) for emp in employees],
                "total_count": len(employees),
                "active_count": sum(1 for emp in employees if emp['active']),
                "last_sync": max(emp['last_sync'] for emp in employees).isoformat() if employees else None
            }
            
    except Exception as e:
        logger.error(f"Employee fetch error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch employees: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001, reload=True)