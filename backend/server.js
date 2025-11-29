import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { analyzeDashboard } from './claude-analyzer.js';
import { mapWidgets } from './widget-mapper.js';
import { generateLayout } from './layout-generator.js';
import { createDashboard, getAllDashboards, getDashboardById, updateDashboard, deleteDashboard, getWidgetConfigs, saveAllWidgetConfigs, getDefaultWidgetConfigs, loginByEmail, getSessionByKey, getUserPreferences, saveUserPreferences } from './database.js';
import { renderDashboard } from './render.js';
import { createSession, validateSession, getActiveSessionsCount } from './session-manager.js';
import { generateRandomDashboard, getLayoutPresets, getWidgetConfig, generateBinPackedDashboard } from './random-generator.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configure multer for image uploads (in-memory storage)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Middleware
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || 'http://localhost:5173',
}));
app.use(express.json({ limit: '50mb' }));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dashboard AI Generator API is running' });
});

// Main endpoint: Analyze dashboard screenshot
app.post('/api/analyze', upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No screenshot provided' });
    }

    console.log('Received screenshot:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // Step 1: Analyze dashboard with Claude Vision
    console.log('Step 1: Analyzing with Claude Vision...');
    const analysisResult = await analyzeDashboard(req.file.buffer, req.file.mimetype);

    // Step 2: Map complex widgets to simplified components
    console.log('Step 2: Mapping widgets...');
    console.log('Original widgets from Claude:', JSON.stringify(analysisResult.widgets, null, 2));
    const mappedWidgets = mapWidgets(analysisResult.widgets);
    console.log('Mapped widgets:', JSON.stringify(mappedWidgets, null, 2));

    // Step 3: Generate layout for React Grid Layout
    console.log('Step 3: Generating layout...');
    const layout = generateLayout(mappedWidgets, analysisResult.layout);
    console.log('Generated layout:', JSON.stringify(layout, null, 2));

    // Step 4: Calculate confidence score
    console.log('Step 4: Calculating confidence score...');
    let confidence = 100;
    const issues = [];

    // Check widget completeness
    const missingComponentData = mappedWidgets.filter(w => !w.component || !w.props).length;
    if (missingComponentData > 0) {
      confidence -= missingComponentData * 10;
      issues.push(`${missingComponentData} widgets missing component data`);
    }

    // Check layout completeness
    const missingLayoutData = layout.filter(l =>
      l.x === undefined || l.y === undefined || l.w === undefined || l.h === undefined
    ).length;
    if (missingLayoutData > 0) {
      confidence -= missingLayoutData * 15;
      issues.push(`${missingLayoutData} widgets missing position data (x,y,w,h)`);
    }

    // Check consistency between widgets and layout
    if (mappedWidgets.length !== layout.length) {
      confidence -= 20;
      issues.push('Widget count mismatch between widgets and gridLayout');
    }

    // Ensure minimum confidence is 0
    confidence = Math.max(0, confidence);

    // Determine quality level
    let quality = 'poor';
    if (confidence > 90) quality = 'excellent';
    else if (confidence >= 70) quality = 'good';
    else if (confidence >= 50) quality = 'fair';

    // Determine if rendering is safe
    const canRender = confidence >= 50;

    const analysisMetadata = {
      confidence,
      quality,
      issues,
      canRender
    };

    console.log('Confidence analysis:', JSON.stringify(analysisMetadata, null, 2));

    // Return complete dashboard specification
    const dashboardData = {
      layout: analysisResult.layout,
      theme: analysisResult.theme || 'teal',
      widgets: mappedWidgets,
      gridLayout: layout,
      metadata: {
        analyzedAt: new Date().toISOString(),
        widgetCount: mappedWidgets.length,
      },
      analysis: analysisMetadata,
    };

    // Check if auto-save is requested
    const shouldSave = req.query.save === 'true';
    const dashboardName = req.query.name;
    const appName = req.query.appName || analysisResult.appName || null;
    const appCategory = req.query.appCategory || analysisResult.appCategory || null;

    let savedDashboard = null;
    if (shouldSave && dashboardName) {
      try {
        savedDashboard = createDashboard(
          dashboardName,
          dashboardData,
          dashboardData.theme,
          appName,
          appCategory
        );
        console.log(`✓ Dashboard auto-saved as: "${dashboardName}" (ID: ${savedDashboard._id})`);
        if (appName) console.log(`  App Name: "${appName}"`);
        if (appCategory) console.log(`  App Category: "${appCategory}"`);
      } catch (saveError) {
        console.error('Error auto-saving dashboard:', saveError);
        // Continue without saving if save fails
      }
    }

    const response = {
      success: true,
      dashboard: dashboardData,
      ...(savedDashboard && { savedDashboard }),
    };

    res.json(response);
  } catch (error) {
    console.error('Error analyzing dashboard:', error);
    res.status(500).json({
      error: 'Failed to analyze dashboard',
      message: error.message,
    });
  }
});

