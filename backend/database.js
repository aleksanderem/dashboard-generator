import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get current directory in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database file path
const DB_PATH = join(__dirname, 'dashboards.db');

// Initialize database
let db;
try {
  db = new Database(DB_PATH);
  console.log(`✓ Database connected: ${DB_PATH}`);
} catch (error) {
  console.error('Failed to initialize database:', error);
  throw error;
}

// Create dashboards table
const createTableSQL = `
  CREATE TABLE IF NOT EXISTS dashboards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    data TEXT NOT NULL,
    theme TEXT,
    app_name TEXT,
    app_category TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

try {
  db.exec(createTableSQL);
  console.log('✓ Dashboards table ready');
} catch (error) {
  console.error('Failed to create table:', error);
  throw error;
}

// Migration: Add new columns if they don't exist (for backward compatibility)
try {
  // Check if app_name column exists
  const tableInfo = db.prepare("PRAGMA table_info(dashboards)").all();
  const hasAppName = tableInfo.some(col => col.name === 'app_name');
  const hasAppCategory = tableInfo.some(col => col.name === 'app_category');

  if (!hasAppName) {
    db.exec('ALTER TABLE dashboards ADD COLUMN app_name TEXT');
    console.log('✓ Migration: Added app_name column');
  }

  if (!hasAppCategory) {
    db.exec('ALTER TABLE dashboards ADD COLUMN app_category TEXT');
    console.log('✓ Migration: Added app_category column');
  }
} catch (error) {
  console.error('Migration warning:', error.message);
  // Non-fatal: continue even if migration fails
}

/**
 * Create a new dashboard
 * @param {string} name - Dashboard name
 * @param {object} data - Dashboard configuration (layout + widgets)
 * @param {string} theme - Theme name (itsm, security, monitoring, ad, uem, custom, teal)
 * @param {string} appName - Application title
 * @param {string} appCategory - Application category
 * @returns {object} Created dashboard with id
 */
export function createDashboard(name, data, theme = 'custom', appName = null, appCategory = null) {
  try {
    const timestamp = new Date().toISOString();
    const dataJSON = typeof data === 'string' ? data : JSON.stringify(data);

    const stmt = db.prepare(`
      INSERT INTO dashboards (name, data, theme, app_name, app_category, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, dataJSON, theme, appName, appCategory, timestamp, timestamp);

    // Normalize field names for frontend compatibility
    return {
      _id: result.lastInsertRowid,  // Map id to _id for frontend compatibility
      name,
      dashboard: JSON.parse(dataJSON),  // Map data to dashboard
      theme,
      appName,  // Camel case for frontend
      appCategory,  // Camel case for frontend
      createdAt: timestamp,  // Camel case for frontend
      updatedAt: timestamp
    };
  } catch (error) {
    console.error('Error creating dashboard:', error);
    throw new Error(`Failed to create dashboard: ${error.message}`);
  }
}

/**
 * Get all dashboards
 * @returns {array} Array of all dashboards
 */
export function getAllDashboards() {
  try {
    const stmt = db.prepare('SELECT * FROM dashboards ORDER BY updated_at DESC');
    const dashboards = stmt.all();

    // Parse JSON data for each dashboard and normalize field names
    return dashboards.map(dashboard => ({
      _id: dashboard.id,  // Map id to _id for frontend compatibility
      name: dashboard.name,
      dashboard: JSON.parse(dashboard.data),  // Map data to dashboard
      theme: dashboard.theme,
      appName: dashboard.app_name,  // Camel case for frontend
      appCategory: dashboard.app_category,  // Camel case for frontend
      createdAt: dashboard.created_at,  // Camel case for frontend
      updatedAt: dashboard.updated_at
    }));
  } catch (error) {
    console.error('Error getting all dashboards:', error);
    throw new Error(`Failed to get dashboards: ${error.message}`);
  }
}

/**
 * Get dashboard by ID
 * @param {number} id - Dashboard ID
 * @returns {object|null} Dashboard object or null if not found
 */
export function getDashboardById(id) {
  try {
    const stmt = db.prepare('SELECT * FROM dashboards WHERE id = ?');
    const dashboard = stmt.get(id);

    if (!dashboard) {
      return null;
    }

    // Normalize field names for frontend compatibility
    return {
      _id: dashboard.id,  // Map id to _id for frontend compatibility
      name: dashboard.name,
      dashboard: JSON.parse(dashboard.data),  // Map data to dashboard
      theme: dashboard.theme,
      appName: dashboard.app_name,  // Camel case for frontend
      appCategory: dashboard.app_category,  // Camel case for frontend
      createdAt: dashboard.created_at,  // Camel case for frontend
      updatedAt: dashboard.updated_at
    };
  } catch (error) {
    console.error('Error getting dashboard by ID:', error);
    throw new Error(`Failed to get dashboard: ${error.message}`);
  }
}

/**
 * Update an existing dashboard
 * @param {number} id - Dashboard ID
 * @param {string} name - New dashboard name
 * @param {object} data - New dashboard configuration
 * @param {string} theme - New theme name
 * @param {string} appName - Application title
 * @param {string} appCategory - Application category
 * @returns {object|null} Updated dashboard or null if not found
 */
export function updateDashboard(id, name, data, theme, appName = null, appCategory = null) {
  try {
    // Check if dashboard exists
    const existing = getDashboardById(id);
    if (!existing) {
      return null;
    }

    const timestamp = new Date().toISOString();
    const dataJSON = typeof data === 'string' ? data : JSON.stringify(data);

    const stmt = db.prepare(`
      UPDATE dashboards
      SET name = ?, data = ?, theme = ?, app_name = ?, app_category = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(name, dataJSON, theme, appName, appCategory, timestamp, id);

    // Normalize field names for frontend compatibility
    return {
      _id: id,  // Map id to _id for frontend compatibility
      name,
      dashboard: JSON.parse(dataJSON),  // Map data to dashboard
      theme,
      appName,  // Camel case for frontend
      appCategory,  // Camel case for frontend
      createdAt: existing.createdAt,  // Camel case for frontend
      updatedAt: timestamp
    };
  } catch (error) {
    console.error('Error updating dashboard:', error);
    throw new Error(`Failed to update dashboard: ${error.message}`);
  }
}

/**
 * Delete a dashboard
 * @param {number} id - Dashboard ID
 * @returns {boolean} True if deleted, false if not found
 */
export function deleteDashboard(id) {
  try {
    const stmt = db.prepare('DELETE FROM dashboards WHERE id = ?');
    const result = stmt.run(id);

    return result.changes > 0;
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    throw new Error(`Failed to delete dashboard: ${error.message}`);
  }
}

/**
 * Close database connection (for cleanup)
 */
export function closeDatabase() {
  try {
    db.close();
    console.log('✓ Database connection closed');
  } catch (error) {
    console.error('Error closing database:', error);
  }
}

// Graceful shutdown
process.on('SIGINT', () => {
  closeDatabase();
  process.exit(0);
});

process.on('SIGTERM', () => {
  closeDatabase();
  process.exit(0);
});

console.log('✓ Database module initialized successfully');
