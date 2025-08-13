import { promises as fs } from 'fs';

import { parse } from 'csv-parse';

// Type for CSV row data (flexible to handle different column names)
type CsvRow = Record<string, string | undefined>;

export interface SpringAheadRecord {
  employee_name: string;
  employee_id?: string;
  date: string;
  project_identifier: string;
  hours: number;
  hourly_rate?: number;
  task_description?: string;
}

export interface PaychexRecord {
  employee_name: string;
  employee_id?: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  federal_tax: number;
  state_tax: number;
  fica_tax: number;
  medicare_tax: number;
  other_deductions: number;
  benefits_cost: number;
  bonuses: number;
  net_pay: number;
}

export interface ParsedData {
  springahead?: SpringAheadRecord[];
  paychex?: PaychexRecord[];
  raw_data?: Record<string, unknown>[];
  errors?: string[];
}

export class CSVParser {
  
  async parseFile(filePath: string, fileType: string): Promise<ParsedData> {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      
      switch (fileType) {
        case 'springahead':
          return await this.parseSpringAhead(fileContent);
        case 'paychex':
          return await this.parsePaychex(fileContent);
        default:
          return await this.parseGenericCSV(fileContent);
      }
    } catch (error) {
      return {
        errors: [`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`]
      };
    }
  }

  private async parseSpringAhead(content: string): Promise<ParsedData> {
    const records: SpringAheadRecord[] = [];
    const errors: string[] = [];

    return new Promise((resolve) => {
      parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, data: CsvRow[]) => {
        if (err) {
          resolve({ errors: [`CSV parsing error: ${err.message}`] });
          return;
        }

        for (const [index, row] of data.entries()) {
          try {
            // Try different column name variations
            const employee_name = row['Employee'] || row['employee_name'] || row['Employee Name'] || row['Name'];
            const date = row['Date'] || row['date'] || row['Work Date'];
            const project = row['Project'] || row['project_identifier'] || row['Project ID'] || row['ProjectID'];
            const hours = parseFloat(row['Hours'] || row['hours'] || row['Hours Worked'] || '0');
            const rate = parseFloat(row['Rate'] || row['hourly_rate'] || row['Hourly Rate'] || '0');

            if (!employee_name) {
              errors.push(`Row ${index + 1}: Missing employee name`);
              continue;
            }

            if (!date) {
              errors.push(`Row ${index + 1}: Missing date for ${employee_name}`);
              continue;
            }

            if (!project) {
              errors.push(`Row ${index + 1}: Missing project for ${employee_name}`);
              continue;
            }

            if (isNaN(hours) || hours <= 0) {
              errors.push(`Row ${index + 1}: Invalid hours for ${employee_name}`);
              continue;
            }

            const empId = row['EmployeeID'] || row['employee_id'] || row['Employee ID'];
            const taskDesc = row['Task'] || row['Description'] || row['task_description'];
            
            records.push({
              employee_name: employee_name.trim(),
              ...(empId && { employee_id: empId }),
              date: date.trim(),
              project_identifier: project.trim(),
              hours: hours,
              ...(rate > 0 && { hourly_rate: rate }),
              ...(taskDesc && { task_description: taskDesc })
            });

          } catch (error) {
            errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        resolve({
          springahead: records,
          ...(errors.length > 0 && { errors })
        });
      });
    });
  }

  private async parsePaychex(content: string): Promise<ParsedData> {
    const records: PaychexRecord[] = [];
    const errors: string[] = [];

    return new Promise((resolve) => {
      parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, data: CsvRow[]) => {
        if (err) {
          resolve({ errors: [`CSV parsing error: ${err.message}`] });
          return;
        }

        for (const [index, row] of data.entries()) {
          try {
            const employee_name = row['Employee'] || row['employee_name'] || row['Employee Name'] || row['Name'];
            const period_start = row['Period Start'] || row['period_start'] || row['Pay Period Start'] || row['pay_period_start'];
            const period_end = row['Period End'] || row['period_end'] || row['Pay Period End'] || row['pay_period_end'];
            
            if (!employee_name) {
              errors.push(`Row ${index + 1}: Missing employee name`);
              continue;
            }

            const gross_pay = this.parseNumber(row['Gross Pay'] || row['gross_pay'] || row['Gross'] || '0');
            const federal_tax = this.parseNumber(row['Federal Tax'] || row['federal_tax'] || row['Fed Tax'] || '0');
            const state_tax = this.parseNumber(row['State Tax'] || row['state_tax'] || row['ST Tax'] || '0');
            const fica_tax = this.parseNumber(row['FICA Tax'] || row['fica_tax'] || row['FICA'] || '0');
            const medicare_tax = this.parseNumber(row['Medicare Tax'] || row['medicare_tax'] || row['Medicare'] || '0');
            const other_deductions = this.parseNumber(row['Other Deductions'] || row['other_deductions'] || row['Deductions'] || '0');
            const benefits_cost = this.parseNumber(row['Benefits'] || row['benefits_cost'] || row['Health Insurance'] || '0');
            const bonuses = this.parseNumber(row['Bonus'] || row['bonuses'] || row['Bonuses'] || '0');
            const net_pay = this.parseNumber(row['Net Pay'] || row['net_pay'] || row['Net'] || '0');

            const empId = row['EmployeeID'] || row['employee_id'] || row['Employee ID'];
            
            // Skip records without valid dates
            if (!period_start || !period_end) {
              errors.push(`Row ${index + 1}: Missing pay period dates for ${employee_name}`);
              continue;
            }

            records.push({
              employee_name: employee_name.trim(),
              ...(empId && { employee_id: empId }),
              pay_period_start: period_start.trim(),
              pay_period_end: period_end.trim(),
              gross_pay,
              federal_tax,
              state_tax,
              fica_tax,
              medicare_tax,
              other_deductions,
              benefits_cost,
              bonuses,
              net_pay
            });

          } catch (error) {
            errors.push(`Row ${index + 1}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        resolve({
          paychex: records,
          ...(errors.length > 0 && { errors })
        });
      });
    });
  }

  private async parseGenericCSV(content: string): Promise<ParsedData> {
    return new Promise((resolve) => {
      parse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true
      }, (err, data) => {
        if (err) {
          resolve({ errors: [`CSV parsing error: ${err.message}`] });
          return;
        }

        resolve({
          raw_data: data as Record<string, unknown>[]
        });
      });
    });
  }

  private parseNumber(value: string): number {
    if (!value) return 0;
    
    // Remove currency symbols and commas
    const cleaned = value.toString().replace(/[$,\s]/g, '');
    const parsed = parseFloat(cleaned);
    
    return isNaN(parsed) ? 0 : parsed;
  }

  static calculateBurden(gross_pay: number, benefits_cost: number = 0): {
    employer_fica: number;
    employer_medicare: number;
    employer_futa: number;
    employer_suta: number;
    total_burden: number;
    burden_rate: number;
  } {
    // 2024 tax rates
    const FICA_RATE = 0.062; // 6.2% (employer portion)
    const MEDICARE_RATE = 0.0145; // 1.45% (employer portion)
    const FUTA_RATE = 0.006; // 0.6% on first $7,000
    const SUTA_RATE = 0.03; // Varies by state, using 3% average

    const FUTA_WAGE_BASE = 7000;
    const SUTA_WAGE_BASE = 10000; // Varies by state

    const employer_fica = gross_pay * FICA_RATE;
    const employer_medicare = gross_pay * MEDICARE_RATE;
    const employer_futa = Math.min(gross_pay, FUTA_WAGE_BASE) * FUTA_RATE;
    const employer_suta = Math.min(gross_pay, SUTA_WAGE_BASE) * SUTA_RATE;

    const total_burden = employer_fica + employer_medicare + employer_futa + employer_suta + benefits_cost;
    const burden_rate = gross_pay > 0 ? total_burden / gross_pay : 0;

    return {
      employer_fica,
      employer_medicare,
      employer_futa,
      employer_suta,
      total_burden,
      burden_rate
    };
  }
}