// ========== CRUD Endpoints for Dashboard Persistence ==========

// POST /api/dashboards - Save new dashboard
app.post('/api/dashboards', async (req, res) => {
  try {
    const { name, dashboard, theme, appName, appCategory, thumbnail } = req.body;

    // Validation
    if (!name || !dashboard) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name and dashboard are required',
      });
    }

    // Debug logging for dashboard name
    console.log(`Saving dashboard with name: "${name}" (length: ${name.length})`);
    if (appName) console.log(`  App Name: "${appName}"`);
    if (appCategory) console.log(`  App Category: "${appCategory}"`);
    if (thumbnail) console.log(`  Thumbnail: ${thumbnail.length} bytes`);

    // Create dashboard in database with thumbnail from frontend
    const savedDashboard = createDashboard(
      name,
      dashboard,
      theme || 'custom',
      appName || null,
      appCategory || null,
      thumbnail || null
    );
    console.log(`✓ Dashboard saved: "${name}" (ID: ${savedDashboard._id})`);

    res.json({
      success: true,
      dashboard: savedDashboard,
    });
  } catch (error) {
    console.error('Error saving dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save dashboard',
      message: error.message,
    });
  }
});

// GET /api/dashboards - List all saved dashboards
app.get('/api/dashboards', async (req, res) => {
  try {
    const dashboards = getAllDashboards();
    console.log(`✓ Retrieved ${dashboards.length} dashboard(s)`);

    res.json({
      success: true,
      dashboards,
    });
  } catch (error) {
    console.error('Error retrieving dashboards:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve dashboards',
      message: error.message,
    });
  }
});

