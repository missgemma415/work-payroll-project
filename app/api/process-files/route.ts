
import { promises as fs } from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';
import { z } from 'zod';

import { query } from '@/lib/database/connection';
import type { SpringAheadRecord, PaychexRecord } from '@/lib/parsers/csv-parser';
import { CSVParser } from '@/lib/parsers/csv-parser';

import type { NextRequest} from 'next/server';

const processRequestSchema = z.object({
  filename: z.string().optional(),
  force: z.boolean().default(false)
});

interface ProcessingResult {
  filename: string;
  status: 'success' | 'error' | 'skipped';
  recordsProcessed: number;
  errors?: string[];
  timeTaken: number;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    const body = await request.json();
    const { filename, force } = processRequestSchema.parse(body);
    
    const payrollFolderPath = path.join(process.cwd(), '..', 'payroll-files-only');
    
    // Check if folder exists
    try {
      await fs.access(payrollFolderPath);
    } catch (error) {
      return NextResponse.json({
        success: false,
        error: 'payroll-files-only folder not found',
        path: payrollFolderPath
      }, { status: 404 });
    }

    const results: ProcessingResult[] = [];
    
    if (filename) {
      // Process specific file
      const result = await processFile(payrollFolderPath, filename, force);
      results.push(result);
    } else {
      // Process all unprocessed files
      const files = await fs.readdir(payrollFolderPath);
      
      for (const file of files) {
        if (file.startsWith('.')) continue; // Skip hidden files
        
        const filePath = path.join(payrollFolderPath, file);
        const stats = await fs.stat(filePath);
        
        if (!stats.isFile()) continue; // Skip directories
        
        // Check if file is already processed (unless force = true)
        if (!force) {
          const existingFile = await query(
            'SELECT id FROM imported_files WHERE filename = $1 AND status = $2',
            [file, 'completed']
          );
          
          if (existingFile.length > 0) {
            results.push({
              filename: file,
              status: 'skipped',
              recordsProcessed: 0,
              timeTaken: 0
            });
            continue;
          }
        }
        
        const result = await processFile(payrollFolderPath, file, force);
        results.push(result);
      }
    }
    
    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'success').length;
    const errorCount = results.filter(r => r.status === 'error').length;
    const skippedCount = results.filter(r => r.status === 'skipped').length;
    const totalRecords = results.reduce((sum, r) => sum + r.recordsProcessed, 0);
    
    return NextResponse.json({
      success: true,
      summary: {
        totalFiles: results.length,
        successful: successCount,
        errors: errorCount,
        skipped: skippedCount,
        totalRecords,
        timeTaken: totalTime
      },
      results
    });
    
  } catch (error) {
    console.error('Error processing files:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to process files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

async function processFile(folderPath: string, filename: string, _force: boolean = false): Promise<ProcessingResult> {
  const startTime = Date.now();
  
  try {
    const filePath = path.join(folderPath, filename);
    const stats = await fs.stat(filePath);
    
    // Determine file type
    const lowerFilename = filename.toLowerCase();
    let fileType = 'unknown';
    
    if (lowerFilename.includes('springahead') || lowerFilename.includes('spring_ahead')) {
      fileType = 'springahead';
    } else if (lowerFilename.includes('paychex')) {
      fileType = 'paychex';
    } else if (lowerFilename.includes('quickbooks') || lowerFilename.includes('qb')) {
      fileType = 'quickbooks';
    } else if (lowerFilename.endsWith('.csv')) {
      // Try to guess from content or default to generic CSV
      fileType = 'csv';
    }
    
    // Record file import attempt
    const fileRecord = await query(
      `INSERT INTO imported_files (filename, file_type, file_size, status) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (filename) DO UPDATE SET 
         status = $4, updated_at = NOW()
       RETURNING id`,
      [filename, fileType, stats.size, 'processing']
    );
    
    const fileId = (fileRecord[0] as any).id;
    
    try {
      // Parse the file
      const parser = new CSVParser();
      const parsedData = await parser.parseFile(filePath, fileType);
      
      if (parsedData.errors && parsedData.errors.length > 0) {
        await query(
          'UPDATE imported_files SET status = $1, error_message = $2 WHERE id = $3',
          ['failed', parsedData.errors.join('; '), fileId]
        );
        
        return {
          filename,
          status: 'error',
          recordsProcessed: 0,
          errors: parsedData.errors,
          timeTaken: Date.now() - startTime
        };
      }
      
      let recordsProcessed = 0;
      
      // Process SpringAhead data
      if (parsedData.springahead) {
        for (const record of parsedData.springahead) {
          await insertSpringAheadRecord(fileId, record);
          recordsProcessed++;
        }
      }
      
      // Process Paychex data
      if (parsedData.paychex) {
        for (const record of parsedData.paychex) {
          await insertPaychexRecord(fileId, record);
          recordsProcessed++;
        }
      }
      
      // Process raw data (for unknown file types)
      if (parsedData.raw_data) {
        recordsProcessed = parsedData.raw_data.length;
        // Store raw data for manual review
      }
      
      // Update file status
      await query(
        'UPDATE imported_files SET status = $1, records_processed = $2, processed_at = NOW() WHERE id = $3',
        ['completed', recordsProcessed, fileId]
      );
      
      // Trigger cost calculations
      await calculateEmployeeCosts();
      
      return {
        filename,
        status: 'success',
        recordsProcessed,
        timeTaken: Date.now() - startTime
      };
      
    } catch (processingError) {
      await query(
        'UPDATE imported_files SET status = $1, error_message = $2 WHERE id = $3',
        ['failed', processingError instanceof Error ? processingError.message : 'Processing failed', fileId]
      );
      
      throw processingError;
    }
    
  } catch (error) {
    return {
      filename,
      status: 'error',
      recordsProcessed: 0,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
      timeTaken: Date.now() - startTime
    };
  }
}

async function insertSpringAheadRecord(fileId: string, record: SpringAheadRecord): Promise<void> {
  // Ensure project exists
  await query(
    `INSERT INTO projects (project_identifier, client_name, status) 
     VALUES ($1, $1, 'active') 
     ON CONFLICT (project_identifier) DO NOTHING`,
    [record.project_identifier]
  );
  
  // Insert payroll data
  await query(
    `INSERT INTO payroll_data (
      imported_file_id, source_type, employee_name, employee_id, project_identifier,
      work_date, hours_worked, hourly_rate
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      fileId,
      'springahead',
      record.employee_name,
      record.employee_id,
      record.project_identifier,
      record.date,
      record.hours,
      record.hourly_rate
    ]
  );
}

async function insertPaychexRecord(fileId: string, record: PaychexRecord): Promise<void> {
  // Calculate burden
  const burden = CSVParser.calculateBurden(record.gross_pay, record.benefits_cost);
  const trueCost = record.gross_pay + burden.total_burden;
  
  // Insert payroll data
  await query(
    `INSERT INTO payroll_data (
      imported_file_id, source_type, employee_name, employee_id,
      pay_period_start, pay_period_end, gross_pay, federal_tax, state_tax,
      fica_tax, medicare_tax, other_deductions, employer_fica, employer_medicare,
      employer_futa, employer_suta, benefits_cost, bonuses, net_pay,
      total_burden, true_cost, burden_rate
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)`,
    [
      fileId,
      'paychex',
      record.employee_name,
      record.employee_id,
      record.pay_period_start,
      record.pay_period_end,
      record.gross_pay,
      record.federal_tax,
      record.state_tax,
      record.fica_tax,
      record.medicare_tax,
      record.other_deductions,
      burden.employer_fica,
      burden.employer_medicare,
      burden.employer_futa,
      burden.employer_suta,
      record.benefits_cost,
      record.bonuses,
      record.net_pay,
      burden.total_burden,
      trueCost,
      burden.burden_rate
    ]
  );
}

async function calculateEmployeeCosts(): Promise<void> {
  // Aggregate costs by employee and month
  await query(`
    INSERT INTO employee_costs (
      employee_name, period_start, period_end,
      total_hours, gross_pay, total_taxes, total_benefits,
      total_employer_burden, total_true_cost, burden_rate,
      project_allocations
    )
    SELECT 
      employee_name,
      DATE_TRUNC('month', COALESCE(work_date, pay_period_start::date))::date as period_start,
      (DATE_TRUNC('month', COALESCE(work_date, pay_period_start::date)) + INTERVAL '1 month - 1 day')::date as period_end,
      COALESCE(SUM(hours_worked), 0) as total_hours,
      COALESCE(SUM(gross_pay), 0) as gross_pay,
      COALESCE(SUM(federal_tax + state_tax + fica_tax + medicare_tax), 0) as total_taxes,
      COALESCE(SUM(benefits_cost), 0) as total_benefits,
      COALESCE(SUM(total_burden), 0) as total_employer_burden,
      COALESCE(SUM(true_cost), 0) as total_true_cost,
      CASE WHEN SUM(gross_pay) > 0 THEN SUM(total_burden) / SUM(gross_pay) ELSE 0 END as burden_rate,
      json_object_agg(
        COALESCE(project_identifier, 'UNKNOWN'), 
        COALESCE(SUM(hours_worked), 0)
      ) FILTER (WHERE project_identifier IS NOT NULL) as project_allocations
    FROM payroll_data
    GROUP BY employee_name, DATE_TRUNC('month', COALESCE(work_date, pay_period_start::date))
    ON CONFLICT (employee_name, period_start, period_end) 
    DO UPDATE SET
      total_hours = EXCLUDED.total_hours,
      gross_pay = EXCLUDED.gross_pay,
      total_taxes = EXCLUDED.total_taxes,
      total_benefits = EXCLUDED.total_benefits,
      total_employer_burden = EXCLUDED.total_employer_burden,
      total_true_cost = EXCLUDED.total_true_cost,
      burden_rate = EXCLUDED.burden_rate,
      project_allocations = EXCLUDED.project_allocations,
      updated_at = NOW()
  `);
}

export async function GET() {
  try {
    // Return processing status and recent files
    const recentFiles = await query(`
      SELECT filename, file_type, status, records_processed, 
             error_message, processed_at, created_at
      FROM imported_files
      ORDER BY created_at DESC
      LIMIT 10
    `);
    
    const summary = await query(`
      SELECT 
        COUNT(*) as total_files,
        COUNT(*) FILTER (WHERE status = 'completed') as completed_files,
        COUNT(*) FILTER (WHERE status = 'failed') as failed_files,
        COUNT(*) FILTER (WHERE status = 'processing') as processing_files,
        COALESCE(SUM(records_processed), 0) as total_records
      FROM imported_files
    `);
    
    return NextResponse.json({
      success: true,
      summary: summary[0] || {},
      recentFiles: recentFiles
    });
    
  } catch (error) {
    console.error('Error getting processing status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to get processing status'
    }, { status: 500 });
  }
}