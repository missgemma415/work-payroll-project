#!/usr/bin/env python3
"""
Load Mock Payroll Data into Main Database Tables
Imports the comprehensive 2-3 year mock dataset for neural forecasting validation
"""

import asyncio
import asyncpg
import csv
from datetime import datetime
import os

# Database configuration
NEON_DATABASE_URL = "postgresql://neondb_owner:npg_26KGepdyhVnU@ep-icy-hall-ae2vazj8.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

async def load_payroll_data():
    """Load comprehensive mock payroll and time tracking data"""
    print("🚀 Loading comprehensive mock payroll data...")
    
    conn = await asyncpg.connect(NEON_DATABASE_URL)
    
    try:
        # Clear existing mock data (be careful not to delete real data)
        print("🧹 Clearing existing mock data...")
        await conn.execute("DELETE FROM payroll_data WHERE employee_name LIKE 'New Hire%' OR employee_name LIKE 'EMP%'")
        
        # Load payroll data matching actual database schema
        print("💰 Loading payroll records into existing schema...")
        payroll_count = 0
        with open('mock_data/payroll_data.csv', 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                try:
                    # Map CSV fields to database columns
                    pay_period_start = datetime.strptime(row['pay_period_start'], '%Y-%m-%d').date()
                    pay_period_end = datetime.strptime(row['pay_period_end'], '%Y-%m-%d').date()
                    
                    # Get financial data directly from CSV
                    gross_pay = float(row['gross_pay'])
                    federal_tax = float(row['federal_tax'])
                    state_tax = float(row['state_tax'])
                    fica_tax = float(row['fica_tax'])
                    medicare_tax = float(row['medicare_tax'])
                    net_pay = float(row['net_pay'])
                    hours_worked = float(row['hours_worked'])
                    
                    # Get employer burden data from CSV
                    employer_fica = float(row['employer_fica'])
                    employer_medicare = float(row['employer_medicare'])
                    employer_futa = float(row['employer_unemployment'])  # Using unemployment as FUTA
                    employer_suta = employer_futa  # Simplifying for now
                    
                    # Get benefits from CSV
                    health_insurance = float(row['health_insurance'])
                    dental_vision = float(row['dental_vision'])
                    retirement_401k = float(row['retirement_401k'])
                    life_insurance = float(row['life_insurance'])
                    benefits_cost = health_insurance + dental_vision + retirement_401k + life_insurance
                    
                    # Use CSV calculated values
                    total_burden = float(row['total_employer_burden']) 
                    true_cost = float(row['true_cost'])
                    burden_rate = float(row['burden_rate']) / 100  # Convert percentage to decimal
                    
                    await conn.execute("""
                        INSERT INTO payroll_data 
                        (source_type, employee_name, work_date, pay_period_start, pay_period_end,
                         hours_worked, gross_pay, federal_tax, state_tax, fica_tax, medicare_tax,
                         employer_fica, employer_medicare, employer_futa, employer_suta,
                         benefits_cost, net_pay, total_burden, true_cost, burden_rate)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)
                    """, 
                    row['source_type'],  # Use source_type from CSV
                    row['employee_name'], 
                    pay_period_end,  # work_date (use end date)
                    pay_period_start,  # pay_period_start
                    pay_period_end,  # pay_period_end  
                    hours_worked,  # hours_worked from CSV
                    gross_pay,
                    federal_tax,
                    state_tax,
                    fica_tax,
                    medicare_tax,
                    employer_fica,
                    employer_medicare,
                    employer_futa,
                    employer_suta,
                    benefits_cost,
                    net_pay,
                    total_burden,
                    true_cost,
                    burden_rate
                    )
                    payroll_count += 1
                except Exception as e:
                    print(f"⚠️  Error loading payroll record for {row.get('employee_name', 'Unknown')}: {e}")
                    continue
        
        print(f"✅ Loaded {payroll_count} comprehensive payroll records")
        
        # Verify comprehensive dataset
        print("🔍 Verifying comprehensive dataset...")
        
        total_payroll = await conn.fetchval("SELECT COUNT(*) FROM payroll_data")
        total_employees = await conn.fetchval("SELECT COUNT(DISTINCT employee_name) FROM payroll_data")
        
        # Get date range
        date_range = await conn.fetchrow("""
            SELECT MIN(work_date) as start_date, MAX(work_date) as end_date 
            FROM payroll_data
        """)
        
        # Get financial summary
        financial_summary = await conn.fetchrow("""
            SELECT 
                SUM(gross_pay) as total_gross_pay,
                AVG(gross_pay) as avg_gross_pay,
                SUM(total_burden) as total_burden_costs,
                AVG(burden_rate) as avg_burden_rate,
                SUM(true_cost) as total_true_cost
            FROM payroll_data
        """)
        
        print(f"📊 Comprehensive Dataset Summary:")
        print(f"   Total Payroll Records: {total_payroll:,}")
        print(f"   Unique Employees: {total_employees}")
        print(f"   Date Range: {date_range['start_date']} to {date_range['end_date']}")
        print(f"   Total Gross Pay: ${financial_summary['total_gross_pay']:,.2f}")
        print(f"   Average Pay per Record: ${financial_summary['avg_gross_pay']:,.2f}")
        print(f"   Total Burden Costs: ${financial_summary['total_burden_costs']:,.2f}")
        print(f"   Average Burden Rate: {financial_summary['avg_burden_rate']:.1%}")
        print(f"   Total True Cost: ${financial_summary['total_true_cost']:,.2f}")
        
        # Calculate monthly averages for forecasting validation
        monthly_summary = await conn.fetchrow("""
            SELECT 
                DATE_TRUNC('month', work_date) as month,
                COUNT(*) as records,
                SUM(gross_pay) as monthly_gross,
                SUM(true_cost) as monthly_true_cost,
                COUNT(DISTINCT employee_name) as active_employees
            FROM payroll_data 
            WHERE source_type = 'mock_data'
            GROUP BY DATE_TRUNC('month', work_date)
            ORDER BY month DESC
            LIMIT 1
        """)
        
        if monthly_summary:
            print(f"   Latest Month Gross: ${monthly_summary['monthly_gross']:,.2f}")
            print(f"   Latest Month True Cost: ${monthly_summary['monthly_true_cost']:,.2f}")
            print(f"   Active Employees: {monthly_summary['active_employees']}")
            print(f"   Records per Month: {monthly_summary['records']}")
        
        print("\n✅ Comprehensive mock data loading complete!")
        print("🎯 Dataset ready for neural forecasting validation")
        print("📈 Ready for executive dashboard testing")
        print("💡 Data matches company patterns for realistic forecasting")
        
        return {
            'payroll_records': payroll_count,
            'total_employees': total_employees,
            'date_range': f"{date_range['start_date']} to {date_range['end_date']}",
            'total_gross_pay': float(financial_summary['total_gross_pay']),
            'total_true_cost': float(financial_summary['total_true_cost']),
            'avg_burden_rate': float(financial_summary['avg_burden_rate'])
        }
        
    except Exception as e:
        print(f"❌ Error loading mock data: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(load_payroll_data())