// GET /api/dashboards/:id - Load specific dashboard
app.get('/api/dashboards/:id', async (req, res) => {
  try {
    console.log(`[LOAD] Request received for dashboard ID: ${req.params.id}`);
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      console.log(`[LOAD] Invalid ID format: ${req.params.id}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid dashboard ID',
      });
    }

    console.log(`[LOAD] Fetching dashboard with ID: ${id}`);
    const dashboard = getDashboardById(id);

    if (!dashboard) {
      console.log(`[LOAD] Dashboard not found: ${id}`);
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
      });
    }

    console.log(`[LOAD] ✓ Dashboard loaded: "${dashboard.name}" (ID: ${id})`);
    console.log(`[LOAD] Response structure:`, JSON.stringify({
      _id: dashboard._id,
      name: dashboard.name,
      hasDashboard: !!dashboard.dashboard,
      theme: dashboard.theme
    }, null, 2));

    res.json({
      success: true,
      dashboard,
    });
  } catch (error) {
    console.error('[LOAD] Error loading dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load dashboard',
      message: error.message,
    });
  }
});

// GET /api/dashboards/:id/thumbnail - Get thumbnail URL
app.get('/api/dashboards/:id/thumbnail', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dashboard ID',
      });
    }

    const dashboard = getDashboardById(id);

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
      });
    }

    if (!dashboard.thumbnail) {
      return res.status(404).json({
        success: false,
        error: 'No thumbnail available for this dashboard',
      });
    }

    res.json({
      success: true,
      thumbnailUrl: dashboard.thumbnail,
      dashboardId: id,
      dashboardName: dashboard.name,
    });
  } catch (error) {
    console.error('[THUMBNAIL] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get thumbnail',
      message: error.message,
    });
  }
});

// GET /api/dashboards/:id/thumbnail.png - Get thumbnail as PNG image
app.get('/api/dashboards/:id/thumbnail.png', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).send('Invalid dashboard ID');
    }

    const dashboard = getDashboardById(id);

    if (!dashboard) {
      return res.status(404).send('Dashboard not found');
    }

    if (!dashboard.thumbnail) {
      return res.status(404).send('No thumbnail available');
    }

    // Extract base64 data from data URL
    const matches = dashboard.thumbnail.match(/^data:image\/png;base64,(.+)$/);
    if (!matches) {
      return res.status(500).send('Invalid thumbnail format');
    }

    const imageBuffer = Buffer.from(matches[1], 'base64');

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Content-Disposition': `inline; filename="dashboard-${id}.png"`,
      'Cache-Control': 'public, max-age=3600',
    });

    res.send(imageBuffer);
  } catch (error) {
    console.error('[THUMBNAIL PNG] Error:', error);
    res.status(500).send('Failed to get thumbnail');
  }
});

// GET /api/dashboards/:id/render.png - Returns stored thumbnail (generated on save)
app.get('/api/dashboards/:id/render.png', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) return res.status(400).send('Invalid dashboard ID');

    const dashboard = getDashboardById(id);
    if (!dashboard) return res.status(404).send('Dashboard not found');

    // Return stored thumbnail
    if (!dashboard.thumbnail) {
      return res.status(404).send('No thumbnail available - save the dashboard to generate one');
    }

    // Parse base64 thumbnail
    const matches = dashboard.thumbnail.match(/^data:image\/png;base64,(.+)$/);
    if (!matches) {
      return res.status(500).send('Invalid thumbnail format');
    }

    const imageBuffer = Buffer.from(matches[1], 'base64');

    res.set({
      'Content-Type': 'image/png',
      'Content-Length': imageBuffer.length,
      'Content-Disposition': `inline; filename="dashboard-${id}.png"`,
      'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
    });
    res.send(imageBuffer);

  } catch (error) {
    console.error('[RENDER] Error:', error);
    res.status(500).send(`Failed: ${error.message}`);
  }
});

// PUT /api/dashboards/:id - Update existing dashboard
app.put('/api/dashboards/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dashboard ID',
      });
    }

    const { name, dashboard, theme, appName, appCategory, thumbnail } = req.body;

    // Get existing dashboard
    const existing = getDashboardById(id);

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
      });
    }

    // Update with provided values or keep existing
    const updatedDashboard = updateDashboard(
      id,
      name !== undefined ? name : existing.name,
      dashboard !== undefined ? dashboard : existing.dashboard,
      theme !== undefined ? theme : existing.theme,
      appName !== undefined ? appName : existing.appName,
      appCategory !== undefined ? appCategory : existing.appCategory,
      thumbnail !== undefined ? thumbnail : existing.thumbnail
    );

    console.log(`✓ Dashboard updated: "${updatedDashboard.name}" (ID: ${id})`);
    if (appName !== undefined) console.log(`  App Name: "${appName}"`);
    if (appCategory !== undefined) console.log(`  App Category: "${appCategory}"`);
    if (thumbnail !== undefined) console.log(`  Thumbnail: ${thumbnail?.length || 0} bytes`);

    res.json({
      success: true,
      dashboard: updatedDashboard,
    });
  } catch (error) {
    console.error('Error updating dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update dashboard',
      message: error.message,
    });
  }
});

// DELETE /api/dashboards/:id - Delete dashboard
app.delete('/api/dashboards/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid dashboard ID',
      });
    }

    const deleted = deleteDashboard(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: 'Dashboard not found',
      });
    }

    console.log(`✓ Dashboard deleted (ID: ${id})`);

    res.json({
      success: true,
      message: 'Dashboard deleted',
    });
  } catch (error) {
    console.error('Error deleting dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete dashboard',
      message: error.message,
    });
  }
});

// ========== Dashboard Rendering Endpoints ==========

// POST /api/render-dashboard - Render dashboard data to PNG
app.post('/api/render-dashboard', async (req, res) => {
  try {
    const {
      widgets,
      gridLayout,
      theme = 'teal',
      appName = 'Dashboard',
      appCategory = 'analytics',
      width = 1920,
      height = 1080,
    } = req.body;

    // Validate required fields
    if (!widgets || !Array.isArray(widgets)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: widgets (must be an array)',
      });
    }

    if (!gridLayout || !Array.isArray(gridLayout)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: gridLayout (must be an array)',
      });
    }

    console.log(`[Render] Rendering dashboard: "${appName}"`);
    console.log(`[Render] Theme: ${theme}, Size: ${width}x${height}`);
    console.log(`[Render] Widgets: ${widgets.length}, Grid items: ${gridLayout.length}`);

    // Render dashboard to PNG
    const pngBuffer = await renderDashboard(
      { widgets, gridLayout },
      { theme, appName, appCategory, width, height }
    );

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="dashboard-${Date.now()}.png"`);
    res.setHeader('Content-Length', pngBuffer.length);

    // Send PNG buffer
    res.send(pngBuffer);

    console.log(`[Render] ✓ Dashboard PNG sent (${pngBuffer.length} bytes)`);
  } catch (error) {
    console.error('[Render] Error rendering dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to render dashboard',
      message: error.message,
    });
  }
});

