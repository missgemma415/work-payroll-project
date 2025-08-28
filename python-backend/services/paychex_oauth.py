"""
Paychex OAuth 2.0 Integration Service
Seamless authentication using Gemma's work email credentials
"""

import requests
from typing import Dict, Optional
import json
import os
from datetime import datetime, timedelta

class PaychexOAuthService:
    """
    Paychex API OAuth 2.0 authentication and data service
    Designed for Gemma's seamless work email integration
    """
    
    def __init__(self):
        self.base_url = "https://api.paychex.com"
        self.auth_url = f"{self.base_url}/auth/oauth/v2"
        self.api_url = f"{self.base_url}/companies"
        
        # Environment variables for Gemma's credentials
        self.client_id = os.getenv("PAYCHEX_CLIENT_ID", "your-paychex-client-id")
        self.client_secret = os.getenv("PAYCHEX_CLIENT_SECRET", "your-paychex-client-secret")
        self.redirect_uri = os.getenv("PAYCHEX_REDIRECT_URI", "http://localhost:3000/auth/paychex/callback")
        
        self.access_token = None
        self.token_expires = None
        
    def get_authorization_url(self, state: str = None) -> str:
        """
        Generate OAuth 2.0 authorization URL for Gemma's work email signin
        """
        params = {
            "response_type": "code",
            "client_id": self.client_id,
            "redirect_uri": self.redirect_uri,
            "scope": "companies employees payroll",  # Executive dashboard scopes
            "state": state or "executive-dashboard-auth"
        }
        
        query_params = "&".join([f"{k}={v}" for k, v in params.items()])
        auth_url = f"{self.auth_url}/authorize?{query_params}"
        
        return auth_url
    
    def exchange_code_for_token(self, authorization_code: str) -> Dict:
        """
        Exchange authorization code for access token
        Called after Gemma authorizes with her work email
        """
        token_data = {
            "grant_type": "authorization_code",
            "client_id": self.client_id,
            "client_secret": self.client_secret,
            "code": authorization_code,
            "redirect_uri": self.redirect_uri
        }
        
        headers = {
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json"
        }
        
        try:
            response = requests.post(
                f"{self.auth_url}/token",
                data=token_data,
                headers=headers
            )
            response.raise_for_status()
            
            token_response = response.json()
            
            # Store access token and expiration
            self.access_token = token_response.get("access_token")
            expires_in = token_response.get("expires_in", 3600)  # Default 1 hour
            self.token_expires = datetime.now() + timedelta(seconds=expires_in)
            
            return {
                "success": True,
                "access_token": self.access_token,
                "expires_in": expires_in,
                "token_type": token_response.get("token_type", "Bearer"),
                "message": "Successfully authenticated Gemma's work email"
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Token exchange failed: {str(e)}",
                "message": "Please check Paychex credentials and try again"
            }
    
    def is_token_valid(self) -> bool:
        """Check if current access token is still valid"""
        if not self.access_token or not self.token_expires:
            return False
        return datetime.now() < self.token_expires
    
    def get_headers(self) -> Dict[str, str]:
        """Get authentication headers for API requests"""
        if not self.is_token_valid():
            raise ValueError("No valid access token. Gemma needs to re-authenticate.")
            
        return {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    
    async def get_company_info(self) -> Dict:
        """
        Retrieve company information for executive dashboard
        """
        if not self.is_token_valid():
            return {
                "error": "Authentication required",
                "auth_url": self.get_authorization_url(),
                "message": "Please authorize with Gemma's work email"
            }
        
        try:
            headers = self.get_headers()
            response = requests.get(f"{self.api_url}/companies", headers=headers)
            response.raise_for_status()
            
            companies = response.json()
            
            return {
                "success": True,
                "companies": companies,
                "authenticated_user": "Gemma (HR Generalist)",
                "timestamp": datetime.now().isoformat()
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"API request failed: {str(e)}",
                "message": "Unable to fetch company data from Paychex"
            }
    
    async def get_payroll_data(self, company_id: str, start_date: str = None, end_date: str = None) -> Dict:
        """
        Retrieve payroll data for executive analysis
        Formatted for CEO/CFO dashboard consumption
        """
        if not self.is_token_valid():
            return {
                "error": "Authentication required",
                "auth_url": self.get_authorization_url()
            }
        
        # Default to current month if no dates provided
        if not start_date:
            start_date = datetime.now().replace(day=1).strftime("%Y-%m-%d")
        if not end_date:
            end_date = datetime.now().strftime("%Y-%m-%d")
        
        try:
            headers = self.get_headers()
            payroll_url = f"{self.api_url}/{company_id}/payroll"
            
            params = {
                "startdate": start_date,
                "enddate": end_date
            }
            
            response = requests.get(payroll_url, headers=headers, params=params)
            response.raise_for_status()
            
            payroll_data = response.json()
            
            # Process for executive dashboard
            return {
                "success": True,
                "payroll_data": payroll_data,
                "period": {
                    "start_date": start_date,
                    "end_date": end_date
                },
                "processed_by": "Gemma's Paychex Integration",
                "timestamp": datetime.now().isoformat()
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Payroll data request failed: {str(e)}",
                "message": "Unable to retrieve payroll data"
            }
    
    async def get_employee_costs(self, company_id: str) -> Dict:
        """
        Get employee cost analysis for executive insights
        Optimized for Gemma's 10-second insight tool
        """
        if not self.is_token_valid():
            return {
                "error": "Authentication required",
                "auth_url": self.get_authorization_url()
            }
        
        try:
            headers = self.get_headers()
            employees_url = f"{self.api_url}/{company_id}/employees"
            
            response = requests.get(employees_url, headers=headers)
            response.raise_for_status()
            
            employees_data = response.json()
            
            # Process for executive analysis
            total_employees = len(employees_data.get("employees", []))
            
            # Calculate quick insights for Gemma's tool
            insights = {
                "total_employees": total_employees,
                "departments": len(set(emp.get("department", "Unknown") 
                                     for emp in employees_data.get("employees", []))),
                "data_source": "Paychex Live API",
                "authenticated_by": "Gemma's Work Email",
                "last_updated": datetime.now().isoformat()
            }
            
            return {
                "success": True,
                "employees": employees_data,
                "executive_insights": insights,
                "gemma_ready": True  # Flag for 10-second insight tool
            }
            
        except requests.exceptions.RequestException as e:
            return {
                "success": False,
                "error": f"Employee data request failed: {str(e)}",
                "message": "Unable to retrieve employee cost data"
            }

# Global service instance
paychex_service = PaychexOAuthService()

# Mock data for development/demo when Paychex isn't available
MOCK_PAYCHEX_DATA = {
    "company_info": {
        "company_name": "Executive Analytics Corp",
        "company_id": "exec-analytics-001",
        "address": "123 Executive Blvd, Fortune City, FC 12345",
        "industry": "Professional Services",
        "employee_count": 156
    },
    "payroll_data": [
        {
            "employee_id": "emp001",
            "name": "John Smith",
            "department": "Engineering",
            "base_salary": 125000,
            "benefits_cost": 28750,
            "total_cost": 153750,
            "pay_frequency": "Biweekly"
        },
        {
            "employee_id": "emp002", 
            "name": "Sarah Johnson",
            "department": "Sales",
            "base_salary": 95000,
            "benefits_cost": 21850,
            "total_cost": 116850,
            "pay_frequency": "Biweekly"
        },
        {
            "employee_id": "emp003",
            "name": "Michael Chen",
            "department": "Marketing", 
            "base_salary": 88000,
            "benefits_cost": 20240,
            "total_cost": 108240,
            "pay_frequency": "Biweekly"
        }
    ],
    "executive_summary": {
        "total_monthly_cost": 847500,
        "average_burden_rate": 0.23,
        "departments": ["Engineering", "Sales", "Marketing", "Operations", "HR", "Finance"],
        "last_updated": datetime.now().isoformat(),
        "data_source": "Paychex API via Gemma's Authentication"
    }
}