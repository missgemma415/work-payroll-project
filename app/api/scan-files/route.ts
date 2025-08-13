
import { promises as fs } from 'fs';
import path from 'path';

import { NextResponse } from 'next/server';
import { query } from '@/lib/database';

import type { NextRequest} from 'next/server';

interface FileInfo {
  filename: string;
  type: string;
  size: number;
  lastModified: Date;
  processed: boolean;
}

export async function GET() {
  try {
    const payrollFolderPath = path.join(process.cwd(), 'payroll-files-only');
    
    // Check if folder exists
    try {
      await fs.access(payrollFolderPath);
    } catch {
      return NextResponse.json({
        success: false,
        error: 'payroll-files-only folder not found',
        path: payrollFolderPath,
        files: []
      });
    }

    // Read directory contents
    const files = await fs.readdir(payrollFolderPath);
    
    const fileInfos: FileInfo[] = [];
    
    for (const filename of files) {
      // Skip hidden files and directories
      if (filename.startsWith('.')) continue;
      
      const filePath = path.join(payrollFolderPath, filename);
      const stats = await fs.stat(filePath);
      
      // Only process files (not directories)
      if (!stats.isFile()) continue;
      
      // Determine file type based on filename patterns
      let type = 'unknown';
      const lowerFilename = filename.toLowerCase();
      
      if (lowerFilename.includes('springahead') || lowerFilename.includes('spring_ahead')) {
        type = 'springahead';
      } else if (lowerFilename.includes('paychex')) {
        type = 'paychex';
      } else if (lowerFilename.includes('quickbooks') || lowerFilename.includes('qb')) {
        type = 'quickbooks';
      } else if (lowerFilename.includes('service') || lowerFilename.includes('customer')) {
        type = 'service_metrics';
      } else if (lowerFilename.endsWith('.csv')) {
        type = 'csv';
      } else if (lowerFilename.endsWith('.xlsx') || lowerFilename.endsWith('.xls')) {
        type = 'excel';
      } else if (lowerFilename.endsWith('.pdf')) {
        type = 'pdf';
      }
      
      // Check if file has been processed
      const processedFiles = await query(
        'SELECT status FROM imported_files WHERE filename = $1',
        [filename]
      );
      
      const isProcessed = processedFiles.length > 0 && 
        (processedFiles[0] as { status: string }).status === 'completed';
      
      fileInfos.push({
        filename,
        type,
        size: stats.size,
        lastModified: stats.mtime,
        processed: isProcessed
      });
    }
    
    // Sort by last modified (newest first)
    fileInfos.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime());
    
    return NextResponse.json({
      success: true,
      path: payrollFolderPath,
      totalFiles: fileInfos.length,
      files: fileInfos
    });
    
  } catch (error) {
    console.error('Error scanning files:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to scan files',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { filename } = await request.json();
    
    if (!filename) {
      return NextResponse.json({
        success: false,
        error: 'Filename is required'
      }, { status: 400 });
    }
    
    // TODO: Mark file as processed in database
    // This endpoint can be used to update file processing status
    
    return NextResponse.json({
      success: true,
      message: `File ${filename} marked as processed`
    });
    
  } catch (error) {
    console.error('Error updating file status:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update file status'
    }, { status: 500 });
  }
}