// POST /api/screenshot-to-dashboard - Analyze screenshot and return rendered dashboard PNG
app.post('/api/screenshot-to-dashboard', upload.single('screenshot'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No screenshot provided',
      });
    }

    console.log('[Screenshot-to-Dashboard] Received screenshot:', {
      filename: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype,
    });

    // Extract optional parameters from query or body
    const width = parseInt(req.query.width || req.body?.width || '1920', 10);
    const height = parseInt(req.query.height || req.body?.height || '1080', 10);
    const appName = req.query.appName || req.body?.appName;
    const appCategory = req.query.appCategory || req.body?.appCategory;

    // Step 1: Analyze dashboard with Claude Vision
    console.log('[Screenshot-to-Dashboard] Step 1: Analyzing with Claude Vision...');
    const analysisResult = await analyzeDashboard(req.file.buffer, req.file.mimetype);

    // Step 2: Map complex widgets to simplified components
    console.log('[Screenshot-to-Dashboard] Step 2: Mapping widgets...');
    const mappedWidgets = mapWidgets(analysisResult.widgets);

    // Step 3: Generate layout for React Grid Layout
    console.log('[Screenshot-to-Dashboard] Step 3: Generating layout...');
    const layout = generateLayout(mappedWidgets, analysisResult.layout);

    // Step 4: Render dashboard to PNG
    console.log('[Screenshot-to-Dashboard] Step 4: Rendering to PNG...');
    const dashboardData = {
      widgets: mappedWidgets,
      gridLayout: layout,
    };

    const renderOptions = {
      theme: analysisResult.theme || 'teal',
      appName: appName || analysisResult.appName || 'Dashboard',
      appCategory: appCategory || analysisResult.appCategory || 'custom',
      width,
      height,
    };

    const pngBuffer = await renderDashboard(dashboardData, renderOptions);

    // Set response headers
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Content-Disposition', `attachment; filename="dashboard-${Date.now()}.png"`);
    res.setHeader('Content-Length', pngBuffer.length);

    // Send PNG buffer
    res.send(pngBuffer);

    console.log(`[Screenshot-to-Dashboard] ✓ Dashboard PNG sent (${pngBuffer.length} bytes)`);
  } catch (error) {
    console.error('[Screenshot-to-Dashboard] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process screenshot and render dashboard',
      message: error.message,
    });
  }
});

// ========== Session Management Endpoints ==========

// Middleware to validate session key
function requireSession(req, res, next) {
  const sessionKey = req.headers['x-session-key'];

  if (!sessionKey) {
    return res.status(401).json({
      error: 'Session key required',
      message: 'Please provide X-Session-Key header',
    });
  }

  if (!validateSession(sessionKey)) {
    return res.status(401).json({
      error: 'Invalid or expired session',
      message: 'Please login with your email',
    });
  }

  req.sessionKey = sessionKey;
  next();
}

// POST /api/auth/login - Login or register by email
app.post('/api/auth/login', (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== 'string') {
      return res.status(400).json({
        error: 'Email required',
        message: 'Please provide a valid email address',
      });
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid email address',
      });
    }

    const session = loginByEmail(email);

    console.log(`✓ Login: ${session.email} (${session.is_new ? 'new user' : 'returning user'})`);

    res.json({
      success: true,
      session: {
        email: session.email,
        session_key: session.session_key,
        created_at: session.created_at,
      },
      is_new: session.is_new,
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({
      error: 'Failed to login',
      message: error.message,
    });
  }
});

// GET /api/auth/me - Get current session info
app.get('/api/auth/me', requireSession, (req, res) => {
  try {
    const session = getSessionByKey(req.sessionKey);

    if (!session) {
      return res.status(401).json({
        error: 'Session not found',
        message: 'Please login again',
      });
    }

    res.json({
      success: true,
      session: {
        email: session.email,
        session_key: session.session_key,
        created_at: session.created_at,
      },
    });
  } catch (error) {
    console.error('Error getting session info:', error);
    res.status(500).json({
      error: 'Failed to get session info',
      message: error.message,
    });
  }
});

// POST /api/session - Create new session (legacy - for backward compatibility)
app.post('/api/session', (req, res) => {
  try {
    const session = createSession();
    res.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({
      error: 'Failed to create session',
      message: error.message,
    });
  }
});

// GET /api/session/stats - Get session statistics (for debugging)
app.get('/api/session/stats', (req, res) => {
  res.json({
    active_sessions: getActiveSessionsCount(),
  });
});

// GET /api/layouts - Get available layout presets
app.get('/api/layouts', (req, res) => {
  res.json({
    success: true,
    presets: getLayoutPresets(),
  });
});

