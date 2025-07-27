import { z } from 'zod';

import type { PagesFunction, Env } from '../../types';
import { generateAIResponse } from '../../lib/gemini';

const AnalyzeRequestSchema = z.object({
  employees: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      department: z.string(),
      salary: z.number(),
      benefits: z
        .object({
          health: z.number(),
          retirement: z.number(),
          other: z.number(),
        })
        .optional(),
    })
  ),
  analysisType: z.enum(['cost-breakdown', 'optimization', 'department-analysis', 'forecast']),
});

export const onRequestPost: PagesFunction<Env> = async ({ request }) => {
  try {
    const body = await request.json();
    const validation = AnalyzeRequestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          details: validation.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { employees, analysisType } = validation.data;

    // Calculate totals
    const totalEmployees = employees.length;
    const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
    const departmentBreakdown = employees.reduce(
      (acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    // Generate analysis prompt based on type
    let prompt = '';

    switch (analysisType) {
      case 'cost-breakdown':
        prompt = `
          Analyze the following employee cost data and provide a comprehensive breakdown:
          
          Total Employees: ${totalEmployees}
          Total Annual Salary Cost: $${totalSalary.toLocaleString()}
          Average Salary: $${Math.round(totalSalary / totalEmployees).toLocaleString()}
          
          Department Distribution:
          ${Object.entries(departmentBreakdown)
            .map(([dept, count]) => `- ${dept}: ${count} employees`)
            .join('\n')}
          
          Provide:
          1. Executive summary
          2. Cost breakdown by department
          3. Benefits and overhead estimates (use industry standards)
          4. Key insights and recommendations
        `;
        break;

      case 'optimization':
        prompt = `
          Based on the employee data, suggest cost optimization strategies:
          
          Current State:
          - ${totalEmployees} employees
          - $${totalSalary.toLocaleString()} annual salary cost
          - Departments: ${Object.keys(departmentBreakdown).join(', ')}
          
          Provide specific, actionable recommendations for:
          1. Reducing costs without impacting productivity
          2. Optimizing team structure
          3. Benefits optimization
          4. Remote work opportunities
          5. Automation possibilities
        `;
        break;

      case 'department-analysis':
        prompt = `
          Analyze the department structure and costs:
          
          ${Object.entries(departmentBreakdown)
            .map(([dept, count]) => {
              const deptEmployees = employees.filter((e) => e.department === dept);
              const deptSalary = deptEmployees.reduce((sum, e) => sum + e.salary, 0);
              return `${dept}:
              - Employees: ${count}
              - Total Salary: $${deptSalary.toLocaleString()}
              - Average Salary: $${Math.round(deptSalary / count).toLocaleString()}`;
            })
            .join('\n\n')}
          
          Provide insights on:
          1. Department efficiency
          2. Salary competitiveness
          3. Staffing recommendations
          4. Cross-department opportunities
        `;
        break;

      case 'forecast':
        prompt = `
          Create a 12-month cost forecast based on current data:
          
          Current Monthly Cost: $${Math.round(totalSalary / 12).toLocaleString()}
          Total Employees: ${totalEmployees}
          
          Consider:
          1. Typical 3-5% annual salary increases
          2. Potential new hires (10-15% growth)
          3. Benefits cost inflation (8-10% annually)
          4. Seasonal variations
          
          Provide month-by-month projections and key assumptions.
        `;
        break;
    }

    const analysis = await generateAIResponse(prompt);

    return new Response(
      JSON.stringify({
        analysis,
        summary: {
          totalEmployees,
          totalAnnualCost: totalSalary,
          averageSalary: Math.round(totalSalary / totalEmployees),
          departments: Object.keys(departmentBreakdown).length,
        },
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Analyze endpoint error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
