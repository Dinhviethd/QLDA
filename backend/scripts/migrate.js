const pool = require('../src/config/database');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  try {
    console.log('🔄 Starting migrations...');

    const migrationsDir = path.join(__dirname, '../database/migrations');
    
    // For now, just load the main schema
    const schema = fs.readFileSync(
      path.join(__dirname, '../database/schema.sql'),
      'utf8'
    );

    await pool.query(schema);
    console.log('✅ Migrations completed successfully');

    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