// GET /api/widgets/config - Get widget configuration for session (or defaults)
app.get('/api/widgets/config', (req, res) => {
  const sessionKey = req.headers['x-session-key'];

  // If session key provided, get session-specific config
  if (sessionKey && validateSession(sessionKey)) {
    const config = getWidgetConfigs(sessionKey);
    return res.json({
      success: true,
      config,
      sessionBound: true,
    });
  }

  // Otherwise return defaults
  res.json({
    success: true,
    config: getDefaultWidgetConfigs(),
    sessionBound: false,
  });
});

// PUT /api/widgets/config - Save widget configuration for session
app.put('/api/widgets/config', requireSession, (req, res) => {
  try {
    const { config } = req.body;

    if (!config || typeof config !== 'object') {
      return res.status(400).json({
        error: 'Invalid config',
        message: 'Please provide a config object',
      });
    }

    saveAllWidgetConfigs(req.sessionKey, config);

    res.json({
      success: true,
      message: 'Widget configuration saved',
      session_key: req.sessionKey,
    });
  } catch (error) {
    console.error('Error saving widget config:', error);
    res.status(500).json({
      error: 'Failed to save widget config',
      message: error.message,
    });
  }
});

// GET /api/user/preferences - Get user preferences for session
app.get('/api/user/preferences', (req, res) => {
  try {
    const sessionKey = req.header('X-Session-Key');

    if (!sessionKey) {
      return res.status(401).json({
        error: 'Session key required',
        message: 'Please provide X-Session-Key header',
      });
    }

    // Validate session
    const session = getSessionByKey(sessionKey);
    if (!session) {
      return res.status(401).json({
        error: 'Invalid session',
        message: 'Session not found or expired',
      });
    }

    const preferences = getUserPreferences(sessionKey);

    res.json({
      success: true,
      preferences,
      email: session.email,
    });
  } catch (error) {
    console.error('Error getting user preferences:', error);
    res.status(500).json({
      error: 'Failed to get user preferences',
      message: error.message,
    });
  }
});

// PUT /api/user/preferences - Save user preferences for session
app.put('/api/user/preferences', requireSession, (req, res) => {
  try {
    const { preferences } = req.body;

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        error: 'Invalid preferences',
        message: 'Preferences must be an object',
      });
    }

    saveUserPreferences(req.sessionKey, preferences);

    res.json({
      success: true,
      message: 'User preferences saved',
      session_key: req.sessionKey,
    });
  } catch (error) {
    console.error('Error saving user preferences:', error);
    res.status(500).json({
      error: 'Failed to save user preferences',
      message: error.message,
    });
  }
});

// POST /api/generate/packed - Generate dashboard using bin-packing with session widget config
app.post('/api/generate/packed', requireSession, (req, res) => {
  try {
    const { widgetCount = 6 } = req.body;

    // Validate widgetCount (1-20)
    const validCount = Math.max(1, Math.min(20, parseInt(widgetCount) || 6));

    // Get widget config for this session from database
    const sessionWidgetConfig = getWidgetConfigs(req.sessionKey);

    const dashboard = generateBinPackedDashboard(validCount, sessionWidgetConfig);

    res.json({
      success: true,
      dashboard,
      session_key: req.sessionKey,
    });
  } catch (error) {
    console.error('Error generating packed dashboard:', error);
    res.status(500).json({
      error: 'Failed to generate dashboard',
      message: error.message,
    });
  }
});

// POST /api/generate - Generate random dashboard from layout preset (requires session)
app.post('/api/generate', requireSession, (req, res) => {
  try {
    const { preset, minWidthCols = 1 } = req.body;

    if (!preset) {
      return res.status(400).json({
        error: 'Missing preset parameter',
        message: 'Please provide a preset key (e.g., "2+2", "3+1")',
      });
    }

    // Validate minWidthCols (1, 2, or 3)
    const validMinWidth = [1, 2, 3].includes(minWidthCols) ? minWidthCols : 1;

    // Get widget config for this session from database
    const sessionWidgetConfig = getWidgetConfigs(req.sessionKey);

    const dashboard = generateRandomDashboard(preset, validMinWidth, sessionWidgetConfig);

    res.json({
      success: true,
      dashboard,
      session_key: req.sessionKey,
    });
  } catch (error) {
    console.error('Error generating dashboard:', error);
    res.status(500).json({
      error: 'Failed to generate dashboard',
      message: error.message,
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Max size is 10MB' });
    }
    return res.status(400).json({ error: error.message });
  }

  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard AI Generator API running on port ${PORT}`);
  console.log(`📊 Ready to analyze dashboard screenshots`);
  console.log(`🎨 Anthropic Vision API configured: ${!!process.env.ANTHROPIC_API_KEY}`);
});
