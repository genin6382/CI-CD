const db = require('./db');
const logger = require('../utils/logger');

const migrations = [
  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE IF NOT EXISTS metrics (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    value DECIMAL NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
  )`,
  
  `CREATE INDEX IF NOT EXISTS idx_metrics_timestamp ON metrics(timestamp)`,
  `CREATE INDEX IF NOT EXISTS idx_metrics_name ON metrics(name)`,
  `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`
];

async function runMigrations() {
  try {
    logger.info('Running database migrations...');
    
    for (let i = 0; i < migrations.length; i++) {
      logger.info(`Running migration ${i + 1}/${migrations.length}`);
      await db.query(migrations[i]);
    }
    
    logger.info('All migrations completed successfully');
    
    // Insert sample data
    await insertSampleData();
    
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  } finally {
    db.end();
  }
}

async function insertSampleData() {
  try {
    // Check if sample users already exist
    const existingUsers = await db.query('SELECT COUNT(*) FROM users');
    
    if (parseInt(existingUsers.rows[0].count) === 0) {
      logger.info('Inserting sample users...');
      
      const sampleUsers = [
        ['John Doe', 'john.doe@example.com'],
        ['Jane Smith', 'jane.smith@example.com'],
        ['Bob Johnson', 'bob.johnson@example.com']
      ];
      
      for (const [name, email] of sampleUsers) {
        await db.query(
          'INSERT INTO users (name, email) VALUES ($1, $2) ON CONFLICT (email) DO NOTHING',
          [name, email]
        );
      }
      
      logger.info('Sample users inserted successfully');
    }
  } catch (error) {
    logger.error('Failed to insert sample data:', error);
  }
}

if (require.main === module) {
  runMigrations();
}

module.exports = { runMigrations };