import Database from 'better-sqlite3';
import crypto from 'crypto';
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
    session_key TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

// Create widget_configs table for per-session widget configuration
const createWidgetConfigTableSQL = `
  CREATE TABLE IF NOT EXISTS widget_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_key TEXT NOT NULL,
    widget_type TEXT NOT NULL,
    skeleton_mode TEXT DEFAULT 'semi',
    min_columns INTEGER DEFAULT 4,
    available_in_random INTEGER DEFAULT 1,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    UNIQUE(session_key, widget_type)
  )
`;

// Create sessions table for persistent sessions (email-based)
const createSessionsTableSQL = `
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    session_key TEXT UNIQUE NOT NULL,
    created_at TEXT NOT NULL,
    expires_at TEXT
  )
`;

// Create user_preferences table for per-user configuration
const createUserPreferencesTableSQL = `
  CREATE TABLE IF NOT EXISTS user_preferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_key TEXT UNIQUE NOT NULL,
    preferences TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`;

try {
  db.exec(createTableSQL);
  console.log('✓ Dashboards table ready');
  db.exec(createWidgetConfigTableSQL);
  console.log('✓ Widget configs table ready');
  db.exec(createSessionsTableSQL);
  console.log('✓ Sessions table ready');
  db.exec(createUserPreferencesTableSQL);
  console.log('✓ User preferences table ready');
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
  const hasSessionKey = tableInfo.some(col => col.name === 'session_key');
  const hasThumbnail = tableInfo.some(col => col.name === 'thumbnail');

  if (!hasAppName) {
    db.exec('ALTER TABLE dashboards ADD COLUMN app_name TEXT');
    console.log('✓ Migration: Added app_name column');
  }

  if (!hasAppCategory) {
    db.exec('ALTER TABLE dashboards ADD COLUMN app_category TEXT');
    console.log('✓ Migration: Added app_category column');
  }

  if (!hasSessionKey) {
    db.exec('ALTER TABLE dashboards ADD COLUMN session_key TEXT');
    console.log('✓ Migration: Added session_key column');
  }

  if (!hasThumbnail) {
    db.exec('ALTER TABLE dashboards ADD COLUMN thumbnail TEXT');
    console.log('✓ Migration: Added thumbnail column');
  }

  // Migration: Add email column to sessions table
  const sessionsInfo = db.prepare("PRAGMA table_info(sessions)").all();
  const hasEmail = sessionsInfo.some(col => col.name === 'email');

  if (!hasEmail) {
    // Need to recreate sessions table with email
    db.exec(`
      CREATE TABLE IF NOT EXISTS sessions_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        session_key TEXT UNIQUE NOT NULL,
        created_at TEXT NOT NULL,
        expires_at TEXT
      )
    `);
    // Copy existing data (generate placeholder emails)
    db.exec(`
      INSERT OR IGNORE INTO sessions_new (email, session_key, created_at, expires_at)
      SELECT 'legacy_' || session_key || '@migrated.local', session_key, created_at, expires_at
      FROM sessions
    `);
    db.exec('DROP TABLE sessions');
    db.exec('ALTER TABLE sessions_new RENAME TO sessions');
    console.log('✓ Migration: Added email column to sessions');
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
 * @param {string} thumbnail - Base64 encoded thumbnail image
 * @returns {object} Created dashboard with id
 */
export function createDashboard(name, data, theme = 'custom', appName = null, appCategory = null, thumbnail = null) {
  try {
    const timestamp = new Date().toISOString();
    const dataJSON = typeof data === 'string' ? data : JSON.stringify(data);

    const stmt = db.prepare(`
      INSERT INTO dashboards (name, data, theme, app_name, app_category, thumbnail, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(name, dataJSON, theme, appName, appCategory, thumbnail, timestamp, timestamp);

    // Normalize field names for frontend compatibility
    return {
      _id: result.lastInsertRowid,  // Map id to _id for frontend compatibility
      name,
      dashboard: JSON.parse(dataJSON),  // Map data to dashboard
      theme,
      appName,  // Camel case for frontend
      appCategory,  // Camel case for frontend
      thumbnail,  // Base64 thumbnail
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
      thumbnail: dashboard.thumbnail,  // Base64 thumbnail
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
      thumbnail: dashboard.thumbnail,  // Base64 thumbnail
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
 * @param {string} thumbnail - Base64 encoded thumbnail image
 * @returns {object|null} Updated dashboard or null if not found
 */
export function updateDashboard(id, name, data, theme, appName = null, appCategory = null, thumbnail = null) {
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
      SET name = ?, data = ?, theme = ?, app_name = ?, app_category = ?, thumbnail = ?, updated_at = ?
      WHERE id = ?
    `);

    stmt.run(name, dataJSON, theme, appName, appCategory, thumbnail, timestamp, id);

    // Normalize field names for frontend compatibility
    return {
      _id: id,  // Map id to _id for frontend compatibility
      name,
      dashboard: JSON.parse(dataJSON),  // Map data to dashboard
      theme,
      appName,  // Camel case for frontend
      appCategory,  // Camel case for frontend
      thumbnail,  // Base64 thumbnail
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

// ========== Widget Config Functions ==========

/**
 * Default widget configurations
 */
const defaultWidgetConfigs = {
  'SimpleKPI': { skeletonMode: 'semi', minColumns: 2, availableInRandom: true },
  'SimpleMetricCard': { skeletonMode: 'semi', minColumns: 3, availableInRandom: true },
  'SimpleScoreCard': { skeletonMode: 'semi', minColumns: 3, availableInRandom: true },
  'SimpleStatusCard': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleComparisonCard': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleProgressBar': { skeletonMode: 'semi', minColumns: 3, availableInRandom: true },
  'SimpleAreaChart': { skeletonMode: 'semi', minColumns: 6, availableInRandom: true },
  'SimpleBarChart': { skeletonMode: 'semi', minColumns: 6, availableInRandom: true },
  'SimpleLineChart': { skeletonMode: 'semi', minColumns: 6, availableInRandom: true },
  'SimplePieChart': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleGaugeChart': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleHeatmap': { skeletonMode: 'full', minColumns: 6, availableInRandom: true },
  'SimpleTable': { skeletonMode: 'semi', minColumns: 6, availableInRandom: true },
  'SimpleAgentList': { skeletonMode: 'full', minColumns: 4, availableInRandom: true },
  'SimpleBadgeList': { skeletonMode: 'semi', minColumns: 3, availableInRandom: true },
  'SimplePriorityList': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleRecentList': { skeletonMode: 'full', minColumns: 4, availableInRandom: true },
  'SimpleStatusList': { skeletonMode: 'semi', minColumns: 4, availableInRandom: true },
  'SimpleTimelineCard': { skeletonMode: 'full', minColumns: 4, availableInRandom: false },
  'SimpleCategoryCards': { skeletonMode: 'semi', minColumns: 6, availableInRandom: true },
};

/**
 * Get widget configs for a session (creates defaults if none exist)
 * @param {string} sessionKey - Session key
 * @returns {object} Widget configurations
 */
export function getWidgetConfigs(sessionKey) {
  try {
    const stmt = db.prepare('SELECT * FROM widget_configs WHERE session_key = ?');
    const rows = stmt.all(sessionKey);

    // If no configs exist for this session, return defaults
    if (rows.length === 0) {
      return defaultWidgetConfigs;
    }

    // Convert rows to config object
    const configs = {};
    for (const row of rows) {
      configs[row.widget_type] = {
        skeletonMode: row.skeleton_mode,
        minColumns: row.min_columns,
        availableInRandom: row.available_in_random === 1,
      };
    }

    // Merge with defaults for any missing widgets
    return { ...defaultWidgetConfigs, ...configs };
  } catch (error) {
    console.error('Error getting widget configs:', error);
    return defaultWidgetConfigs;
  }
}

/**
 * Save widget config for a session
 * @param {string} sessionKey - Session key
 * @param {string} widgetType - Widget type
 * @param {object} config - Configuration { skeletonMode, minColumns, availableInRandom }
 */
export function saveWidgetConfig(sessionKey, widgetType, config) {
  try {
    const timestamp = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO widget_configs (session_key, widget_type, skeleton_mode, min_columns, available_in_random, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_key, widget_type) DO UPDATE SET
        skeleton_mode = excluded.skeleton_mode,
        min_columns = excluded.min_columns,
        available_in_random = excluded.available_in_random,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      sessionKey,
      widgetType,
      config.skeletonMode || 'semi',
      config.minColumns || 4,
      config.availableInRandom !== false ? 1 : 0,
      timestamp,
      timestamp
    );

    return true;
  } catch (error) {
    console.error('Error saving widget config:', error);
    throw new Error(`Failed to save widget config: ${error.message}`);
  }
}

/**
 * Save all widget configs for a session at once
 * @param {string} sessionKey - Session key
 * @param {object} configs - All widget configurations
 */
export function saveAllWidgetConfigs(sessionKey, configs) {
  try {
    const timestamp = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO widget_configs (session_key, widget_type, skeleton_mode, min_columns, available_in_random, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_key, widget_type) DO UPDATE SET
        skeleton_mode = excluded.skeleton_mode,
        min_columns = excluded.min_columns,
        available_in_random = excluded.available_in_random,
        updated_at = excluded.updated_at
    `);

    const transaction = db.transaction((configs) => {
      for (const [widgetType, config] of Object.entries(configs)) {
        stmt.run(
          sessionKey,
          widgetType,
          config.skeletonMode || 'semi',
          config.minColumns || 4,
          config.availableInRandom !== false ? 1 : 0,
          timestamp,
          timestamp
        );
      }
    });

    transaction(configs);
    return true;
  } catch (error) {
    console.error('Error saving all widget configs:', error);
    throw new Error(`Failed to save widget configs: ${error.message}`);
  }
}

/**
 * Get default widget configurations
 * @returns {object} Default widget configurations
 */
export function getDefaultWidgetConfigs() {
  return defaultWidgetConfigs;
}

// ========== Session Functions ==========

/**
 * Login or register by email - returns existing session or creates new one
 * @param {string} email - User email
 * @returns {object} Session { email, session_key, created_at, is_new }
 */
export function loginByEmail(email) {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if session exists for this email
    const existingStmt = db.prepare('SELECT * FROM sessions WHERE email = ?');
    const existing = existingStmt.get(normalizedEmail);

    if (existing) {
      return {
        email: existing.email,
        session_key: existing.session_key,
        created_at: existing.created_at,
        is_new: false,
      };
    }

    // Create new session
    const sessionKey = crypto.randomBytes(32).toString('hex');
    const timestamp = new Date().toISOString();

    const insertStmt = db.prepare(`
      INSERT INTO sessions (email, session_key, created_at)
      VALUES (?, ?, ?)
    `);
    insertStmt.run(normalizedEmail, sessionKey, timestamp);

    console.log(`✓ New session created for: ${normalizedEmail}`);

    return {
      email: normalizedEmail,
      session_key: sessionKey,
      created_at: timestamp,
      is_new: true,
    };
  } catch (error) {
    console.error('Error in loginByEmailSync:', error);
    throw error;
  }
}

/**
 * Get session by email
 * @param {string} email - User email
 * @returns {object|null} Session or null
 */
export function getSessionByEmail(email) {
  try {
    const stmt = db.prepare('SELECT * FROM sessions WHERE email = ?');
    return stmt.get(email.toLowerCase().trim()) || null;
  } catch (error) {
    console.error('Error getting session by email:', error);
    return null;
  }
}

/**
 * Create a session in database (legacy - for backward compatibility)
 * @param {string} sessionKey - Session key
 * @param {string} expiresAt - Expiry timestamp
 */
export function createDbSession(sessionKey, expiresAt) {
  try {
    const timestamp = new Date().toISOString();
    // Generate a placeholder email for legacy sessions
    const placeholderEmail = `legacy_${Date.now()}@temp.local`;
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO sessions (email, session_key, created_at, expires_at)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(placeholderEmail, sessionKey, timestamp, expiresAt);
    return true;
  } catch (error) {
    console.error('Error creating session:', error);
    throw error;
  }
}

/**
 * Validate session from database
 * @param {string} sessionKey - Session key
 * @returns {boolean} True if valid
 */
export function validateDbSession(sessionKey) {
  try {
    const stmt = db.prepare('SELECT * FROM sessions WHERE session_key = ?');
    const session = stmt.get(sessionKey);

    if (!session) return false;

    // Check if expired (only if expires_at is set)
    if (session.expires_at && new Date() > new Date(session.expires_at)) {
      // Delete expired session
      db.prepare('DELETE FROM sessions WHERE session_key = ?').run(sessionKey);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error validating session:', error);
    return false;
  }
}

/**
 * Get session details by key
 * @param {string} sessionKey - Session key
 * @returns {object|null} Session details or null
 */
export function getSessionByKey(sessionKey) {
  try {
    const stmt = db.prepare('SELECT * FROM sessions WHERE session_key = ?');
    return stmt.get(sessionKey) || null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Delete expired sessions
 */
export function cleanupExpiredSessions() {
  try {
    const now = new Date().toISOString();
    const stmt = db.prepare('DELETE FROM sessions WHERE expires_at IS NOT NULL AND expires_at < ?');
    const result = stmt.run(now);
    if (result.changes > 0) {
      console.log(`✓ Cleaned up ${result.changes} expired sessions`);
    }
  } catch (error) {
    console.error('Error cleaning up sessions:', error);
  }
}

// ========== User Preferences Functions ==========

/**
 * Default user preferences based on email
 * @param {string} email - User email
 * @returns {object} Default preferences
 */
function getDefaultPreferences(email) {
  // Aleksander gets full set of predefined badges and themes
  if (email === 'aleksander@kolaboit.pl') {
    return {
      defaultBadgeText: 'Dashboard',
      customBadges: [
        { name: 'ITSM', color: '#9333EA' },
        { name: 'Security', color: '#FFCC24' },
        { name: 'Monitoring', color: '#0078B5' },
        { name: 'AD', color: '#C92133' },
        { name: 'UEM', color: '#00994F' },
        { name: 'Custom', color: '#138D8F' },
      ],
      customThemes: [
        { name: 'ITSM', primary: '#9333EA', primaryLight: '#E9D5FF', primaryDark: '#7E22CE' },
        { name: 'Security', primary: '#FFCC24', primaryLight: '#FEF3C7', primaryDark: '#EAB308' },
        { name: 'Monitoring', primary: '#0078B5', primaryLight: '#BAE6FD', primaryDark: '#0369A1' },
        { name: 'AD', primary: '#C92133', primaryLight: '#FECACA', primaryDark: '#991B1B' },
        { name: 'UEM', primary: '#00994F', primaryLight: '#BBF7D0', primaryDark: '#166534' },
        { name: 'Teal', primary: '#14B8A6', primaryLight: '#CCFBF1', primaryDark: '#0D9488' },
      ],
    };
  }

  // Other users get 3 default editable badges and 3 default editable themes
  return {
    defaultBadgeText: 'Dashboard',
    customBadges: [
      { name: 'Dashboard', color: '#14B8A6' },
      { name: 'Analytics', color: '#3B82F6' },
      { name: 'Reports', color: '#8B5CF6' },
    ],
    customThemes: [
      { name: 'Teal', primary: '#14B8A6', primaryLight: '#CCFBF1', primaryDark: '#0D9488' },
      { name: 'Blue', primary: '#3B82F6', primaryLight: '#DBEAFE', primaryDark: '#2563EB' },
      { name: 'Purple', primary: '#8B5CF6', primaryLight: '#EDE9FE', primaryDark: '#7C3AED' },
    ],
  };
}

/**
 * Get user preferences for a session
 * @param {string} sessionKey - Session key
 * @returns {object} User preferences
 */
export function getUserPreferences(sessionKey) {
  try {
    const stmt = db.prepare('SELECT * FROM user_preferences WHERE session_key = ?');
    const row = stmt.get(sessionKey);

    // Get session to find email
    const session = getSessionByKey(sessionKey);
    const email = session?.email || '';

    if (!row) {
      // Return defaults based on email
      return getDefaultPreferences(email);
    }

    // Parse and merge with defaults
    const savedPrefs = JSON.parse(row.preferences);
    const defaults = getDefaultPreferences(email);

    return { ...defaults, ...savedPrefs };
  } catch (error) {
    console.error('Error getting user preferences:', error);
    // Get session to find email for fallback
    const session = getSessionByKey(sessionKey);
    return getDefaultPreferences(session?.email || '');
  }
}

/**
 * Save user preferences for a session
 * @param {string} sessionKey - Session key
 * @param {object} preferences - User preferences to save
 * @returns {boolean} Success
 */
export function saveUserPreferences(sessionKey, preferences) {
  try {
    const timestamp = new Date().toISOString();
    const prefsJSON = JSON.stringify(preferences);

    const stmt = db.prepare(`
      INSERT INTO user_preferences (session_key, preferences, created_at, updated_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(session_key) DO UPDATE SET
        preferences = excluded.preferences,
        updated_at = excluded.updated_at
    `);

    stmt.run(sessionKey, prefsJSON, timestamp, timestamp);
    return true;
  } catch (error) {
    console.error('Error saving user preferences:', error);
    throw new Error(`Failed to save user preferences: ${error.message}`);
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
