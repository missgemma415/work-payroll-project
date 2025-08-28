"""
Advanced Analytics FastAPI Backend
CEO/CFO Executive Dashboard with Plotly Visualizations
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
import plotly.express as px
import plotly.graph_objects as go
import plotly.utils
import pandas as pd
import json
from datetime import datetime, timedelta
import random
import os

# Import our Paychex OAuth service
from services.paychex_oauth import paychex_service, MOCK_PAYCHEX_DATA

# Initialize FastAPI app
app = FastAPI(
    title="Executive Analytics API",
    description="Advanced analytics backend for CEO/CFO dashboard with Plotly visualizations",
    version="1.0.0"
)

# CORS configuration for Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Next.js dev server
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Mock executive data for demonstration
def generate_mock_workforce_data():
    """Generate realistic workforce cost data for executive analysis"""
    dates = pd.date_range(start='2024-01-01', end='2024-12-31', freq='M')
    departments = ['Engineering', 'Sales', 'Marketing', 'Operations', 'HR', 'Finance']
    
    data = []
    for date in dates:
        for dept in departments:
            base_cost = {
                'Engineering': 450000,
                'Sales': 280000, 
                'Marketing': 180000,
                'Operations': 220000,
                'HR': 120000,
                'Finance': 160000
            }[dept]
            
            # Add realistic variation
            cost = base_cost * (1 + random.uniform(-0.15, 0.15))
            burden_rate = random.uniform(0.18, 0.32)
            total_cost = cost * (1 + burden_rate)
            
            data.append({
                'date': date,
                'department': dept,
                'base_salary': round(cost),
                'burden_rate': round(burden_rate, 3),
                'total_cost': round(total_cost),
                'employee_count': random.randint(8, 45)
            })
    
    return pd.DataFrame(data)

# Global mock data
workforce_df = generate_mock_workforce_data()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Executive Analytics API",
        "status": "operational",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/charts/workforce-trends")
async def workforce_trends():
    """Generate interactive workforce cost trends visualization"""
    try:
        # Aggregate monthly data
        monthly_data = workforce_df.groupby(['date', 'department']).agg({
            'total_cost': 'sum',
            'employee_count': 'sum'
        }).reset_index()
        
        # Create interactive line chart
        fig = px.line(
            monthly_data,
            x='date',
            y='total_cost',
            color='department',
            title='Executive Workforce Cost Trends',
            labels={
                'total_cost': 'Total Monthly Cost ($)',
                'date': 'Date',
                'department': 'Department'
            }
        )
        
        # Professional styling for executives
        fig.update_layout(
            template='plotly_dark',
            paper_bgcolor='rgba(30, 41, 59, 0.8)',  # slate-800
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(family="Inter, sans-serif", size=12, color='white'),
            title=dict(font=dict(size=18, color='white')),
            hovermode='x unified'
        )
        
        # Convert to JSON for frontend
        chart_json = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
        
        return JSONResponse(content={
            "chart": json.loads(chart_json),
            "metadata": {
                "total_records": len(monthly_data),
                "date_range": {
                    "start": monthly_data['date'].min().isoformat(),
                    "end": monthly_data['date'].max().isoformat()
                }
            }
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating workforce trends: {str(e)}")

@app.get("/api/charts/department-breakdown")
async def department_breakdown():
    """Generate department cost breakdown sunburst chart"""
    try:
        # Get latest month data
        latest_date = workforce_df['date'].max()
        latest_data = workforce_df[workforce_df['date'] == latest_date]
        
        # Create sunburst chart for hierarchical data
        fig = go.Figure(go.Sunburst(
            labels=latest_data['department'].tolist(),
            values=latest_data['total_cost'].tolist(),
            parents=[''] * len(latest_data),  # Root level
            branchvalues="total",
        ))
        
        fig.update_layout(
            title=dict(text="Department Cost Breakdown - Current Month", font=dict(size=18, color='white')),
            template='plotly_dark',
            paper_bgcolor='rgba(30, 41, 59, 0.8)',
            font=dict(family="Inter, sans-serif", size=12, color='white'),
        )
        
        chart_json = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
        
        total_cost = latest_data['total_cost'].sum()
        
        return JSONResponse(content={
            "chart": json.loads(chart_json),
            "metadata": {
                "total_monthly_cost": round(total_cost),
                "department_count": len(latest_data),
                "period": latest_date.strftime("%B %Y")
            }
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating department breakdown: {str(e)}")

@app.get("/api/charts/burden-analysis")
async def burden_analysis():
    """Generate burden rate analysis scatter plot"""
    try:
        # Create scatter plot showing burden rate vs base salary
        fig = px.scatter(
            workforce_df,
            x='base_salary',
            y='burden_rate',
            color='department',
            size='employee_count',
            title='Burden Rate Analysis by Department',
            labels={
                'base_salary': 'Base Salary Cost ($)',
                'burden_rate': 'Burden Rate (%)',
                'employee_count': 'Employee Count'
            },
            hover_data=['total_cost']
        )
        
        # Add trend line
        fig.add_traces(px.scatter(
            workforce_df,
            x='base_salary',
            y='burden_rate',
            trendline='ols'
        ).data)
        
        fig.update_layout(
            template='plotly_dark',
            paper_bgcolor='rgba(30, 41, 59, 0.8)',
            plot_bgcolor='rgba(0,0,0,0)',
            font=dict(family="Inter, sans-serif", size=12, color='white'),
            title=dict(font=dict(size=18, color='white')),
        )
        
        chart_json = json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder)
        
        avg_burden = workforce_df['burden_rate'].mean()
        
        return JSONResponse(content={
            "chart": json.loads(chart_json),
            "metadata": {
                "average_burden_rate": round(avg_burden, 3),
                "total_employees": workforce_df['employee_count'].sum(),
                "analysis_period": "2024 Full Year"
            }
        })
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating burden analysis: {str(e)}")

@app.post("/api/insights/quick")
async def quick_insights(query: dict):
    """Gemma's 10-second executive insight tool"""
    try:
        question = query.get('question', '').lower()
        
        # Pre-computed responses for common executive questions
        if 'monthly' in question and ('cost' in question or 'burn' in question):
            latest_month_cost = workforce_df[workforce_df['date'] == workforce_df['date'].max()]['total_cost'].sum()
            return {
                "answer": f"Total monthly workforce cost: ${latest_month_cost:,.0f}",
                "details": [
                    f"Includes base salary + benefits burden",
                    f"Covers {workforce_df['employee_count'].sum()} employees across 6 departments",
                    f"Average burden rate: {workforce_df['burden_rate'].mean():.1%}"
                ],
                "response_time": "0.8 seconds"
            }
            
        elif 'department' in question and 'highest' in question:
            dept_costs = workforce_df.groupby('department')['total_cost'].sum().sort_values(ascending=False)
            top_dept = dept_costs.index[0]
            top_cost = dept_costs.iloc[0]
            
            return {
                "answer": f"Highest cost department: {top_dept} (${top_cost:,.0f} annually)",
                "details": [
                    f"Represents {top_cost/dept_costs.sum():.1%} of total workforce cost",
                    f"Next highest: {dept_costs.index[1]} (${dept_costs.iloc[1]:,.0f})",
                    "Recommendation: Review headcount and compensation benchmarks"
                ],
                "response_time": "0.6 seconds"
            }
            
        else:
            return {
                "answer": "Executive insight available - please specify: monthly costs, department breakdown, or burden analysis",
                "details": [
                    "Try: 'What is our monthly burn rate?'",
                    "Try: 'Which department costs the most?'", 
                    "Try: 'Show me burden rate analysis'"
                ],
                "response_time": "0.3 seconds"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating insight: {str(e)}")

@app.get("/api/auth/paychex/login")
async def paychex_login():
    """
    Initiate Paychex OAuth 2.0 authentication for Gemma's work email
    """
    try:
        auth_url = paychex_service.get_authorization_url()
        return {
            "auth_url": auth_url,
            "message": "Redirect Gemma to this URL to authenticate with her work email",
            "provider": "Paychex OAuth 2.0"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth initialization failed: {str(e)}")

@app.get("/api/auth/paychex/callback")
async def paychex_callback(code: str, state: str = None):
    """
    Handle Paychex OAuth callback after Gemma's authentication
    """
    try:
        token_result = paychex_service.exchange_code_for_token(code)
        
        if token_result["success"]:
            return JSONResponse(content={
                "success": True,
                "message": "Gemma successfully authenticated with Paychex!",
                "user": "Gemma (HR Generalist)",
                "access_granted": True,
                "timestamp": datetime.now().isoformat()
            })
        else:
            raise HTTPException(status_code=400, detail=token_result["error"])
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"OAuth callback failed: {str(e)}")

@app.get("/api/paychex/company")
async def get_company_data():
    """
    Get company information from Paychex for executive dashboard
    """
    try:
        if paychex_service.is_token_valid():
            company_data = await paychex_service.get_company_info()
            return company_data
        else:
            # Return mock data for demo if not authenticated
            return {
                "success": True,
                "company_data": MOCK_PAYCHEX_DATA["company_info"],
                "mock_data": True,
                "message": "Demo data - authenticate with Paychex for live data",
                "auth_url": paychex_service.get_authorization_url()
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching company data: {str(e)}")

@app.get("/api/paychex/payroll/{company_id}")
async def get_payroll_data(company_id: str, start_date: str = None, end_date: str = None):
    """
    Get payroll data for executive analysis
    """
    try:
        if paychex_service.is_token_valid():
            payroll_data = await paychex_service.get_payroll_data(company_id, start_date, end_date)
            return payroll_data
        else:
            # Return mock data for demo
            return {
                "success": True,
                "payroll_data": MOCK_PAYCHEX_DATA["payroll_data"],
                "executive_summary": MOCK_PAYCHEX_DATA["executive_summary"],
                "mock_data": True,
                "message": "Demo payroll data - authenticate for live Paychex data",
                "company_id": company_id
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching payroll data: {str(e)}")

@app.get("/api/paychex/employees/{company_id}")
async def get_employee_costs(company_id: str):
    """
    Get employee cost data optimized for Gemma's 10-second insight tool
    """
    try:
        if paychex_service.is_token_valid():
            employee_data = await paychex_service.get_employee_costs(company_id)
            return employee_data
        else:
            # Mock data with executive insights
            total_cost = sum(emp["total_cost"] for emp in MOCK_PAYCHEX_DATA["payroll_data"])
            avg_cost = total_cost / len(MOCK_PAYCHEX_DATA["payroll_data"])
            
            return {
                "success": True,
                "employee_data": MOCK_PAYCHEX_DATA["payroll_data"],
                "executive_insights": {
                    "total_monthly_cost": total_cost,
                    "average_employee_cost": round(avg_cost),
                    "total_employees": len(MOCK_PAYCHEX_DATA["payroll_data"]),
                    "departments": 6,
                    "burden_rate": 0.23
                },
                "mock_data": True,
                "gemma_ready": True,
                "message": "Demo employee data - authenticate with Paychex for live data"
            }
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching employee costs: {str(e)}")

@app.get("/api/health")
async def health_check():
    """Detailed health check for monitoring"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "data_status": {
            "workforce_records": len(workforce_df),
            "departments": workforce_df['department'].nunique(),
            "date_range": f"{workforce_df['date'].min()} to {workforce_df['date'].max()}"
        },
        "paychex_auth": {
            "authenticated": paychex_service.is_token_valid(),
            "user": "Gemma (HR Generalist)" if paychex_service.is_token_valid() else "Not authenticated"
        },
        "api_version": "1.0.0"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)