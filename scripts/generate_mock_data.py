#!/usr/bin/env python3
"""
Comprehensive Mock Data Generator for CEO Payroll Analytics Platform
Creates 2-3 years of realistic payroll data matching Gemma's company patterns:
- 24 employees, $596K monthly baseline, 23.7% burden rate
- Seasonal variations, hiring/termination events, salary changes
- SpringAhead time tracking + Paychex payroll integration patterns
"""

import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import json
import os
from typing import Dict, List, Tuple
import uuid

# Company baseline parameters (based on actual data)
BASELINE_MONTHLY_COST = 596000
BASELINE_EMPLOYEES = 24
BASELINE_BURDEN_RATE = 0.237
START_DATE = datetime(2022, 1, 1)
END_DATE = datetime(2024, 12, 31)

# Employee profiles with realistic salary ranges
EMPLOYEE_PROFILES = [
    # Senior Leadership (2 employees)
    {"title": "CEO", "salary_range": (180000, 220000), "hourly": False},
    {"title": "VP Engineering", "salary_range": (150000, 180000), "hourly": False},
    
    # Senior Engineers (8 employees)  
    {"title": "Senior Software Engineer", "salary_range": (120000, 150000), "hourly": False},
    {"title": "Senior Data Engineer", "salary_range": (125000, 155000), "hourly": False},
    {"title": "DevOps Engineer", "salary_range": (115000, 145000), "hourly": False},
    {"title": "Product Manager", "salary_range": (110000, 140000), "hourly": False},
    
    # Mid-level (8 employees)
    {"title": "Software Engineer", "salary_range": (85000, 115000), "hourly": False},
    {"title": "Data Analyst", "salary_range": (75000, 95000), "hourly": False},
    {"title": "Marketing Manager", "salary_range": (70000, 90000), "hourly": False},
    {"title": "Sales Representative", "salary_range": (65000, 85000), "hourly": False},
    
    # Support/Operations (6 employees)
    {"title": "Customer Success", "salary_range": (55000, 70000), "hourly": False},
    {"title": "Operations Coordinator", "salary_range": (50000, 65000), "hourly": False},
    {"title": "Administrative Assistant", "salary_range": (45000, 55000), "hourly": False},
    {"title": "Contractor", "salary_range": (75, 150), "hourly": True},  # Hourly contractors
]

# Seasonal business patterns
SEASONAL_MULTIPLIERS = {
    1: 0.95,   # January - slower start
    2: 0.98,   # February
    3: 1.05,   # March - Q1 push
    4: 1.02,   # April
    5: 1.08,   # May - peak productivity
    6: 1.06,   # June - Q2 end
    7: 0.92,   # July - vacation season
    8: 0.90,   # August - vacation season
    9: 1.10,   # September - back to work push
    10: 1.08,  # October - Q4 preparation
    11: 1.05,  # November - pre-holiday push
    12: 0.88,  # December - holiday season
}

# Benefits and tax rates
BENEFITS_RATES = {
    "health_insurance": 0.08,    # 8% of salary
    "dental_vision": 0.015,      # 1.5% of salary  
    "retirement_401k": 0.04,     # 4% match
    "life_insurance": 0.005,     # 0.5% of salary
}

TAX_RATES = {
    "federal_income": 0.12,      # Average federal
    "state_income": 0.05,        # California average
    "social_security": 0.062,    # 6.2%
    "medicare": 0.0145,          # 1.45%
    "unemployment": 0.006,       # SUTA + FUTA
}

