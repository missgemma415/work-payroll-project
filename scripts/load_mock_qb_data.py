#!/usr/bin/env python3
"""
Load Mock Data into QuickBooks Database Tables
Imports the generated mock data into QuickBooks integration tables for comprehensive testing
"""

import asyncio
import asyncpg
import json
import csv
from datetime import datetime, timedelta
from pathlib import Path
import os
import uuid

# Database configuration
NEON_DATABASE_URL = "postgresql://neondb_owner:npg_26KGepdyhVnU@ep-icy-hall-ae2vazj8.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

async def load_mock_data():
    """Load comprehensive mock data into QuickBooks integration tables"""
    print("🚀 Loading mock data into QuickBooks database tables...")
    
    # Connect to database
    conn = await asyncpg.connect(NEON_DATABASE_URL)
    
    try:
        # Clear existing test data
        print("🧹 Clearing existing test data...")
        await conn.execute("DELETE FROM quickbooks_payroll_mapping WHERE realm_id LIKE 'test-%'")
        await conn.execute("DELETE FROM quickbooks_sync_log WHERE realm_id LIKE 'test-%'")
        await conn.execute("DELETE FROM quickbooks_employees WHERE realm_id LIKE 'test-%'")
        await conn.execute("DELETE FROM quickbooks_payroll_items WHERE realm_id LIKE 'test-%'")
        await conn.execute("DELETE FROM quickbooks_companies WHERE realm_id LIKE 'test-%'")
        await conn.execute("DELETE FROM quickbooks_credentials WHERE realm_id LIKE 'test-%'")
        
        # Create test company
        test_realm_id = "test-analytics-company-001"
        print(f"📊 Creating test QuickBooks company: {test_realm_id}")
        
        await conn.execute("""
            INSERT INTO quickbooks_companies 
            (realm_id, company_name, legal_name, email, phone, country, qb_created_time, qb_last_updated)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        """, test_realm_id, "Analytics Test Company", "Analytics Test Company LLC", 
             "admin@analyticstest.com", "+1-555-0123", "US", 
             datetime.now() - timedelta(days=365), datetime.now())
        
        # Create test credentials
        print("🔐 Creating test OAuth credentials...")
        await conn.execute("""
            INSERT INTO quickbooks_credentials 
            (realm_id, access_token, refresh_token, token_expires_at, active)
            VALUES ($1, $2, $3, $4, $5)
        """, test_realm_id, "test_access_token_mock", "test_refresh_token_mock",
             datetime.now() + timedelta(days=30), True)
        
        # Load mock employees
        print("👥 Loading mock employees into QuickBooks tables...")
        employees_file = Path("mock_data/employees.csv")
        
        if not employees_file.exists():
            print(f"❌ Error: {employees_file} not found. Run generate_mock_data.py first.")
            return
        
        employees_loaded = 0
        with open(employees_file, 'r') as f:
            reader = csv.DictReader(f)
            for row in reader:
                qb_employee_id = f"qb_{row['employee_id']}"
                
                await conn.execute("""
                    INSERT INTO quickbooks_employees 
                    (realm_id, quickbooks_id, employee_name, active, hire_date, hourly_rate, salary)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                """, test_realm_id, qb_employee_id, row['employee_name'], 
                     row['active'] == 'True', 
                     datetime.strptime(row['hire_date'], '%Y-%m-%d').date(),
                     float(row['hourly_rate']) if row['hourly_rate'] else None,
                     float(row['annual_salary']) if row['annual_salary'] else None)
                
                employees_loaded += 1
        
        print(f"✅ Loaded {employees_loaded} employees into quickbooks_employees")
        
        # Create payroll item mappings
        print("💰 Creating payroll item mappings...")
        payroll_items = [
            ("Salary", "Salary", "Salary Expense", "Salary Payable"),
            ("Hourly Wages", "Hourly", "Wages Expense", "Wages Payable"),
            ("Federal Tax", "Tax", "Tax Expense", "Federal Tax Payable"),
            ("State Tax", "Tax", "Tax Expense", "State Tax Payable"),
            ("FICA Tax", "Tax", "Tax Expense", "FICA Payable"),
            ("Medicare Tax", "Tax", "Tax Expense", "Medicare Payable"),
            ("Health Insurance", "Benefit", "Benefits Expense", "Benefits Payable"),
            ("Dental & Vision", "Benefit", "Benefits Expense", "Benefits Payable"),
            ("401k Contribution", "Benefit", "Benefits Expense", "401k Payable"),
            ("Life Insurance", "Benefit", "Benefits Expense", "Benefits Payable")
        ]
        
        for i, (item_name, item_type, expense_account, liability_account) in enumerate(payroll_items, 1):
            qb_item_id = f"payroll_item_{i:03d}"
            await conn.execute("""
                INSERT INTO quickbooks_payroll_items 
                (realm_id, quickbooks_id, item_name, item_type, expense_account_ref, liability_account_ref)
                VALUES ($1, $2, $3, $4, $5, $6)
            """, test_realm_id, qb_item_id, item_name, item_type, expense_account, liability_account)
        
        print(f"✅ Created {len(payroll_items)} payroll item mappings")
        
        # Create employee mappings between QuickBooks and local data
        print("🔗 Creating employee mappings...")
        employees_mapped = 0
        
        # Map QuickBooks employees to existing payroll data
        existing_employees = await conn.fetch("""
            SELECT DISTINCT employee_name FROM payroll_data 
            ORDER BY employee_name
        """)
        
        qb_employees = await conn.fetch("""
            SELECT quickbooks_id, employee_name FROM quickbooks_employees 
            WHERE realm_id = $1 ORDER BY employee_name
        """, test_realm_id)
        
        # Create intelligent mappings
        for qb_emp in qb_employees:
            # Try to find exact match first
            local_match = None
            for local_emp in existing_employees:
                if local_emp['employee_name'].lower() == qb_emp['employee_name'].lower():
                    local_match = local_emp['employee_name']
                    break
            
            # If no exact match, use first available (for demo purposes)
            if not local_match and existing_employees:
                local_match = existing_employees[0]['employee_name']
            
            if local_match:
                await conn.execute("""
                    INSERT INTO quickbooks_payroll_mapping 
                    (realm_id, quickbooks_employee_id, local_employee_name, mapping_confidence, manually_verified)
                    VALUES ($1, $2, $3, $4, $5)
                """, test_realm_id, qb_emp['quickbooks_id'], local_match, 0.95, True)
                employees_mapped += 1
        
        print(f"✅ Created {employees_mapped} employee mappings")
        
        # Create sync log entries
        print("📝 Creating sync operation logs...")
        sync_operations = [
            ("company_info", 1, 1, 0, 0.5),
            ("employees", employees_loaded, employees_loaded, 0, 3.2),
            ("payroll_items", len(payroll_items), len(payroll_items), 0, 1.1),
            ("employee_mapping", employees_mapped, employees_mapped, 0, 2.8)
        ]
        
        for op_type, processed, successful, failed, duration in sync_operations:
            await conn.execute("""
                INSERT INTO quickbooks_sync_log 
                (realm_id, operation_type, records_processed, records_successful, 
                 records_failed, sync_duration_seconds, started_at, completed_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            """, test_realm_id, op_type, processed, successful, failed, duration,
                 datetime.now() - timedelta(minutes=5), datetime.now())
        
        print(f"✅ Created {len(sync_operations)} sync log entries")
        
        # Verify data integrity
        print("🔍 Verifying data integrity...")
        
        # Check employee summary view
        summary = await conn.fetchrow("""
            SELECT * FROM quickbooks_employee_summary WHERE realm_id = $1
        """, test_realm_id)
        
        if summary:
            print(f"📊 QuickBooks Employee Summary:")
            print(f"   Company: {summary['company_name']}")
            print(f"   Total Employees: {summary['total_employees']}")
            print(f"   Active Employees: {summary['active_employees']}")
            print(f"   Avg Hourly Rate: ${summary['avg_hourly_rate']:.2f}" if summary['avg_hourly_rate'] else "   Avg Hourly Rate: N/A")
            print(f"   Avg Salary: ${summary['avg_salary']:,.2f}" if summary['avg_salary'] else "   Avg Salary: N/A")
            
        # Check mapping status
        mapping_status = await conn.fetchrow("""
            SELECT * FROM quickbooks_mapping_status WHERE realm_id = $1
        """, test_realm_id)
        
        if mapping_status:
            print(f"🔗 Mapping Status:")
            print(f"   QuickBooks Employees: {mapping_status['quickbooks_employees']}")
            print(f"   Mapped Employees: {mapping_status['mapped_employees']}")
            print(f"   Verified Mappings: {mapping_status['verified_mappings']}")
            print(f"   Mapping Percentage: {mapping_status['mapping_percentage']}%")
        
        print("\n✅ Mock QuickBooks data loading complete!")
        print(f"📝 Test Realm ID: {test_realm_id}")
        print("🎯 Ready for comprehensive integration testing")
        
        return test_realm_id
        
    except Exception as e:
        print(f"❌ Error loading mock data: {e}")
        raise
    finally:
        await conn.close()

if __name__ == "__main__":
    asyncio.run(load_mock_data())