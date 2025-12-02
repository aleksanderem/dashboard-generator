/**
 * API Helper Functions for Dashboard Management
 */

const API_BASE_URL = '/api';

/**
 * Fetch saved dashboards with optional pagination
 * @param {number} limit - Maximum number of dashboards to return (0 = all)
 * @param {number} offset - Number of dashboards to skip
 * @returns {Promise<Object>} Object with dashboards array and pagination info
 */
export async function fetchDashboards(limit = 0, offset = 0) {
  const params = new URLSearchParams();
  if (limit > 0) params.append('limit', limit);
  if (offset > 0) params.append('offset', offset);

  const url = params.toString()
    ? `${API_BASE_URL}/dashboards?${params}`
    : `${API_BASE_URL}/dashboards`;

  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch dashboards');
  const data = await response.json();

  return {
    dashboards: data.dashboards,
    pagination: data.pagination
  };
}

/**
 * Fetch a single dashboard by ID
 * @param {string|number} id - Dashboard ID
 * @returns {Promise<Object>} Dashboard object
 */
export async function fetchDashboardById(id) {
  console.log(`[API] fetchDashboardById called with ID: ${id} (type: ${typeof id})`);
  const url = `${API_BASE_URL}/dashboards/${id}`;
  console.log(`[API] Fetching from URL: ${url}`);

  const response = await fetch(url);
  console.log(`[API] Response status: ${response.status} ${response.statusText}`);

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API] Error response:`, errorText);
    throw new Error('Dashboard not found');
  }

  const data = await response.json();
  console.log(`[API] Response data structure:`, JSON.stringify({
    success: data.success,
    hasDashboard: !!data.dashboard,
    dashboardId: data.dashboard?._id,
    dashboardName: data.dashboard?.name
  }, null, 2));

  return data.dashboard;
}

/**
 * Delete a dashboard by ID
 * @param {string} id - Dashboard ID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteDashboard(id) {
  const response = await fetch(`${API_BASE_URL}/dashboards/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) throw new Error('Failed to delete dashboard');
  return true;
}

/**
 * Save a new dashboard
 * @param {string} name - Dashboard name
 * @param {Object} dashboard - Dashboard data
 * @param {string} theme - Theme name
 * @param {string} appName - Application name
 * @param {string} appCategory - Application category
 * @param {string} thumbnail - Base64 encoded thumbnail image
 * @returns {Promise<Object>} Saved dashboard object
 */
export async function saveDashboard(name, dashboard, theme, appName, appCategory, thumbnail) {
  console.log('saveDashboard called with:', { name, nameType: typeof name, nameLength: name?.length, theme, appName, appCategory, hasThumbnail: !!thumbnail });
  const payload = { name, dashboard, theme, appName, appCategory, thumbnail };
  console.log('Request payload:', JSON.stringify({ ...payload, thumbnail: thumbnail ? `${thumbnail.length} chars` : null }, null, 2));

  const response = await fetch(`${API_BASE_URL}/dashboards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || errorData.message || 'Failed to save dashboard');
  }
  const data = await response.json();
  return data.dashboard;
}

/**
 * Update an existing dashboard
 * @param {string} id - Dashboard ID
 * @param {string} name - Dashboard name
 * @param {Object} dashboard - Dashboard data
 * @param {string} theme - Theme name
 * @param {string} appName - Application name
 * @param {string} appCategory - Application category
 * @param {string} thumbnail - Base64 encoded thumbnail image
 * @returns {Promise<Object>} Updated dashboard object
 */
export async function updateDashboard(id, name, dashboard, theme, appName, appCategory, thumbnail) {
  console.log('updateDashboard called with:', { id, name, theme, appName, appCategory, hasThumbnail: !!thumbnail });
  const response = await fetch(`${API_BASE_URL}/dashboards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, dashboard, theme, appName, appCategory, thumbnail })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || errorData.message || 'Failed to update dashboard');
  }
  const data = await response.json();
  return data.dashboard;
}
