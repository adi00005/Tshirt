// scripts/backupDatabase.js
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import { logInfo, logError, logSuccess } from '../src/utils/logger.js';

// Load environment variables
dotenv.config();

// Get directory name in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const BACKUP_DIR = path.join(__dirname, '../backups');
const MAX_BACKUPS = 7; // Keep last 7 days of backups
const MONGODB_URI = process.env.MONGO_URI;

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

/**
 * Create a timestamp for the backup filename
 */
function getTimestamp() {
  const now = new Date();
  return now.toISOString()
    .replace(/[:.]/g, '-')
    .replace('T', '_')
    .slice(0, -5); // Remove milliseconds
}

/**
 * Parse MongoDB connection string to get database name
 */
function getDatabaseName() {
  try {
    const dbName = MONGODB_URI.split('/').pop().split('?')[0];
    return dbName || 'tshirt-shop';
  } catch (error) {
    logError('Error parsing database name from URI', { error: error.message });
    return 'tshirt-shop';
  }
}

/**
 * Create a backup of the MongoDB database
 */
function createBackup() {
  const timestamp = getTimestamp();
  const dbName = getDatabaseName();
  const backupName = `${dbName}-${timestamp}.gz`;
  const backupPath = path.join(BACKUP_DIR, backupName);
  
  logInfo(`Starting backup of database: ${dbName}`);
  
  // Create mongodump command
  const command = `mongodump --uri="${MONGODB_URI}" --archive="${backupPath}" --gzip`;
  
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        logError('Backup failed', { 
          error: error.message,
          stderr: stderr.toString()
        });
        return reject(error);
      }
      
      logSuccess(`Backup created successfully: ${backupPath}`, {
        size: `${(fs.statSync(backupPath).size / (1024 * 1024)).toFixed(2)} MB`
      });
      
      resolve(backupPath);
    });
  });
}

/**
 * Remove old backups, keeping only the most recent MAX_BACKUPS
 */
function cleanupOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.gz'))
      .map(file => ({
        name: file,
        time: fs.statSync(path.join(BACKUP_DIR, file)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);
    
    if (files.length <= MAX_BACKUPS) {
      logInfo('No old backups to clean up');
      return;
    }
    
    const filesToDelete = files.slice(MAX_BACKUPS);
    
    filesToDelete.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file.name);
      fs.unlinkSync(filePath);
      logInfo(`Removed old backup: ${file.name}`);
    });
    
    logInfo(`Cleaned up ${filesToDelete.length} old backup(s)`);
  } catch (error) {
    logError('Error cleaning up old backups', { error: error.message });
  }
}

// Main function
async function runBackup() {
  try {
    if (!MONGODB_URI) {
      throw new Error('MongoDB connection string (MONGO_URI) is not defined');
    }
    
    await createBackup();
    cleanupOldBackups();
    
    logSuccess('Backup process completed successfully');
    process.exit(0);
  } catch (error) {
    logError('Backup process failed', { error: error.message });
    process.exit(1);
  }
}

// Run the backup
runBackup();
