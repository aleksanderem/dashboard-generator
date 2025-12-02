const SESSION_KEY = 'dashboard_session_key';
const SESSION_EMAIL = 'dashboard_session_email';
const SESSION_CREATED = 'dashboard_session_created';

// In-memory fallback when localStorage is blocked (e.g., in iframe)
const memoryStorage = {};

function safeGetItem(key) {
  try {
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('[Session] localStorage blocked, using memory storage');
    return memoryStorage[key] || null;
  }
}

function safeSetItem(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    console.warn('[Session] localStorage blocked, using memory storage');
    memoryStorage[key] = value;
  }
}

function safeRemoveItem(key) {
  try {
    localStorage.removeItem(key);
  } catch (e) {
    delete memoryStorage[key];
  }
}

/**
 * Get current session key from localStorage
 * @returns {string|null} Session key or null
 */
export function getSessionKey() {
  return safeGetItem(SESSION_KEY);
}

/**
 * Get current session email from localStorage
 * @returns {string|null} Email or null
 */
export function getSessionEmail() {
  return safeGetItem(SESSION_EMAIL);
}

/**
 * Get full session info
 * @returns {object|null} Session info or null
 */
export function getSession() {
  const key = safeGetItem(SESSION_KEY);
  const email = safeGetItem(SESSION_EMAIL);
  const createdAt = safeGetItem(SESSION_CREATED);

  if (!key || !email) return null;

  return { session_key: key, email, created_at: createdAt };
}

/**
 * Check if user is logged in
 * @returns {boolean}
 */
export function isLoggedIn() {
  return !!getSessionKey() && !!getSessionEmail();
}

/**
 * Save session to localStorage
 * @param {string} sessionKey - Session key
 * @param {string} email - User email
 * @param {string} createdAt - Creation date
 */
export function saveSession(sessionKey, email, createdAt) {
  safeSetItem(SESSION_KEY, sessionKey);
  safeSetItem(SESSION_EMAIL, email);
  safeSetItem(SESSION_CREATED, createdAt || new Date().toISOString());
}

/**
 * Clear session from localStorage (logout)
 */
export function clearSession() {
  safeRemoveItem(SESSION_KEY);
  safeRemoveItem(SESSION_EMAIL);
  safeRemoveItem(SESSION_CREATED);
}

/**
 * Login by email - returns existing session or creates new one
 * @param {string} email - User email
 * @returns {Promise<object>} Session { session_key, email, is_new }
 */
export async function loginByEmail(email) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to login');
  }

  const data = await response.json();
  saveSession(data.session.session_key, data.session.email, data.session.created_at);

  return {
    session_key: data.session.session_key,
    email: data.session.email,
    is_new: data.is_new,
  };
}

/**
 * Ensure user has valid session
 * @returns {Promise<string>} Session key
 * @throws {Error} If not logged in
 */
export async function ensureSession() {
  const sessionKey = getSessionKey();

  if (!sessionKey) {
    throw new Error('Not logged in');
  }

  return sessionKey;
}

/**
 * Handle API call with automatic session renewal on invalid session
 * @param {Function} apiCall - Function that makes the API call
 * @returns {Promise<any>} API response
 */
async function withSessionRetry(apiCall) {
  try {
    return await apiCall();
  } catch (error) {
    // If session is invalid, clear it and retry with new session
    if (error.message && (error.message.includes('session') || error.message.includes('Session'))) {
      console.log('Session invalid, creating new session...');
      clearSession();
      await createNewSession();
      return await apiCall();
    }
    throw error;
  }
}

/**
 * Generate random dashboard from layout preset
 * @param {string} preset - Preset key (e.g., '2+2', '3+1')
 * @param {number} minWidthCols - Minimum widget width in columns (1, 2, or 3)
 * @returns {Promise<Object>} Dashboard data
 */
export async function generateRandomDashboard(preset, minWidthCols = 1) {
  const sessionKey = await ensureSession();

  try {
    const response = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      body: JSON.stringify({ preset, minWidthCols }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate dashboard');
    }

    const data = await response.json();
    return data.dashboard;
  } catch (error) {
    console.error('Error generating dashboard:', error);
    throw error;
  }
}

/**
 * Get widget configuration for current session
 * @returns {Promise<Object>} Widget config { widgetType: { skeletonMode, minColumns, availableInRandom } }
 */
export async function getWidgetConfig() {
  return withSessionRetry(async () => {
    const sessionKey = await ensureSession();
    const response = await fetch('/api/widgets/config', {
      headers: {
        'X-Session-Key': sessionKey,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch widget config');
    }
    const data = await response.json();
    return data.config;
  });
}

/**
 * Save widget configuration for current session
 * @param {Object} config - Widget config { widgetType: { skeletonMode, minColumns, availableInRandom } }
 * @returns {Promise<boolean>} Success
 */
export async function saveWidgetConfig(config) {
  return withSessionRetry(async () => {
    const sessionKey = await ensureSession();
    const response = await fetch('/api/widgets/config', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      body: JSON.stringify({ config }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save widget config');
    }

    return true;
  });
}

/**
 * Generate dashboard using bin-packing with session widget config
 * @param {number} widgetCount - Number of widgets to generate
 * @returns {Promise<Object>} Dashboard data
 */
export async function generatePackedDashboard(widgetCount = 6) {
  return withSessionRetry(async () => {
    const sessionKey = await ensureSession();
    const response = await fetch('/api/generate/packed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      body: JSON.stringify({ widgetCount }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to generate dashboard');
    }

    const data = await response.json();
    return data.dashboard;
  });
}

/**
 * Get user preferences for current session
 * @returns {Promise<Object>} User preferences
 */
export async function getUserPreferences() {
  return withSessionRetry(async () => {
    const sessionKey = await ensureSession();
    const response = await fetch('/api/user/preferences', {
      headers: {
        'X-Session-Key': sessionKey,
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user preferences');
    }
    const data = await response.json();
    return data.preferences;
  });
}

/**
 * Save user preferences for current session
 * @param {Object} preferences - User preferences
 * @returns {Promise<boolean>} Success
 */
export async function saveUserPreferences(preferences) {
  return withSessionRetry(async () => {
    const sessionKey = await ensureSession();
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      body: JSON.stringify({ preferences }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to save user preferences');
    }

    return true;
  });
}
