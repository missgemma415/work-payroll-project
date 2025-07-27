import { z } from 'zod';

// Employee cost related types
export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  level: 'junior' | 'mid' | 'senior' | 'lead' | 'principal' | 'executive';
  startDate: Date;
  employmentType: 'full-time' | 'part-time' | 'contractor';
  location: string;
}

export interface BenefitsPackage {
  health: number;
  dental: number;
  vision: number;
  retirement401k: number;
  retirementMatch: number;
  equityCompensation: number;
  paidTimeOff: number;
  parentalLeave: number;
  professionalDevelopment: number;
  other: number;
}

export interface OverheadCosts {
  officeSpace: number;
  equipment: number;
  software: number;
  insurance: number;
  payrollTax: number;
  recruiting: number;
  training: number;
  other: number;
}

export interface ProjectAllocation {
  projectId: string;
  projectName: string;
  allocationPercentage: number;
  startDate: Date;
  endDate?: Date;
}

export interface EmployeeCost {
  employeeId: string;
  employee: Employee;
  baseSalary: number;
  benefits: BenefitsPackage;
  overhead: OverheadCosts;
  projectAllocations: ProjectAllocation[];
  utilization: number; // 0-100%
  totalMonthlyCost: number;
  totalAnnualCost: number;
  effectiveDate: Date;
}

// Forecasting types
export interface ForecastPoint {
  date: Date;
  value: number;
  lowerBound: number;
  upperBound: number;
  confidence: number;
}

export interface ProjectCostForecast {
  projectId: string;
  projectName: string;
  currentMonthlyCost: number;
  currentHeadcount: number;
  forecastedCosts: ForecastPoint[];
  assumptions: string[];
}

// Scenario planning types
export interface HiringScenario {
  role: string;
  level: string;
  department: string;
  salary: number;
  startDate: Date;
  includesBenefits: boolean;
  projectAllocations: ProjectAllocation[];
}

export interface TerminationScenario {
  employeeId: string;
  terminationDate: Date;
  severanceCost: number;
  includesUnemploymentCost: boolean;
}

export interface ScenarioInput {
  name: string;
  description: string;
  hiring?: HiringScenario[];
  terminations?: TerminationScenario[];
  salaryAdjustments?: Array<{
    employeeId: string;
    percentageChange: number;
    effectiveDate: Date;
  }>;
  benefitChanges?: Partial<BenefitsPackage>;
}

export interface ScenarioOutput {
  scenarioName: string;
  currentState: {
    totalMonthlyCost: number;
    totalAnnualCost: number;
    headcount: number;
  };
  projectedState: {
    totalMonthlyCost: number;
    totalAnnualCost: number;
    headcount: number;
  };
  impact: {
    monthlyCostChange: number;
    annualCostChange: number;
    headcountChange: number;
    roiProjection: number;
    breakEvenMonths: number;
  };
  recommendations: string[];
  risks: string[];
}

// Zod schemas for validation
export const BenefitsPackageSchema = z.object({
  health: z.number().min(0),
  dental: z.number().min(0),
  vision: z.number().min(0),
  retirement401k: z.number().min(0),
  retirementMatch: z.number().min(0).max(100),
  equityCompensation: z.number().min(0),
  paidTimeOff: z.number().min(0),
  parentalLeave: z.number().min(0),
  professionalDevelopment: z.number().min(0),
  other: z.number().min(0),
});

export const EmployeeCostSchema = z.object({
  employeeId: z.string(),
  baseSalary: z.number().min(0),
  benefits: BenefitsPackageSchema,
  utilization: z.number().min(0).max(100),
});
