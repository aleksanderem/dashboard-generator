import crypto from 'crypto';
import { createDbSession, validateDbSession, cleanupExpiredSessions } from './database.js';

// Session expiry time (7 days for persistent sessions)
const SESSION_EXPIRY = 7 * 24 * 60 * 60 * 1000;

/**
 * Generate a new session (stored in database)
 * @returns {Object} Session object with session_key and created_at
 */
export function createSession() {
  const sessionKey = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY).toISOString();

  // Save to database
  createDbSession(sessionKey, expiresAt);

  return {
    session_key: sessionKey,
    expires_at: expiresAt,
  };
}

/**
 * Validate a session key (checks database)
 * @param {string} sessionKey - Session key to validate
 * @returns {boolean} True if session is valid
 */
export function validateSession(sessionKey) {
  if (!sessionKey) return false;
  return validateDbSession(sessionKey);
}

/**
 * Get all active sessions count (from database)
 * @returns {number} Number of active sessions
 */
export function getActiveSessionsCount() {
  // This would need a DB query, for now return 0
  return 0;
}

// Run cleanup every hour
setInterval(() => {
  cleanupExpiredSessions();
}, 60 * 60 * 1000);
