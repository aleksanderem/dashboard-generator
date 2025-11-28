import { useState, useEffect } from 'react';
import ScreenshotUploader from './components/ScreenshotUploader';
import DashboardPreview from './components/DashboardPreview';
import SavedDashboards from './components/SavedDashboards';
import { Upload, Database, Wrench } from 'lucide-react';
import { fetchDashboardById } from './utils/api';

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedTheme, setSelectedTheme] = useState('teal');
  const [currentView, setCurrentView] = useState('upload'); // 'upload' | 'saved' | 'preview'
  const [loadedDashboardId, setLoadedDashboardId] = useState(null);
  const [loadedDashboardName, setLoadedDashboardName] = useState(null);
  const [urlParams, setUrlParams] = useState({ theme: null, appName: null, appCategory: null, id: null, skeletonMode: null });

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
    setCurrentView('upload');
  };

  const handleViewSavedDashboards = () => {
    setCurrentView('saved');
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
    setCurrentView('preview');
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
      setSelectedTheme(dashboard.theme || dashboard.dashboard?.theme || 'teal');
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
    setCurrentView('upload');
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

    console.log('[APP] URL Parameters:', { theme, appName, appCategory, id, skeletonMode });

    // Store URL params
    const params = { theme, appName, appCategory, id, skeletonMode };
    setUrlParams(params);

    // Apply theme if provided
    if (theme) {
      setSelectedTheme(theme);
    }

    // Load dashboard by ID if provided
    if (id) {
      handleLoadDashboard(id);
    }
  }, []); // Empty dependency array - run only on mount

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Dashboard AI Generator
                </h1>
                <p className="text-sm text-gray-500">
                  Transform complex dashboards into beautiful simplified views
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Saved Dashboards Button */}
              <button
                onClick={handleViewSavedDashboards}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Database className="w-4 h-4" />
                Saved Dashboards
              </button>

              {/* Build from Scratch Button */}
              <button
                onClick={handleBuildFromScratch}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Wrench className="w-4 h-4" />
                Build from Scratch
              </button>

              {/* Upload New Button - only when dashboard exists */}
              {dashboardData && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 border border-teal-600 rounded-lg hover:bg-teal-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload New
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

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

        {currentView === 'upload' && (
          <ScreenshotUploader
            onAnalysisComplete={handleAnalysisComplete}
            onAnalysisError={handleAnalysisError}
            isAnalyzing={isAnalyzing}
            setIsAnalyzing={setIsAnalyzing}
          />
        )}

        {currentView === 'saved' && (
          <SavedDashboards
            onLoadDashboard={handleLoadDashboard}
            onClose={handleCloseSavedDashboards}
          />
        )}

        {currentView === 'preview' && dashboardData && (
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
          />
        )}
      </main>

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
