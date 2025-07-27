import { z } from 'zod';

import type { Tool } from '@/lib/types/agent';
import type { BenefitsPackage, EmployeeCost, OverheadCosts } from '@/lib/types/employee-cost';

const CalculateEmployeeCostParams = z.object({
  baseSalary: z.number().min(0),
  benefits: z
    .object({
      healthInsurancePercentage: z.number().min(0).max(100).default(8),
      retirement401kMatch: z.number().min(0).max(100).default(4),
      paidTimeOffDays: z.number().min(0).default(20),
      otherBenefitsPercentage: z.number().min(0).max(100).default(5),
    })
    .optional(),
  overhead: z
    .object({
      payrollTaxPercentage: z.number().min(0).max(100).default(7.65),
      officeSpaceMonthly: z.number().min(0).default(500),
      equipmentAnnual: z.number().min(0).default(3000),
      softwareMonthly: z.number().min(0).default(200),
    })
    .optional(),
  utilization: z.number().min(0).max(100).default(100),
});

export const employeeCostCalculatorTool: Tool = {
  name: 'employee-cost-calculator',
  description: 'Calculate the total cost of an employee including salary, benefits, and overhead',
  parameters: CalculateEmployeeCostParams,
  execute: (params) =>
    Promise.resolve(
      (() => {
        const validated = CalculateEmployeeCostParams.parse(params);
        const { baseSalary, utilization } = validated;
        const benefits = validated.benefits;
        const overhead = validated.overhead;

        // Calculate benefits
        const annualSalary = baseSalary;
        const monthlyBase = baseSalary / 12;

        const benefitsCost: BenefitsPackage = {
          health: (annualSalary * (benefits?.healthInsurancePercentage ?? 8)) / 100 / 12,
          dental: 100, // Fixed cost
          vision: 50, // Fixed cost
          retirement401k: 0, // Employee contribution
          retirementMatch: (annualSalary * (benefits?.retirement401kMatch ?? 4)) / 100 / 12,
          equityCompensation: 0, // Calculated separately
          paidTimeOff: ((monthlyBase / 22) * (benefits?.paidTimeOffDays ?? 20)) / 12,
          parentalLeave: 0, // As needed
          professionalDevelopment: 1500 / 12, // Annual budget
          other: (annualSalary * (benefits?.otherBenefitsPercentage ?? 5)) / 100 / 12,
        };

        // Calculate overhead
        const overheadCosts: OverheadCosts = {
          payrollTax: (monthlyBase * (overhead?.payrollTaxPercentage ?? 7.65)) / 100,
          officeSpace: overhead?.officeSpaceMonthly ?? 500,
          equipment: (overhead?.equipmentAnnual ?? 3000) / 12,
          software: overhead?.softwareMonthly ?? 200,
          insurance: 150, // Fixed monthly
          recruiting: (annualSalary * 0.15) / 12, // 15% of annual salary amortized
          training: 2000 / 12, // Annual training budget
          other: 100, // Miscellaneous
        };

        // Calculate totals
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const totalBenefits = Object.values(benefitsCost).reduce(
          (sum: number, cost: number) => sum + cost,
          0
        );
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const totalOverhead = Object.values(overheadCosts).reduce(
          (sum: number, cost: number) => sum + cost,
          0
        );

        const totalMonthlyCost =
          (monthlyBase + totalBenefits + totalOverhead) * (utilization / 100);
        const totalAnnualCost = totalMonthlyCost * 12;

        // Industry standard multiplier
        const multiplier = 1 + (totalBenefits + totalOverhead) / monthlyBase;

        return {
          baseSalary: annualSalary,
          monthlySalary: monthlyBase,
          benefits: benefitsCost,
          overhead: overheadCosts,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          totalBenefitsCost: totalBenefits,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          totalOverheadCost: totalOverhead,
          totalMonthlyCost,
          totalAnnualCost,
          costMultiplier: multiplier,
          utilizationRate: utilization,
          breakdown: {
            salaryPercentage: (monthlyBase / totalMonthlyCost) * 100,
            benefitsPercentage: (totalBenefits / totalMonthlyCost) * 100,
            overheadPercentage: (totalOverhead / totalMonthlyCost) * 100,
          },
        };
      })()
    ),
};

// Additional utility functions for cost calculations
export function calculateTeamCost(employees: EmployeeCost[]): {
  totalMonthly: number;
  totalAnnual: number;
  averagePerEmployee: number;
  breakdown: Record<string, number>;
} {
  const totalMonthly = employees.reduce((sum, emp) => sum + emp.totalMonthlyCost, 0);
  const totalAnnual = totalMonthly * 12;

  const breakdown = employees.reduce(
    (acc, emp) => {
      const dept = emp.employee.department;
      acc[dept] = (acc[dept] ?? 0) + emp.totalMonthlyCost;
      return acc;
    },
    {} as Record<string, number>
  );

  return {
    totalMonthly,
    totalAnnual,
    averagePerEmployee: employees.length > 0 ? totalMonthly / employees.length : 0,
    breakdown,
  };
}

export function calculateCostImpact(
  currentCost: number,
  newCost: number
): {
  absoluteChange: number;
  percentageChange: number;
  monthlyImpact: number;
  annualImpact: number;
} {
  const absoluteChange = newCost - currentCost;
  const percentageChange = currentCost > 0 ? (absoluteChange / currentCost) * 100 : 0;

  return {
    absoluteChange,
    percentageChange,
    monthlyImpact: absoluteChange,
    annualImpact: absoluteChange * 12,
  };
}
