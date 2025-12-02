import { useState, useEffect } from 'react';
import ScreenshotUploader from './components/ScreenshotUploader';
import DashboardPreview from './components/DashboardPreview';
import SavedDashboards from './components/SavedDashboards';
import LoginScreen from './components/LoginScreen';
import { Upload, Database, Wrench, Key, LogOut, Copy, Check, Menu, X, BookOpen, Settings, FileJson, AlertCircle } from 'lucide-react';
import { fetchDashboardById } from './utils/api';
import { isLoggedIn, getSession, clearSession } from './utils/sessionManager';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('teal');
  const [currentView, setCurrentView] = useState('create'); // 'create' | 'saved' | 'upload' | 'preview'
  const [loadedDashboardId, setLoadedDashboardId] = useState(null);
  const [loadedDashboardName, setLoadedDashboardName] = useState(null);
  const [urlParams, setUrlParams] = useState({ theme: null, appName: null, appCategory: null, id: null, skeletonMode: null });

  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(isLoggedIn());
  const [session, setSession] = useState(getSession());
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [initialEditMode, setInitialEditMode] = useState(false);

  // Import JSON state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState(null);

  const handleLoginSuccess = (sessionData) => {
    setSession(sessionData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearSession();
    setIsAuthenticated(false);
    setSession(null);
    setDashboardData(null);
    setCurrentView('create');
  };

  const copyApiKey = () => {
    if (session?.session_key) {
      navigator.clipboard.writeText(session.session_key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  // Update URL when settings change
  const updateURL = (params) => {
    const searchParams = new URLSearchParams();

    if (params.theme) searchParams.set('theme', params.theme);
    if (params.appName) searchParams.set('name', params.appName);
    if (params.appCategory) searchParams.set('category', params.appCategory);
    if (params.id) searchParams.set('id', params.id);
    if (params.skeletonMode !== undefined) searchParams.set('skeleton', params.skeletonMode ? 'true' : 'false');

    const newURL = `${window.location.pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
    window.history.replaceState({}, '', newURL);
  };

  const handleAnalysisComplete = (data) => {
    console.log('[APP] handleAnalysisComplete received data:', {
      hasMetadata: !!data.metadata,
      theme: data.theme,
      appName: data.metadata?.appName,
      appCategory: data.metadata?.appCategory,
      hasAnalysis: !!data.analysis,
      confidence: data.analysis?.confidence
    });

    setDashboardData(data);
    setSelectedTheme(data.theme || 'teal');
    setError(null);
    setLoadedDashboardId(null); // Reset dashboard ID for new uploads
    setLoadedDashboardName(null); // Reset dashboard name for new uploads
    setCurrentView('preview');
  };

  const handleAnalysisError = (err) => {
    setError(err.message || 'Failed to analyze dashboard');
    setDashboardData(null);
  };

  const handleReset = () => {
    setDashboardData(null);
    setError(null);
    setIsAnalyzing(false);
    setLoadedDashboardId(null);
    setLoadedDashboardName(null);
    setCurrentView('create');
  };

  const handleViewSavedDashboards = () => {
    setCurrentView('saved');
    setShowDrawer(false); // Close drawer
  };

  const handleBuildFromScratch = () => {
    const emptyDashboard = {
      layout: { columns: 20, rows: 30 },
      theme: 'teal',
      widgets: [],
      gridLayout: [],
      metadata: { widgetCount: 0, manuallyCreated: true }
    };
    setDashboardData(emptyDashboard);
    setSelectedTheme('teal');
    setLoadedDashboardId(null); // Reset dashboard ID for new builds
    setLoadedDashboardName(null); // Reset dashboard name for new builds
    setInitialEditMode(true); // Enable edit mode by default for new builds
    setCurrentView('preview');
    setShowDrawer(false); // Close drawer
  };

  const handleLoadDashboard = async (dashboardId) => {
    try {
      console.log(`[APP] handleLoadDashboard called with ID: ${dashboardId} (type: ${typeof dashboardId})`);
      setError(null);

      const dashboard = await fetchDashboardById(dashboardId);
      console.log(`[APP] Received dashboard:`, JSON.stringify({
        _id: dashboard._id,
        name: dashboard.name,
        hasDashboard: !!dashboard.dashboard,
        theme: dashboard.theme,
        appName: dashboard.appName,
        appCategory: dashboard.appCategory
      }, null, 2));

      // Merge appName and appCategory from top-level into dashboard.dashboard.metadata
      const dashboardDataWithMetadata = {
        ...dashboard.dashboard,
        metadata: {
          ...dashboard.dashboard?.metadata,
          appName: dashboard.appName,
          appCategory: dashboard.appCategory
        }
      };

      setDashboardData(dashboardDataWithMetadata);

      // Handle theme - parse JSON string if it's a custom theme object
      let themeValue = dashboard.theme || dashboard.dashboard?.theme || 'teal';
      if (typeof themeValue === 'string' && themeValue.startsWith('{')) {
        try {
          themeValue = JSON.parse(themeValue);
          console.log('[APP] Parsed custom theme:', themeValue);
        } catch (e) {
          console.warn('[APP] Failed to parse theme JSON:', e);
        }
      }
      setSelectedTheme(themeValue);

      setLoadedDashboardId(dashboard._id || dashboardId); // Store the dashboard ID
      setLoadedDashboardName(dashboard.name || null); // Store the dashboard name
      setCurrentView('preview');
      console.log(`[APP] ✓ Dashboard loaded successfully with name: ${dashboard.name}, appName: ${dashboard.appName}, appCategory: ${dashboard.appCategory}`);
    } catch (err) {
      console.error(`[APP] Error loading dashboard:`, err);
      setError(err.message || 'Failed to load dashboard');
    }
  };

  const handleDashboardSaved = (dashboardId) => {
    setLoadedDashboardId(dashboardId);
    // Update URL with dashboard ID
    updateURL({
      theme: selectedTheme,
      id: dashboardId
    });
  };

  const handleCloseSavedDashboards = () => {
    setCurrentView('create');
  };

  // Handle JSON import
  const handleImportJson = () => {
    setImportError(null);

    if (!importJsonText.trim()) {
      setImportError('Please paste JSON data');
      return;
    }

    try {
      const parsed = JSON.parse(importJsonText);

      // Validate required fields
      if (!parsed.gridLayout || !Array.isArray(parsed.gridLayout)) {
        setImportError('Invalid JSON: missing gridLayout array');
        return;
      }

      // Build dashboard data structure
      const importedDashboard = {
        layout: {
          columns: parsed.layout?.columns || 20,
          rows: parsed.layout?.rows || 30
        },
        theme: parsed.theme || 'teal',
        metadata: {
          appName: parsed.appName,
          appCategory: parsed.appCategory,
          ...parsed.metadata
        },
        gridLayout: parsed.gridLayout,
        widgets: parsed.widgets || parsed.gridLayout.map(item => ({
          id: item.i,
          component: item.component,
          props: item.props
        }))
      };

      // Set the dashboard data
      setDashboardData(importedDashboard);
      setSelectedTheme(parsed.theme || 'teal');
      setLoadedDashboardId(null);
      setLoadedDashboardName(parsed.name || 'Imported Dashboard');
      setInitialEditMode(true);
      setCurrentView('preview');
      setShowImportModal(false);
      setImportJsonText('');

      console.log('[APP] Dashboard imported from JSON:', parsed.name);
    } catch (err) {
      console.error('[APP] JSON parse error:', err);
      setImportError(`Invalid JSON: ${err.message}`);
    }
  };

  // Parse URL parameters on mount
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);

    // Extract parameters
    const theme = searchParams.get('theme');
    const appName = searchParams.get('name') || searchParams.get('appName');
    const appCategory = searchParams.get('category') || searchParams.get('appCategory');
    const id = searchParams.get('id');
    const skeleton = searchParams.get('skeleton');
    const skeletonMode = skeleton === 'true';
    const renderMode = searchParams.get('render') === 'true';
    const autoExport = searchParams.get('autoExport') === 'true';
    const embedMode = searchParams.get('embedMode'); // 'wordpress' for WordPress iframe integration

    console.log('[APP] URL Parameters:', { theme, appName, appCategory, id, skeletonMode, renderMode, autoExport, embedMode });

    // Store URL params
    const params = { theme, appName, appCategory, id, skeletonMode, renderMode, autoExport, embedMode };
    setUrlParams(params);

    // Apply theme if provided
    if (theme) {
      setSelectedTheme(theme);
    }

    // Load dashboard by ID if provided
    if (id) {
      handleLoadDashboard(id);
    } else if (!id) {
      // If no ID in URL, initialize empty dashboard for create view
      const emptyDashboard = {
        layout: { columns: 20, rows: 30 },
        theme: 'teal',
        widgets: [],
        gridLayout: [],
        metadata: { widgetCount: 0, manuallyCreated: true }
      };
      setDashboardData(emptyDashboard);
      setInitialEditMode(true);
    }
  }, []); // Empty dependency array - run only on mount

  // Show login screen if not authenticated (unless in render mode)
  if (!isAuthenticated && !urlParams.renderMode) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* Logo - clickable to go to start */}
            <button
              onClick={handleReset}
              className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
            >
              <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div className="text-left hidden sm:block">
                <h1 className="text-xl font-bold text-gray-900">
                  Dashboard AI Generator
                </h1>
              </div>
            </button>

            {/* Center - Navigation Tabs */}
            <nav className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => {
                  // Create new empty dashboard
                  const emptyDashboard = {
                    layout: { columns: 20, rows: 30 },
                    theme: 'teal',
                    widgets: [],
                    gridLayout: [],
                    metadata: { widgetCount: 0, manuallyCreated: true }
                  };
                  setDashboardData(emptyDashboard);
                  setSelectedTheme('teal');
                  setLoadedDashboardId(null);
                  setLoadedDashboardName(null);
                  setInitialEditMode(true);
                  setCurrentView('create');
                }}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'create'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Wrench className="w-4 h-4" />
                  Create
                </span>
              </button>
              <button
                onClick={() => setCurrentView('saved')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'saved'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Saved
                </span>
              </button>
              <button
                onClick={() => {
                  setShowImportModal(true);
                  setImportError(null);
                  setImportJsonText('');
                }}
                className="px-4 py-2 text-sm font-medium rounded-md transition-colors text-gray-600 hover:text-gray-900"
              >
                <span className="flex items-center gap-2">
                  <FileJson className="w-4 h-4" />
                  Import
                </span>
              </button>
              {/* Upload tab temporarily disabled
              <button
                onClick={() => setCurrentView('upload')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  currentView === 'upload'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Upload
                </span>
              </button>
              */}
            </nav>

            {/* Right side - hamburger menu */}
            <div className="flex items-center gap-3">
              {/* User email (visible) */}
              <span className="hidden md:inline text-sm text-gray-600">{session?.email}</span>

              {/* Hamburger Menu Button */}
              <button
                onClick={() => setShowDrawer(true)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Drawer Overlay */}
      {showDrawer && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setShowDrawer(false)}
          />

          {/* Drawer Panel */}
          <div className="absolute right-0 top-0 h-full w-80 bg-white shadow-xl">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
              <button
                onClick={() => setShowDrawer(false)}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 space-y-2">
              {/* Documentation */}
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); /* TODO: Add docs modal */ setShowDrawer(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <BookOpen className="w-5 h-5 text-blue-600" />
                <span className="font-medium">Documentation</span>
              </a>

              {/* Settings - opens DashboardPreview settings modal */}
              <button
                onClick={() => {
                  // Navigate to create view first if needed, then settings can be accessed from there
                  if (currentView !== 'preview') {
                    handleBuildFromScratch();
                  }
                  setShowDrawer(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5 text-purple-600" />
                <span className="font-medium">Settings</span>
                <span className="text-xs text-gray-400 ml-auto">via Dashboard</span>
              </button>

              <div className="border-t border-gray-200 my-4" />

              {/* API Key Section */}
              <div className="px-4 py-3">
                <div className="flex items-center gap-2 mb-2">
                  <Key className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">API Key</span>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-500">{session?.email}</span>
                    <button
                      onClick={copyApiKey}
                      className="flex items-center gap-1 text-xs text-teal-600 hover:text-teal-700"
                    >
                      {copiedKey ? (
                        <>
                          <Check className="w-3 h-3" />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <code className="block text-xs font-mono text-gray-700 break-all">
                    {session?.session_key}
                  </code>
                </div>
                <p className="text-xs text-gray-400">
                  Use in X-Session-Key header for API calls
                </p>
              </div>

              <div className="border-t border-gray-200 my-4" />

              {/* Logout */}
              <button
                onClick={() => { handleLogout(); setShowDrawer(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Confidence Score Warning */}
        {dashboardData && dashboardData.analysis && dashboardData.analysis.confidence < 90 && (
          <div className={`mb-6 p-4 rounded-lg border ${
            dashboardData.analysis.confidence >= 70
              ? 'bg-yellow-50 border-yellow-200'
              : dashboardData.analysis.confidence >= 50
              ? 'bg-orange-50 border-orange-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`font-semibold ${
                    dashboardData.analysis.confidence >= 70
                      ? 'text-yellow-800'
                      : dashboardData.analysis.confidence >= 50
                      ? 'text-orange-800'
                      : 'text-red-800'
                  }`}>
                    Analysis Confidence: {dashboardData.analysis.confidence}%
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    dashboardData.analysis.quality === 'excellent'
                      ? 'bg-green-100 text-green-800'
                      : dashboardData.analysis.quality === 'good'
                      ? 'bg-blue-100 text-blue-800'
                      : dashboardData.analysis.quality === 'fair'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {dashboardData.analysis.quality}
                  </span>
                </div>
                <p className={`text-sm ${
                  dashboardData.analysis.confidence >= 70
                    ? 'text-yellow-700'
                    : dashboardData.analysis.confidence >= 50
                    ? 'text-orange-700'
                    : 'text-red-700'
                }`}>
                  Some widgets may be incomplete or missing data.
                  {dashboardData.analysis.issues && dashboardData.analysis.issues.length > 0 && (
                    <span> Issues: {dashboardData.analysis.issues.join(', ')}</span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload view temporarily disabled
        {currentView === 'upload' && (
          <ScreenshotUploader
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisError={handleAnalysisError}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        )}
        */}

        {currentView === 'saved' && (
          <SavedDashboards
            onLoadDashboard={handleLoadDashboard}
            onClose={handleCloseSavedDashboards}
          />
        )}

        {(currentView === 'create' || currentView === 'preview') && dashboardData && (
          <DashboardPreview
            dashboardData={dashboardData}
            theme={selectedTheme}
            onThemeChange={(newTheme) => {
              setSelectedTheme(newTheme);
              // Update URL when theme changes
              updateURL({
                theme: newTheme,
                id: loadedDashboardId,
                skeletonMode: urlParams.skeletonMode
              });
            }}
            dashboardId={loadedDashboardId}
            initialDashboardName={loadedDashboardName}
            onDashboardSaved={handleDashboardSaved}
            urlParams={urlParams}
            initialSkeletonMode={urlParams.skeletonMode}
            onSkeletonModeChange={(newMode) => {
              // Update URL when skeleton mode changes
              setUrlParams({ ...urlParams, skeletonMode: newMode });
              updateURL({
                theme: selectedTheme,
                id: loadedDashboardId,
                skeletonMode: newMode
              });
            }}
            initialEditMode={initialEditMode}
          />
        )}
      </main>

      {/* Import JSON Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl rounded-2xl">
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Import Dashboard from JSON</h3>
                <p className="text-sm text-gray-500 mt-0.5">Paste JSON exported from "Show JSON" to recreate a dashboard</p>
              </div>
              <button
                onClick={() => setShowImportModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 transition-colors rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              {importError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-800">Import Error</p>
                    <p className="text-sm text-red-600">{importError}</p>
                  </div>
                </div>
              )}
              <textarea
                value={importJsonText}
                onChange={(e) => setImportJsonText(e.target.value)}
                placeholder='Paste your dashboard JSON here...\n\n{\n  "name": "My Dashboard",\n  "theme": "teal",\n  "gridLayout": [...]\n}'
                className="w-full h-64 p-4 border border-gray-300 rounded-lg font-mono text-sm resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <div className="mt-4 flex justify-end gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="px-4 py-2.5 text-gray-700 hover:bg-gray-100 transition-colors text-sm font-medium rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportJson}
                  className="px-4 py-2.5 bg-teal-600 text-white hover:bg-teal-700 transition-colors text-sm font-medium rounded-lg shadow-sm flex items-center gap-2"
                >
                  <FileJson className="w-4 h-4" />
                  Import Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-16 py-6 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          Powered by Claude Vision AI • Screenshot to Dashboard in seconds
        </div>
      </footer>
    </div>
  );
}

export default App;