class PayrollDataGenerator:
    def __init__(self):
        self.employees = []
        self.payroll_records = []
        self.time_tracking_records = []
        self.hiring_events = []
        
        # Generate consistent employee list
        self._generate_employee_roster()
        
    def _generate_employee_roster(self):
        """Generate 24 employees with realistic profiles"""
        random.seed(42)  # For reproducible data
        
        employee_names = [
            "Sarah Johnson", "Michael Chen", "Jessica Rodriguez", "David Kim",
            "Emily Davis", "Robert Wilson", "Ashley Brown", "Christopher Lee",
            "Amanda Martinez", "James Anderson", "Lauren Taylor", "Daniel Garcia",
            "Michelle Lewis", "Ryan Murphy", "Nicole White", "Kevin Scott",
            "Jennifer Thompson", "Mark Robinson", "Samantha Clark", "Brian Hall",
            "Rachel Green", "Justin Adams", "Melissa King", "Andrew Wright"
        ]
        
        for i, name in enumerate(employee_names):
            profile = random.choice(EMPLOYEE_PROFILES)
            
            if profile["hourly"]:
                hourly_rate = random.uniform(profile["salary_range"][0], profile["salary_range"][1])
                annual_salary = hourly_rate * 2080  # 40 hours/week * 52 weeks
            else:
                annual_salary = random.uniform(profile["salary_range"][0], profile["salary_range"][1])
                hourly_rate = annual_salary / 2080
            
            # Stagger hiring dates over past 3 years
            hire_date = START_DATE + timedelta(days=random.randint(0, 730))
            
            employee = {
                "employee_id": f"EMP{i+1:03d}",
                "employee_name": name,
                "title": profile["title"],
                "hire_date": hire_date,
                "annual_salary": round(annual_salary, 2),
                "hourly_rate": round(hourly_rate, 2),
                "is_hourly": profile["hourly"],
                "department": self._assign_department(profile["title"]),
                "active": True,
                "termination_date": None
            }
            
            self.employees.append(employee)
            
        # Adjust salaries to hit $596K monthly target
        self._calibrate_salaries()
        
    def _assign_department(self, title: str) -> str:
        """Assign department based on title"""
        if any(word in title.lower() for word in ["ceo", "vp"]):
            return "Executive"
        elif any(word in title.lower() for word in ["engineer", "devops", "data"]):
            return "Engineering" 
        elif any(word in title.lower() for word in ["product", "manager"]):
            return "Product"
        elif any(word in title.lower() for word in ["marketing", "sales"]):
            return "Sales & Marketing"
        else:
            return "Operations"
            
    def _calibrate_salaries(self):
        """Adjust salaries to match $596K monthly target"""
        total_annual = sum(emp["annual_salary"] for emp in self.employees)
        target_annual = BASELINE_MONTHLY_COST * 12
        
        adjustment_factor = target_annual / total_annual
        
        for employee in self.employees:
            employee["annual_salary"] *= adjustment_factor
            employee["hourly_rate"] *= adjustment_factor
            
        print(f"✅ Calibrated {len(self.employees)} employees to ${target_annual:,.0f} annual target")
        
    def generate_hiring_termination_events(self):
        """Generate realistic hiring and termination events over 3 years"""
        events = []
        
        # Generate some terminations (realistic 15% annual turnover)
        num_terminations = int(BASELINE_EMPLOYEES * 0.15 * 3)  # Over 3 years
        
        for _ in range(num_terminations):
            # Pick a random employee and termination date
            employee = random.choice([e for e in self.employees if e["active"]])
            term_date = START_DATE + timedelta(days=random.randint(90, 1000))
            
            if term_date < END_DATE:
                events.append({
                    "event_type": "termination",
                    "employee_id": employee["employee_id"],
                    "employee_name": employee["employee_name"], 
                    "date": term_date,
                    "reason": random.choice(["voluntary", "performance", "layoff", "relocation"])
                })
                
                # Mark employee as terminated
                employee["active"] = False
                employee["termination_date"] = term_date
        
        # Generate replacement hires
        for term_event in events:
            if term_event["event_type"] == "termination":
                # Hire replacement 1-6 months later
                hire_delay = random.randint(30, 180)
                hire_date = term_event["date"] + timedelta(days=hire_delay)
                
                if hire_date < END_DATE:
                    # Create new employee profile
                    new_employee = {
                        "employee_id": f"NEW{len(events)+1:03d}",
                        "employee_name": f"New Hire {len(events)+1}",
                        "title": "Software Engineer",  # Most common replacement
                        "hire_date": hire_date,
                        "annual_salary": random.uniform(85000, 115000),
                        "hourly_rate": random.uniform(85000, 115000) / 2080,
                        "is_hourly": False,
                        "department": "Engineering",
                        "active": True,
                        "termination_date": None
                    }
                    
                    self.employees.append(new_employee)
                    
                    events.append({
                        "event_type": "hiring",
                        "employee_id": new_employee["employee_id"],
                        "employee_name": new_employee["employee_name"],
                        "date": hire_date,
                        "replacing": term_event["employee_id"]
                    })
        
        self.hiring_events = sorted(events, key=lambda x: x["date"])
        print(f"✅ Generated {len(events)} hiring/termination events over 3 years")
        
    def generate_payroll_data(self):
        """Generate comprehensive payroll data for 3 years"""
        current_date = START_DATE
        
        while current_date <= END_DATE:
            # Get active employees for this pay period
            active_employees = [
                emp for emp in self.employees 
                if emp["hire_date"] <= current_date and 
                (emp["termination_date"] is None or emp["termination_date"] > current_date)
            ]
            
            for employee in active_employees:
                record = self._generate_payroll_record(employee, current_date)
                self.payroll_records.append(record)
                
            # Move to next pay period (bi-weekly)
            current_date += timedelta(days=14)
            
        print(f"✅ Generated {len(self.payroll_records)} payroll records")
        
    def _generate_payroll_record(self, employee: Dict, pay_date: datetime) -> Dict:
        """Generate single payroll record with realistic variations"""
        
        # Calculate base pay for bi-weekly period
        if employee["is_hourly"]:
            # Hourly employees: vary hours worked (70-85 hours bi-weekly)
            hours_worked = random.uniform(70, 85)
            gross_pay = hours_worked * employee["hourly_rate"]
        else:
            # Salaried employees: consistent bi-weekly amount
            hours_worked = 80  # Standard 40hrs/week * 2 weeks
            gross_pay = employee["annual_salary"] / 26  # 26 pay periods
            
        # Apply seasonal multiplier
        seasonal_factor = SEASONAL_MULTIPLIERS.get(pay_date.month, 1.0)
        
        # Add some random variation (±5%)
        variation = random.uniform(0.95, 1.05)
        
        gross_pay *= seasonal_factor * variation
        
        # Calculate taxes (employee portion)
        federal_tax = gross_pay * TAX_RATES["federal_income"]
        state_tax = gross_pay * TAX_RATES["state_income"] 
        fica_tax = gross_pay * TAX_RATES["social_security"]
        medicare_tax = gross_pay * TAX_RATES["medicare"]
        
        # Calculate employer taxes and benefits
        employer_fica = gross_pay * TAX_RATES["social_security"]
        employer_medicare = gross_pay * TAX_RATES["medicare"]
        employer_unemployment = gross_pay * TAX_RATES["unemployment"]
        
        health_insurance = employee["annual_salary"] * BENEFITS_RATES["health_insurance"] / 26
        dental_vision = employee["annual_salary"] * BENEFITS_RATES["dental_vision"] / 26
        retirement_401k = gross_pay * BENEFITS_RATES["retirement_401k"]
        life_insurance = employee["annual_salary"] * BENEFITS_RATES["life_insurance"] / 26
        
        # Total employer burden
        total_employer_burden = (
            employer_fica + employer_medicare + employer_unemployment +
            health_insurance + dental_vision + retirement_401k + life_insurance
        )
        
        # Net pay and true cost
        total_taxes = federal_tax + state_tax + fica_tax + medicare_tax
        net_pay = gross_pay - total_taxes
        true_cost = gross_pay + total_employer_burden
        
        # Burden rate
        burden_rate = (total_employer_burden / gross_pay) * 100
        
        return {
            "employee_id": employee["employee_id"],
            "employee_name": employee["employee_name"],
            "department": employee["department"],
            "pay_period_start": pay_date - timedelta(days=13),
            "pay_period_end": pay_date,
            "hours_worked": round(hours_worked, 2),
            "hourly_rate": round(employee["hourly_rate"], 2),
            "gross_pay": round(gross_pay, 2),
            "federal_tax": round(federal_tax, 2),
            "state_tax": round(state_tax, 2),
            "fica_tax": round(fica_tax, 2),
            "medicare_tax": round(medicare_tax, 2),
            "total_taxes": round(total_taxes, 2),
            "net_pay": round(net_pay, 2),
            "employer_fica": round(employer_fica, 2),
            "employer_medicare": round(employer_medicare, 2),
            "employer_unemployment": round(employer_unemployment, 2),
            "health_insurance": round(health_insurance, 2),
            "dental_vision": round(dental_vision, 2),
            "retirement_401k": round(retirement_401k, 2),
            "life_insurance": round(life_insurance, 2),
            "total_employer_burden": round(total_employer_burden, 2),
            "true_cost": round(true_cost, 2),
            "burden_rate": round(burden_rate, 2),
            "source_type": "paychex",
            "filename": f"paychex_payroll_{pay_date.strftime('%Y%m%d')}.csv"
        }
        
    def generate_time_tracking_data(self):
        """Generate SpringAhead time tracking data"""
        current_date = START_DATE
        
        while current_date <= END_DATE:
            # Generate time tracking for each work day
            if current_date.weekday() < 5:  # Monday-Friday
                active_employees = [
                    emp for emp in self.employees 
                    if emp["hire_date"] <= current_date and 
                    (emp["termination_date"] is None or emp["termination_date"] > current_date)
                ]
                
                for employee in active_employees:
                    record = self._generate_time_record(employee, current_date)
                    if record:  # Some days employees might not track time
                        self.time_tracking_records.append(record)
                        
            current_date += timedelta(days=1)
            
        print(f"✅ Generated {len(self.time_tracking_records)} time tracking records")
        
    def _generate_time_record(self, employee: Dict, work_date: datetime) -> Dict:
        """Generate single time tracking record"""
        
        # Some randomness - not every employee tracks every day (90% compliance)
        if random.random() > 0.9:
            return None
            
        # Assign projects based on department
        projects = self._get_employee_projects(employee["department"])
        
        # Generate 6-10 hours of work per day with project breakdown
        total_hours = random.uniform(6.5, 9.5)
        
        # Distribute hours across projects
        project_hours = {}
        remaining_hours = total_hours
        
        for i, project in enumerate(projects):
            if i == len(projects) - 1:  # Last project gets remaining hours
                project_hours[project] = remaining_hours
            else:
                hours = random.uniform(0.5, min(4, remaining_hours - 0.5))
                project_hours[project] = hours
                remaining_hours -= hours
                
        return {
            "employee_id": employee["employee_id"],
            "employee_name": employee["employee_name"],
            "work_date": work_date,
            "total_hours": round(total_hours, 2),
            "project_allocations": {k: round(v, 2) for k, v in project_hours.items()},
            "billable_hours": round(total_hours * random.uniform(0.7, 0.95), 2),  # 70-95% billable
            "notes": f"Daily work on {', '.join(projects[:2])}",
            "source_type": "springahead",
            "filename": f"springahead_timesheet_{work_date.strftime('%Y%m%d')}.csv"
        }
        
    def _get_employee_projects(self, department: str) -> List[str]:
        """Get realistic project assignments by department"""
        project_mapping = {
            "Engineering": ["Platform Core", "API Development", "DevOps", "Bug Fixes"],
            "Product": ["Product Strategy", "Feature Planning", "User Research", "Analytics"],
            "Sales & Marketing": ["Lead Generation", "Customer Outreach", "Marketing Campaigns", "Sales Support"],
            "Operations": ["Admin Tasks", "HR Support", "Finance", "General Operations"],
            "Executive": ["Strategy", "Leadership", "Board Meetings", "Planning"]
        }
        
        return project_mapping.get(department, ["General Work", "Admin", "Meetings"])
        
    def generate_edge_cases(self):
        """Generate specific edge cases for comprehensive testing"""
        edge_cases = []
        
        # 1. Salary increases/decreases
        for employee in random.sample(self.employees, 5):
            change_date = START_DATE + timedelta(days=random.randint(365, 730))
            change_percent = random.uniform(-0.1, 0.2)  # -10% to +20%
            
            edge_cases.append({
                "type": "salary_change",
                "employee_id": employee["employee_id"],
                "date": change_date,
                "old_salary": employee["annual_salary"],
                "new_salary": employee["annual_salary"] * (1 + change_percent),
                "reason": "performance_review" if change_percent > 0 else "budget_cut"
            })
            
        # 2. Bonus payments
        bonus_months = [3, 6, 12]  # Quarterly and year-end
        for bonus_month in bonus_months:
            for year in [2022, 2023, 2024]:
                bonus_date = datetime(year, bonus_month, 15)
                if START_DATE <= bonus_date <= END_DATE:
                    # Random 30-50% of employees get bonuses
                    bonus_employees = random.sample(self.employees, random.randint(7, 12))
                    
                    for employee in bonus_employees:
                        bonus_amount = random.uniform(2000, 10000)
                        edge_cases.append({
                            "type": "bonus",
                            "employee_id": employee["employee_id"],
                            "date": bonus_date,
                            "amount": bonus_amount,
                            "bonus_type": "performance" if bonus_month != 12 else "year_end"
                        })
                        
        # 3. Unpaid leave periods
        for employee in random.sample(self.employees, 3):
            leave_start = START_DATE + timedelta(days=random.randint(180, 900))
            leave_duration = random.randint(7, 30)  # 1-4 weeks
            
            edge_cases.append({
                "type": "unpaid_leave",
                "employee_id": employee["employee_id"],
                "start_date": leave_start,
                "end_date": leave_start + timedelta(days=leave_duration),
                "reason": random.choice(["medical", "family", "personal"])
            })
            
        # 4. Department transfers
        for employee in random.sample(self.employees, 2):
            transfer_date = START_DATE + timedelta(days=random.randint(200, 800))
            new_dept = random.choice(["Engineering", "Product", "Operations"])
            
            edge_cases.append({
                "type": "department_transfer", 
                "employee_id": employee["employee_id"],
                "date": transfer_date,
                "old_department": employee["department"],
                "new_department": new_dept
            })
            
        print(f"✅ Generated {len(edge_cases)} edge case scenarios")
        return edge_cases
        
    def export_to_csv(self, output_dir: str = "mock_data"):
        """Export all generated data to CSV files"""
        os.makedirs(output_dir, exist_ok=True)
        
        # Employee roster
        emp_df = pd.DataFrame(self.employees)
        emp_df.to_csv(f"{output_dir}/employees.csv", index=False)
        
        # Payroll data
        payroll_df = pd.DataFrame(self.payroll_records)
        payroll_df.to_csv(f"{output_dir}/payroll_data.csv", index=False)
        
        # Time tracking data
        if self.time_tracking_records:
            # Expand project allocations for CSV export
            time_records = []
            for record in self.time_tracking_records:
                base_record = {k: v for k, v in record.items() if k != "project_allocations"}
                
                if record.get("project_allocations"):
                    for project, hours in record["project_allocations"].items():
                        project_record = base_record.copy()
                        project_record["project_name"] = project
                        project_record["project_hours"] = hours
                        time_records.append(project_record)
                else:
                    time_records.append(base_record)
                    
            time_df = pd.DataFrame(time_records)
            time_df.to_csv(f"{output_dir}/time_tracking.csv", index=False)
            
        # Hiring events
        if self.hiring_events:
            events_df = pd.DataFrame(self.hiring_events)
            events_df.to_csv(f"{output_dir}/hiring_events.csv", index=False)
            
        print(f"✅ Exported all mock data to {output_dir}/ directory")
        
    def generate_summary_report(self):
        """Generate summary statistics of mock data"""
        active_employees = [e for e in self.employees if e["active"]]
        
        total_annual_cost = sum(e["annual_salary"] for e in active_employees)
        monthly_cost = total_annual_cost / 12
        
        # Calculate burden rates
        sample_records = [r for r in self.payroll_records if r["pay_period_end"].year == 2024][:100]
        avg_burden_rate = np.mean([r["burden_rate"] for r in sample_records]) if sample_records else 0
        
        summary = {
            "total_employees": len(self.employees),
            "active_employees": len(active_employees), 
            "terminated_employees": len([e for e in self.employees if not e["active"]]),
            "total_annual_payroll": round(total_annual_cost, 2),
            "monthly_payroll": round(monthly_cost, 2),
            "average_burden_rate": round(avg_burden_rate, 2),
            "payroll_records": len(self.payroll_records),
            "time_tracking_records": len(self.time_tracking_records),
            "hiring_events": len(self.hiring_events),
            "date_range": f"{START_DATE.strftime('%Y-%m-%d')} to {END_DATE.strftime('%Y-%m-%d')}",
            "baseline_target_monthly": BASELINE_MONTHLY_COST,
            "baseline_target_employees": BASELINE_EMPLOYEES,
            "baseline_target_burden": BASELINE_BURDEN_RATE * 100
        }
        
        return summary

