import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';
import { db, queryClient } from '../client';

// Seed files in execution order
const SEED_FILES = [
  'models_rows.sql',
  'diseases_rows.sql', 
  'lesions_rows.sql',
  'lesion_disease_link_rows.sql',
  'prediction_class_disease_rows.sql',
  'prediction_class_lesion_rows.sql'
];

// Drop tables in reverse order (to handle foreign key constraints)
// First drop tables that depend on predictions, then predictions themselves,
// then tables that depend on models/diseases/lesions, and finally the seed tables
const DROP_TABLES = [
  'classification_feedback',
  'detection_feedback',
  'classifications',
  'detections',
  'predictions',
  'prediction_requests',
  'prediction_sharing',
  'prediction_class_lesion',
  'prediction_class_disease', 
  'lesion_disease_link',
  'lesions',
  'diseases',
  'models'
];

async function executeSqlFile(filename: string): Promise<void> {
  console.log(`Executing seed file: ${filename}...`);
  const filePath = join(__dirname, filename);
  const content = readFileSync(filePath, 'utf-8');
  
  if (!content.trim()) {
    console.log(`Skipping empty file: ${filename}`);
    return;
  }

  const statements = content.split(';').filter(stmt => stmt.trim());
  
  for (const statement of statements) {
    if (statement.trim()) {
      await db.execute(sql.raw(statement));
    }
  }
  console.log(`Finished executing ${filename}`);
}

async function main() {
  try {
    console.log('Starting seed process...');
    
    // Truncate existing tables
    for (const table of DROP_TABLES) {
      try {
        console.log(`Truncating table: ${table}...`);
        await db.execute(sql`TRUNCATE TABLE ${sql.identifier(table)} CASCADE`);
      } catch (error) {
        console.log(`Table ${table} might not exist or error truncating:`, error);
      }
    }

    console.log('Waiting 5 seconds after truncate...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
    console.log('Resuming after wait...');

    // Execute seed files in order
    for (const filename of SEED_FILES) {
      await executeSqlFile(filename);
    }

    console.log('Seed process completed successfully.');
  } catch (error) {
    console.error('Seed Init Error:', error);
    process.exit(1);
  } finally {
    console.log('Closing database connection...');
    await queryClient.end();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

main();