def main():
    """Generate comprehensive mock data for payroll analytics testing"""
    print("🚀 Generating comprehensive mock payroll data...")
    print(f"Target: {BASELINE_EMPLOYEES} employees, ${BASELINE_MONTHLY_COST:,}/month, {BASELINE_BURDEN_RATE*100:.1f}% burden rate")
    print(f"Period: {START_DATE.strftime('%Y-%m-%d')} to {END_DATE.strftime('%Y-%m-%d')}")
    print("-" * 80)
    
    generator = PayrollDataGenerator()
    
    # Generate all data components
    generator.generate_hiring_termination_events()
    generator.generate_payroll_data()
    generator.generate_time_tracking_data()
    edge_cases = generator.generate_edge_cases()
    
    # Export data
    generator.export_to_csv()
    
    # Generate summary
    summary = generator.generate_summary_report()
    
    print("\n📊 MOCK DATA GENERATION SUMMARY")
    print("=" * 50)
    for key, value in summary.items():
        print(f"{key.replace('_', ' ').title()}: {value}")
        
    # Save summary as JSON
    with open("mock_data/summary.json", "w") as f:
        json.dump(summary, f, indent=2, default=str)
        
    print(f"\n✅ Mock data generation complete!")
    print(f"📁 Files saved to mock_data/ directory")
    print(f"🎯 Ready for comprehensive testing with {len(generator.payroll_records)} payroll records")

if __name__ == "__main__":
    main()