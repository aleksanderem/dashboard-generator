import { useState, useEffect } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Download, Edit, Palette, Trash2, Settings, Save, CheckCircle, Plus } from 'lucide-react';
import { toPng } from 'html-to-image';
import { componentRegistry } from './simplified';
import { applyTheme, getThemeColor, themes } from '../utils/themeManager';
import { saveDashboard, updateDashboard } from '../utils/api';

export default function DashboardPreview({ dashboardData, theme, onThemeChange, dashboardId, onDashboardSaved, urlParams, initialSkeletonMode, onSkeletonModeChange, initialDashboardName }) {
  const [layout, setLayout] = useState([]);
  const [widgetDataMap, setWidgetDataMap] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [appName, setAppName] = useState(urlParams?.appName || 'ManageEngine AD360');
  const [appCategory, setAppCategory] = useState(urlParams?.appCategory || 'ad');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryColor, setCustomCategoryColor] = useState('#138D8F');
  const [showSidebar, setShowSidebar] = useState(true);
  const [showNavbar, setShowNavbar] = useState(true);
  const [showSkeletonMode, setShowSkeletonMode] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [hoveredWidget, setHoveredWidget] = useState(null);
  const [editingWidget, setEditingWidget] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [dashboardName, setDashboardName] = useState(initialDashboardName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [savedDashboardId, setSavedDashboardId] = useState(dashboardId || null);
  const [showLayoutSettingsModal, setShowLayoutSettingsModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [expandedEndpoints, setExpandedEndpoints] = useState({});
  const [showChartTooltips, setShowChartTooltips] = useState(true);

  useEffect(() => {
    if (dashboardData?.gridLayout) {
      console.log('Setting layout from dashboardData:', dashboardData);
      console.log('gridLayout:', dashboardData.gridLayout);

      // Extract layout positions (only x, y, w, h, i)
      const cleanLayout = dashboardData.gridLayout.map(item => ({
        i: item.i,
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h
      }));

      // Store widget data separately (component, props)
      const dataMap = {};
      dashboardData.gridLayout.forEach(item => {
        dataMap[item.i] = {
          component: item.component,
          props: item.props
        };
      });

      console.log('Clean layout:', cleanLayout);
      console.log('Widget data map:', dataMap);

      // Validate data consistency
      const actualWidgetCount = cleanLayout.length;
      const metadataWidgetCount = dashboardData.metadata?.widgetCount ?? 0;

      if (actualWidgetCount !== metadataWidgetCount) {
        console.warn(
          `⚠️ Data inconsistency detected:\n` +
          `   gridLayout has ${actualWidgetCount} widgets\n` +
          `   metadata.widgetCount shows ${metadataWidgetCount}\n` +
          `   This will be corrected when the dashboard is saved.`
        );
      }

      setLayout(cleanLayout);
      setWidgetDataMap(dataMap);

      // Load appName and appCategory from dashboard metadata if available
      if (dashboardData.metadata?.appName) {
        console.log('Loading appName from dashboard metadata:', dashboardData.metadata.appName);
        setAppName(dashboardData.metadata.appName);
      }
      if (dashboardData.metadata?.appCategory) {
        console.log('Loading appCategory from dashboard metadata:', dashboardData.metadata.appCategory);
        setAppCategory(dashboardData.metadata.appCategory);
      }
    }
  }, [dashboardData]);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Initialize skeleton mode from prop
  useEffect(() => {
    if (initialSkeletonMode !== undefined && initialSkeletonMode !== null) {
      setShowSkeletonMode(initialSkeletonMode);
    }
  }, [initialSkeletonMode]);

  // Auto-populate dashboard name when opening modal in update mode
  useEffect(() => {
    if (showSaveModal && savedDashboardId && dashboardData?.name) {
      setDashboardName(dashboardData.name);
    }
  }, [showSaveModal, savedDashboardId, dashboardData?.name]);

  // Restore layout settings from dashboard metadata
  useEffect(() => {
    if (dashboardData?.metadata?.layoutSettings) {
      const settings = dashboardData.metadata.layoutSettings;

      if (settings.showNavbar !== undefined) {
        setShowNavbar(settings.showNavbar);
      }
      if (settings.showSidebar !== undefined) {
        setShowSidebar(settings.showSidebar);
      }
      if (settings.showSkeletonMode !== undefined) {
        setShowSkeletonMode(settings.showSkeletonMode);
        if (onSkeletonModeChange) {
          onSkeletonModeChange(settings.showSkeletonMode);
        }
      }
      if (settings.showChartTooltips !== undefined) {
        setShowChartTooltips(settings.showChartTooltips);
      }
    }
  }, [dashboardData?.metadata?.layoutSettings, onSkeletonModeChange]);

  // Apply URL parameters if provided (but don't override dashboard metadata)
  useEffect(() => {
    if (urlParams) {
      // Only apply URL parameters if they're not already set from dashboard metadata
      if (urlParams.appName && !dashboardData?.metadata?.appName) {
        console.log('Applying appName from URL:', urlParams.appName);
        setAppName(urlParams.appName);
      }
      if (urlParams.appCategory && !dashboardData?.metadata?.appCategory) {
        console.log('Applying appCategory from URL:', urlParams.appCategory);
        setAppCategory(urlParams.appCategory);
      }
    }
  }, [urlParams, dashboardData]);

  // Load settings from localStorage on component mount (but URL params and dashboard data take precedence)
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('dashboardSettings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        console.log('Loading saved dashboard settings:', settings);

        // Only apply localStorage if not already set by URL params or dashboard data
        if (settings.appName && !urlParams?.appName && !dashboardData?.metadata?.appName) {
          setAppName(settings.appName);
        }
        if (settings.appCategory && !urlParams?.appCategory && !dashboardData?.metadata?.appCategory) {
          setAppCategory(settings.appCategory);
        }
        if (settings.customCategoryName) setCustomCategoryName(settings.customCategoryName);
        if (settings.customCategoryColor) setCustomCategoryColor(settings.customCategoryColor);
      } else {
        console.log('No saved dashboard settings found, using defaults');
      }
    } catch (error) {
      console.error('Failed to load dashboard settings from localStorage:', error);
    }
  }, []); // Empty dependency array - run only on mount

  // Save settings to localStorage when they change
  useEffect(() => {
    try {
      const settings = {
        appName,
        appCategory,
        customCategoryName,
        customCategoryColor
      };
      localStorage.setItem('dashboardSettings', JSON.stringify(settings));
      console.log('Saved dashboard settings:', settings);
    } catch (error) {
      console.error('Failed to save dashboard settings to localStorage:', error);
    }
  }, [appName, appCategory, customCategoryName, customCategoryColor]); // Save whenever any setting changes

  const handleLayoutChange = (newLayout) => {
    setLayout(newLayout);
    // Layout changes are tracked in state, will be synced when saving
  };

  const handleExportPNG = async () => {
    const element = document.getElementById('dashboard-grid');
    if (!element) return;

    try {
      const dataUrl = await toPng(element, {
        quality: 1.0,
        pixelRatio: 2,
        backgroundColor: '#f9fafb',
      });

      const link = document.createElement('a');
      link.download = `dashboard-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to export PNG:', error);
    }
  };

  const getDashboardJson = () => {
    return {
      name: dashboardName || 'Untitled Dashboard',
      theme: theme,
      appName: appName,
      appCategory: appCategory,
      metadata: {
        widgetCount: layout.length,
        createdAt: dashboardData.metadata?.analyzedAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add layout settings
        layoutSettings: {
          showNavbar: showNavbar,
          showSidebar: showSidebar,
          showSkeletonMode: showSkeletonMode,
          showChartTooltips: showChartTooltips
        }
      },
      gridLayout: layout.map(item => ({
        ...item,
        component: widgetDataMap[item.i]?.component,
        props: widgetDataMap[item.i]?.props
      })),
      widgets: Object.keys(widgetDataMap).map(id => ({
        id,
        component: widgetDataMap[id].component,
        props: widgetDataMap[id].props
      }))
    };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const toggleEndpoint = (endpointId) => {
    setExpandedEndpoints(prev => ({
      ...prev,
      [endpointId]: !prev[endpointId]
    }));
  };

  const handleAddWidget = (componentName) => {
    // Generate unique ID
    const newId = `widget-${Date.now()}`;

    // Find available position (bottom of layout)
    const maxY = layout.length > 0 ? Math.max(...layout.map(item => item.y + item.h)) : 0;

    // Create new layout item
    const newLayoutItem = {
      i: newId,
      x: 0,
      y: maxY,
      w: 6,
      h: 6,
    };

    // Create new widget data with default props
    const newWidgetData = {
      component: componentName,
      props: {
        title: componentName.replace('Simple', ''),
      },
    };

    // Update layout and widget data map
    const updatedLayout = [...layout, newLayoutItem];
    const updatedWidgetDataMap = {
      ...widgetDataMap,
      [newId]: newWidgetData,
    };

    setLayout(updatedLayout);
    setWidgetDataMap(updatedWidgetDataMap);

    // Close component library after adding
    setShowComponentLibrary(false);
  };

  const handleDeleteWidget = (widgetId) => {
    const updatedLayout = layout.filter(item => item.i !== widgetId);
    const updatedWidgetDataMap = { ...widgetDataMap };
    delete updatedWidgetDataMap[widgetId];

    setLayout(updatedLayout);
    setWidgetDataMap(updatedWidgetDataMap);
  };

  const handleEditWidget = (widgetId) => {
    const widgetData = widgetDataMap[widgetId];
    setEditingWidget(widgetId);
    setEditFormData(widgetData.props || {});
  };

  const handleSaveEdit = () => {
    if (!editingWidget) return;

    const updatedWidgetDataMap = {
      ...widgetDataMap,
      [editingWidget]: {
        ...widgetDataMap[editingWidget],
        props: editFormData,
      },
    };

    setWidgetDataMap(updatedWidgetDataMap);
    setEditingWidget(null);
    setEditFormData({});
  };

  const renderWidget = (item) => {
    console.log('Rendering widget:', item);
    console.log('Widget ID:', item.i);

    // Get widget data from map using item.i
    const widgetData = widgetDataMap[item.i];

    if (!widgetData) {
      console.error('No widget data found for ID:', item.i);
      console.error('Available IDs:', Object.keys(widgetDataMap));
      return (
        <div className="simplified-widget">
          <div className="text-sm text-gray-500">Widget data not found: {item.i}</div>
        </div>
      );
    }

    console.log('Widget data:', widgetData);
    console.log('Available components:', Object.keys(componentRegistry));
    console.log('Looking for component:', widgetData.component);

    const Component = componentRegistry[widgetData.component];

    if (!Component) {
      console.error('Component not found:', widgetData.component);
      console.error('Full widget data:', widgetData);
      return (
        <div className="simplified-widget">
          <div className="text-sm text-gray-500">Unknown component: {widgetData.component}</div>
        </div>
      );
    }

    // Calculate dynamic height for charts (item.h * rowHeight - padding)
    const containerHeight = item.h * 30 - 60; // 30 is rowHeight, subtract padding for title
    const isHovered = hoveredWidget === item.i;

    // Pass theme color and height to chart components
    const themeColor = getThemeColor(theme);

    // Check if this is a stat card component
    const statCardComponents = ['SimpleKPI', 'SimpleMetricCard', 'SimpleScoreCard', 'SimpleStatusCard', 'SimpleComparisonCard'];
    const isStatCard = statCardComponents.includes(widgetData.component);

    const props = {
      ...widgetData.props,
      color: themeColor,
      height: containerHeight, // Pass calculated height for charts
      ...(isStatCard && { showSkeleton: showSkeletonMode }), // Add skeleton prop only for stat cards
      showTooltip: showChartTooltips, // Global tooltip visibility control for charts
    };

    return (
      <div
        className="relative h-full"
        onMouseEnter={() => setHoveredWidget(item.i)}
        onMouseLeave={() => setHoveredWidget(null)}
      >
        <Component {...props} />

        {/* Edit/Delete buttons - show on hover in edit mode */}
        {isEditMode && isHovered && (
          <div className="absolute top-2 right-2 flex gap-2 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEditWidget(item.i);
              }}
              className="p-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              title="Edit widget"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDeleteWidget(item.i);
              }}
              className="p-2 bg-red-600 text-white hover:bg-red-700 transition-colors"
              title="Delete widget"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };


  if (!dashboardData) {
    return (
      <div className="text-center py-12 text-gray-500">
        No dashboard data to display
      </div>
    );
  }

  return (
    <div>
      {/* Edit Widget Modal */}
      {editingWidget && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-2xl shadow-sm">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Edit Widget</h3>
              <button
                onClick={() => {
                  setEditingWidget(null);
                  setEditFormData({});
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editFormData.title || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Widget title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Value (if applicable)
                  </label>
                  <input
                    type="text"
                    value={editFormData.value || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, value: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Value"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtitle (if applicable)
                  </label>
                  <input
                    type="text"
                    value={editFormData.subtitle || ''}
                    onChange={(e) => setEditFormData({ ...editFormData, subtitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Subtitle"
                  />
                </div>

                {/* Bar count slider - only for SimpleBarChart */}
                {widgetDataMap[editingWidget]?.component === 'SimpleBarChart' && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Number of Bars
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max={(widgetDataMap[editingWidget]?.props?.data || []).length || 10}
                        value={editFormData.maxBars || (widgetDataMap[editingWidget]?.props?.data || []).length || 7}
                        onChange={(e) => setEditFormData({ ...editFormData, maxBars: parseInt(e.target.value) })}
                        className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                      <span className="text-sm font-semibold text-gray-700 min-w-[3rem] text-center">
                        {editFormData.maxBars || (widgetDataMap[editingWidget]?.props?.data || []).length || 7}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Adjust the number of visible bars in the chart
                    </p>
                  </div>
                )}

                {/* Skeleton mode toggle - only for TimelineCard */}
                {widgetDataMap[editingWidget]?.component === 'SimpleTimelineCard' && (
                  <div className="pt-4 border-t border-gray-200">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editFormData.showSkeleton || false}
                        onChange={(e) => setEditFormData({ ...editFormData, showSkeleton: e.target.checked })}
                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-700">Skeleton Loading Mode</span>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Show animated skeleton placeholders instead of text content
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setEditingWidget(null);
                    setEditFormData({});
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Component Library Modal */}
      {showComponentLibrary && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Component Library</h3>
              <button
                onClick={() => setShowComponentLibrary(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <div className="grid grid-cols-3 gap-4">
                {Object.keys(componentRegistry).map((componentName) => (
                  <button
                    key={componentName}
                    onClick={() => handleAddWidget(componentName)}
                    className="p-4 border border-gray-200 hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
                  >
                    <div className="font-semibold text-gray-900 mb-1">
                      {componentName.replace('Simple', '')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Click to add
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Save Dashboard Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white w-full max-w-md shadow-sm">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">
                {savedDashboardId ? 'Update Dashboard' : 'Save Dashboard'}
              </h3>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveError(null);
                  setDashboardName('');
                }}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6">
              {saveError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200">
                  <p className="text-sm text-red-800">{saveError}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dashboard Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={dashboardName}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      console.log('Input onChange - new value:', newValue);
                      console.log('Input onChange - value length:', newValue.length);
                      setDashboardName(newValue);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="e.g., Sales Dashboard Q4 2025"
                    disabled={isSaving}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Theme
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 text-gray-700 capitalize">
                    {theme}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Widget Count
                  </label>
                  <div className="px-3 py-2 bg-gray-50 border border-gray-300 text-gray-700">
                    {layout.length} widgets
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowSaveModal(false);
                    setSaveError(null);
                    setDashboardName('');
                  }}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors"
                  disabled={isSaving}
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    console.log('Save button clicked');
                    console.log('Dashboard name state:', dashboardName);
                    console.log('Dashboard name type:', typeof dashboardName);
                    console.log('Dashboard name length:', dashboardName?.length);
                    console.log('Dashboard name trimmed:', dashboardName.trim());

                    if (!dashboardName.trim()) {
                      setSaveError('Dashboard name is required');
                      return;
                    }

                    setIsSaving(true);
                    setSaveError(null);

                    try {
                      // Reconstruct full dashboard data with layout and widget data
                      const fullDashboardData = {
                        ...dashboardData,
                        widgets: Object.keys(widgetDataMap).map(id => ({
                          id,
                          component: widgetDataMap[id].component,
                          props: widgetDataMap[id].props
                        })),
                        gridLayout: layout.map(item => ({
                          ...item,
                          component: widgetDataMap[item.i]?.component,
                          props: widgetDataMap[item.i]?.props
                        })),
                        metadata: {
                          ...dashboardData.metadata,
                          widgetCount: layout.length,
                          updatedAt: new Date().toISOString()
                        }
                      };

                      console.log('About to save with name:', dashboardName);
                      console.log('Dashboard data to save:', JSON.stringify({
                        widgetCount: fullDashboardData.metadata.widgetCount,
                        widgetsArrayLength: fullDashboardData.widgets.length,
                        gridLayoutLength: fullDashboardData.gridLayout.length,
                        theme: theme,
                        appName: appName,
                        appCategory: appCategory
                      }, null, 2));

                      let result;
                      if (savedDashboardId) {
                        result = await updateDashboard(savedDashboardId, dashboardName, fullDashboardData, theme, appName, appCategory);
                      } else {
                        result = await saveDashboard(dashboardName, fullDashboardData, theme, appName, appCategory);
                        setSavedDashboardId(result._id);
                        if (onDashboardSaved) {
                          onDashboardSaved(result._id);
                        }
                      }

                      setShowSaveModal(false);
                      setDashboardName('');
                      setShowSuccessToast(true);
                      setTimeout(() => setShowSuccessToast(false), 3000);
                    } catch (error) {
                      setSaveError(error.message || 'Failed to save dashboard');
                    } finally {
                      setIsSaving(false);
                    }
                  }}
                  className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  disabled={!dashboardName.trim() || isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Preview */}
      <div className="bg-gray-50 border border-gray-100">
        {/* Dashboard Grid with Navbar and Sidebar  */}
        <div
          id="dashboard-grid"
          className="bg-[#f5f6f8] rounded-lg overflow-hidden"
        >
          {/* Navbar - Modern Application Header */}
          {showNavbar && (
            <div className="bg-white border-b border-gray-100 pl-3 pr-8 py-5">
              <div className="flex items-center justify-between">
                {/* Left side - App Name and Category */}
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 rounded-full" style={{
                      background: 'linear-gradient(to bottom, var(--theme-primary), var(--theme-primary-dark))'
                    }}></div>
                    <h1 className="text-2xl font-bold text-gray-900">{appName}</h1>
                  </div>
                </div>

                {/* Right side - Category Badge and Placeholder Items */}
                <div className="flex items-center gap-4">
                  <div
                    className="px-4 py-1.5 rounded text-white text-xs font-bold tracking-wide uppercase"
                    style={{
                      background: appCategory === 'custom' && customCategoryColor
                        ? `linear-gradient(to right, ${customCategoryColor}, ${customCategoryColor}dd)`
                        : themes[appCategory]
                          ? `linear-gradient(to right, ${themes[appCategory].primary}, ${themes[appCategory].primaryDark})`
                          : 'linear-gradient(to right, #C92133, #991B1B)'
                    }}
                  >
                    {appCategory === 'custom' && customCategoryName
                      ? customCategoryName
                      : themes[appCategory]?.name || appCategory.toUpperCase()}
                  </div>
                  <div className="flex gap-2">
                    <div className="w-20 h-8 bg-gray-50"></div>
                    <div className="w-20 h-8 bg-gray-50"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex min-h-[700px]">
            {/* Sidebar */}
            {showSidebar && (
              <div className="bg-white border-r border-gray-100 w-64 p-4 flex flex-col">
                <div className="space-y-2">
                  <div className="h-10 flex items-center px-3 rounded-md" style={{
                    backgroundColor: 'var(--theme-primary-light)',
                    borderLeft: '3px solid var(--theme-primary-dark)'
                  }}>
                    <div className="w-24 h-4" style={{ backgroundColor: 'var(--theme-primary-dark)' }}></div>
                  </div>
                  <div className="h-10 bg-gray-50 flex items-center px-3 rounded-md">
                    <div className="w-20 h-4 bg-gray-300"></div>
                  </div>
                  <div className="h-10 bg-gray-50 flex items-center px-3 rounded-md">
                    <div className="w-20 h-4 bg-gray-300"></div>
                  </div>
                  <div className="h-10 bg-gray-50 flex items-center px-3 rounded-md">
                    <div className="w-20 h-4 bg-gray-300"></div>
                  </div>
                  <div className="h-10 bg-gray-50 flex items-center px-3 rounded-md">
                    <div className="w-20 h-4 bg-gray-300"></div>
                  </div>
                </div>

                {/* Bottom skeleton - user profile placeholder */}
                <div className="mt-auto pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-md">
                    <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-3 bg-gray-300 rounded w-24"></div>
                      <div className="h-2 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 p-8">
              <div style={{ width: '100%' }}>
                <GridLayout
                  className="layout"
                  layout={layout}
                  cols={12}
                  rowHeight={30}
                  width={showSidebar ? 900 : 1164}
                  isDraggable={isEditMode}
                  isResizable={isEditMode}
                  onLayoutChange={handleLayoutChange}
                  margin={[16, 16]}
                  containerPadding={[0, 0]}
                >
                  {layout.map((item) => (
                    <div key={item.i} className="grid-item">
                      {renderWidget(item)}
                    </div>
                  ))}
                </GridLayout>
              </div>
            </div>
          </div>
        </div>

        {/* Edit Mode Instructions */}
        {isEditMode && (
          <div className="mt-4 p-4 bg-blue-50">
            <p className="text-sm text-blue-900">
              <strong>Edit Mode:</strong> Drag widgets to reposition them. Drag the
              bottom-right corner to resize. Click "Done Editing" when finished.
            </p>
          </div>
        )}

        {/* Metadata */}
        <div className="mt-6 p-4 bg-white border border-gray-100">
          <div className="text-sm text-gray-600">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="font-medium text-gray-900">Widgets</div>
                <div>{layout.length} components</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Layout</div>
                <div>
                  {dashboardData.layout?.columns || 'Auto'} columns grid
                </div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Theme</div>
                <div className="capitalize">{theme}</div>
              </div>
              <div>
                <div className="font-medium text-gray-900">Generated</div>
                <div>
                  {new Date(
                    dashboardData.metadata?.analyzedAt
                  ).toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 p-3 bg-white border border-gray-100">
          <div className="text-center text-xs text-gray-500">
            Created by <span className="font-medium text-gray-700">Aleksander Miesak</span>
          </div>
        </div>
      </div>

      {/* Layout Settings Modal */}
      {showLayoutSettingsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-sm">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Edit Layout Settings</h3>
              <button
                onClick={() => setShowLayoutSettingsModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* App Information Section */}
                <div className="bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Application Information</h4>
                  <div className="space-y-4">
                    {/* App Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        App Name
                      </label>
                      <input
                        type="text"
                        value={appName}
                        onChange={(e) => setAppName(e.target.value)}
                        placeholder="Enter app name"
                        className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    {/* Category Badge */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Category Badge
                      </label>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {Object.entries(themes).map(([key, themeConfig]) => (
                          <button
                            key={key}
                            onClick={() => setAppCategory(key)}
                            className={`px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all ${
                              appCategory === key
                                ? 'ring-2 ring-blue-500 ring-offset-2'
                                : 'opacity-60 hover:opacity-100'
                            }`}
                            style={{
                              background: `linear-gradient(to right, ${themeConfig.primary}, ${themeConfig.primaryDark})`,
                              color: 'white'
                            }}
                          >
                            {themeConfig.name}
                          </button>
                        ))}
                      </div>

                      {/* Custom Category */}
                      <div className="mt-3 p-3 bg-white border border-gray-200">
                        <button
                          onClick={() => setAppCategory('custom')}
                          className={`w-full mb-3 px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all ${
                            appCategory === 'custom'
                              ? 'ring-2 ring-blue-500 ring-offset-2'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{
                            background: `linear-gradient(to right, ${customCategoryColor}, ${customCategoryColor}dd)`,
                            color: 'white'
                          }}
                        >
                          {customCategoryName || 'CUSTOM'}
                        </button>

                        {appCategory === 'custom' && (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={customCategoryName}
                              onChange={(e) => setCustomCategoryName(e.target.value)}
                              placeholder="Custom category name"
                              className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <div className="flex items-center gap-2">
                              <input
                                type="color"
                                value={customCategoryColor}
                                onChange={(e) => setCustomCategoryColor(e.target.value)}
                                className="w-12 h-10 cursor-pointer"
                              />
                              <span className="text-xs text-gray-600">Pick color</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Theme Picker Section */}
                <div className="bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Widget Theme</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(themes).map(([key, themeConfig]) => (
                      <button
                        key={key}
                        onClick={() => onThemeChange(key)}
                        className={`px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all ${
                          theme === key
                            ? 'ring-2 ring-blue-500 ring-offset-2'
                            : 'opacity-60 hover:opacity-100'
                        }`}
                        style={{
                          background: `linear-gradient(to right, ${themeConfig.primary}, ${themeConfig.primaryDark})`,
                          color: 'white'
                        }}
                      >
                        {themeConfig.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility Toggles Section */}
                <div className="bg-gray-50 p-4">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Display Options</h4>
                  <div className="space-y-3">
                    {/* Show Navbar */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Show Navbar</span>
                      <button
                        onClick={() => setShowNavbar(!showNavbar)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          showNavbar ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showNavbar ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Show Sidebar */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Show Sidebar</span>
                      <button
                        onClick={() => setShowSidebar(!showSidebar)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          showSidebar ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showSidebar ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Skeleton Mode */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Skeleton Mode (Preview Loading State)</span>
                      <button
                        onClick={() => {
                          const newMode = !showSkeletonMode;
                          setShowSkeletonMode(newMode);
                          if (onSkeletonModeChange) {
                            onSkeletonModeChange(newMode);
                          }
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          showSkeletonMode ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showSkeletonMode ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Show Chart Tooltips */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Show Chart Tooltips</span>
                      <button
                        onClick={() => setShowChartTooltips(!showChartTooltips)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          showChartTooltips ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            showChartTooltips ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-200 px-6 py-4 flex justify-end">
              <button
                onClick={() => setShowLayoutSettingsModal(false)}
                className="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">Dashboard JSON</h3>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
              <pre className="bg-gray-50 p-4 rounded text-sm overflow-x-auto">
                <code>{JSON.stringify(getDashboardJson(), null, 2)}</code>
              </pre>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(getDashboardJson(), null, 2));
                  }}
                  className="px-4 py-2 bg-green-600 text-white hover:bg-green-700 transition-colors"
                >
                  Copy to Clipboard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* API Modal - Improved */}
      {showApiModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">API Documentation</h3>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)]">
              <div className="space-y-3">

                {/* Analyze Image Endpoint */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleEndpoint('analyze')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">POST</span>
                      <span className="font-semibold text-gray-900">/api/analyze</span>
                    </div>
                    <span className="text-gray-400">{expandedEndpoints['analyze'] ? '−' : '+'}</span>
                  </button>
                  {expandedEndpoints['analyze'] && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-3">
                        Analyzes an uploaded dashboard image and generates JSON structure with widgets
                      </p>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Accepts:</h5>
                        <p className="text-xs text-gray-600">• multipart/form-data with image file</p>
                      </div>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Returns:</h5>
                        <p className="text-xs text-gray-600">• JSON object with gridLayout and widgets array</p>
                      </div>
                      <div className="relative">
                        <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200"><code>{`curl -X POST http://localhost:3001/api/analyze \\
  -F "image=@/path/to/dashboard.png"`}</code></pre>
                        <button
                          onClick={() => copyToClipboard(`curl -X POST http://localhost:3001/api/analyze \\
  -F "image=@/path/to/dashboard.png"`)}
                          className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Save Dashboard Endpoint */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleEndpoint('save')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">POST</span>
                      <span className="font-semibold text-gray-900">/api/dashboards</span>
                    </div>
                    <span className="text-gray-400">{expandedEndpoints['save'] ? '−' : '+'}</span>
                  </button>
                  {expandedEndpoints['save'] && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-3">
                        Saves a new dashboard to the database
                      </p>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Required Fields:</h5>
                        <p className="text-xs text-gray-600">• <strong>name</strong>: Dashboard name (string)</p>
                        <p className="text-xs text-gray-600">• <strong>dashboard</strong>: Dashboard data object (contains gridLayout, widgets, metadata)</p>
                      </div>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Optional Fields:</h5>
                        <p className="text-xs text-gray-600">• <strong>theme</strong>: Theme name (string)</p>
                        <p className="text-xs text-gray-600">• <strong>appName</strong>: Application name (string)</p>
                        <p className="text-xs text-gray-600">• <strong>appCategory</strong>: Application category (string)</p>
                      </div>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Returns:</h5>
                        <p className="text-xs text-gray-600">• Saved dashboard object with generated _id</p>
                      </div>
                      <div className="relative">
                        <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200"><code>{`curl -X POST http://localhost:3001/api/dashboards \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    name: "Sales Dashboard Q4 2025",
    dashboard: getDashboardJson(),
    theme: theme,
    appName: appName,
    appCategory: appCategory
  }, null, 2)}'`}</code></pre>
                        <button
                          onClick={() => copyToClipboard(`curl -X POST http://localhost:3001/api/dashboards \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    name: "Sales Dashboard Q4 2025",
    dashboard: getDashboardJson(),
    theme: theme,
    appName: appName,
    appCategory: appCategory
  }, null, 2)}'`)}
                          className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Update Dashboard Endpoint */}
                {savedDashboardId && (
                  <div className="border border-gray-200 rounded">
                    <button
                      onClick={() => toggleEndpoint('update')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">PUT</span>
                        <span className="font-semibold text-gray-900">/api/dashboards/:id</span>
                      </div>
                      <span className="text-gray-400">{expandedEndpoints['update'] ? '−' : '+'}</span>
                    </button>
                    {expandedEndpoints['update'] && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <p className="text-sm text-gray-600 mb-3">
                          Updates an existing dashboard by ID
                        </p>
                        <div className="mb-3">
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Required Fields:</h5>
                          <p className="text-xs text-gray-600">• <strong>name</strong>: Dashboard name (string)</p>
                          <p className="text-xs text-gray-600">• <strong>dashboard</strong>: Dashboard data object (contains gridLayout, widgets, metadata)</p>
                        </div>
                        <div className="mb-3">
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Optional Fields:</h5>
                          <p className="text-xs text-gray-600">• <strong>theme</strong>: Theme name (string)</p>
                          <p className="text-xs text-gray-600">• <strong>appName</strong>: Application name (string)</p>
                          <p className="text-xs text-gray-600">• <strong>appCategory</strong>: Application category (string)</p>
                        </div>
                        <div className="mb-3">
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Returns:</h5>
                          <p className="text-xs text-gray-600">• Updated dashboard object</p>
                        </div>
                        <div className="relative">
                          <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200"><code>{`curl -X PUT http://localhost:3001/api/dashboards/${savedDashboardId} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    name: dashboardName || "Sales Dashboard Q4 2025",
    dashboard: getDashboardJson(),
    theme: theme,
    appName: appName,
    appCategory: appCategory
  }, null, 2)}'`}</code></pre>
                          <button
                            onClick={() => copyToClipboard(`curl -X PUT http://localhost:3001/api/dashboards/${savedDashboardId} \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify({
    name: dashboardName || "Sales Dashboard Q4 2025",
    dashboard: getDashboardJson(),
    theme: theme,
    appName: appName,
    appCategory: appCategory
  }, null, 2)}'`)}
                            className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Get Dashboard Endpoint */}
                {savedDashboardId && (
                  <div className="border border-gray-200 rounded">
                    <button
                      onClick={() => toggleEndpoint('get')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">GET</span>
                        <span className="font-semibold text-gray-900">/api/dashboards/:id</span>
                      </div>
                      <span className="text-gray-400">{expandedEndpoints['get'] ? '−' : '+'}</span>
                    </button>
                    {expandedEndpoints['get'] && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <p className="text-sm text-gray-600 mb-3">
                          Retrieves a specific dashboard by ID
                        </p>
                        <div className="mb-3">
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Accepts:</h5>
                          <p className="text-xs text-gray-600">• Dashboard ID in URL parameter</p>
                        </div>
                        <div className="mb-3">
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Returns:</h5>
                          <p className="text-xs text-gray-600">• Dashboard object with all data</p>
                        </div>
                        <div className="relative">
                          <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200"><code>{`curl http://localhost:3001/api/dashboards/${savedDashboardId}`}</code></pre>
                          <button
                            onClick={() => copyToClipboard(`curl http://localhost:3001/api/dashboards/${savedDashboardId}`)}
                            className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* List All Dashboards Endpoint */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleEndpoint('list')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">GET</span>
                      <span className="font-semibold text-gray-900">/api/dashboards</span>
                    </div>
                    <span className="text-gray-400">{expandedEndpoints['list'] ? '−' : '+'}</span>
                  </button>
                  {expandedEndpoints['list'] && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-3">
                        Retrieves all saved dashboards
                      </p>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Accepts:</h5>
                        <p className="text-xs text-gray-600">• No parameters required</p>
                      </div>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Returns:</h5>
                        <p className="text-xs text-gray-600">• Array of all dashboard objects</p>
                      </div>
                      <div className="relative">
                        <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200"><code>{`curl http://localhost:3001/api/dashboards`}</code></pre>
                        <button
                          onClick={() => copyToClipboard(`curl http://localhost:3001/api/dashboards`)}
                          className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Delete Dashboard Endpoint */}
                {savedDashboardId && (
                  <div className="border border-gray-200 rounded">
                    <button
                      onClick={() => toggleEndpoint('delete')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">DELETE</span>
                        <span className="font-semibold text-gray-900">/api/dashboards/:id</span>
                      </div>
                      <span className="text-gray-400">{expandedEndpoints['delete'] ? '−' : '+'}</span>
                    </button>
                    {expandedEndpoints['delete'] && (
                      <div className="border-t border-gray-200 p-4 bg-gray-50">
                        <p className="text-sm text-gray-600 mb-3">
                          Deletes a dashboard by ID
                        </p>
                        <div className="mb-3">
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Accepts:</h5>
                          <p className="text-xs text-gray-600">• Dashboard ID in URL parameter</p>
                        </div>
                        <div className="mb-3">
                          <h5 className="text-xs font-semibold text-gray-700 mb-1">Returns:</h5>
                          <p className="text-xs text-gray-600">• Success message</p>
                        </div>
                        <div className="relative">
                          <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200"><code>{`curl -X DELETE http://localhost:3001/api/dashboards/${savedDashboardId}`}</code></pre>
                          <button
                            onClick={() => copyToClipboard(`curl -X DELETE http://localhost:3001/api/dashboards/${savedDashboardId}`)}
                            className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Export PNG Endpoint */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleEndpoint('export-png')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">POST</span>
                      <span className="font-semibold text-gray-900">/api/export/png</span>
                    </div>
                    <span className="text-gray-400">{expandedEndpoints['export-png'] ? '−' : '+'}</span>
                  </button>
                  {expandedEndpoints['export-png'] && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-3">
                        Exports dashboard as PNG image
                      </p>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Accepts:</h5>
                        <p className="text-xs text-gray-600">• JSON with dashboard ID or dashboard data</p>
                      </div>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Returns:</h5>
                        <p className="text-xs text-gray-600">• PNG image file (binary)</p>
                      </div>
                      <div className="relative">
                        <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200"><code>{`curl -X POST http://localhost:3001/api/export/png \\
  -H "Content-Type: application/json" \\
  -d '{"dashboardId": "${savedDashboardId || 'DASHBOARD_ID'}"}' \\
  --output dashboard.png`}</code></pre>
                        <button
                          onClick={() => copyToClipboard(`curl -X POST http://localhost:3001/api/export/png \\
  -H "Content-Type: application/json" \\
  -d '{"dashboardId": "${savedDashboardId || 'DASHBOARD_ID'}"}' \\
  --output dashboard.png`)}
                          className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                        >
                            Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Right Panel - Edit Controls */}
      <div className="fixed right-6 bottom-6 z-50">
        <div className="bg-white shadow-sm border border-gray-200 p-4 space-y-4 min-w-[200px]">
          {/* Edit Mode Toggle */}
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Edit Mode</div>
            <button
              onClick={() => setIsEditMode(!isEditMode)}
              className={`w-full flex items-center justify-between px-3 py-2 transition-all border ${
                isEditMode
                  ? 'bg-white text-gray-900 border-gray-300'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <span className="font-medium text-xs">{isEditMode ? 'ON' : 'OFF'}</span>
              <div className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors ${
                isEditMode ? 'bg-teal-600' : 'bg-gray-300'
              }`}>
                <span className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                  isEditMode ? 'translate-x-4' : 'translate-x-1'
                }`} />
              </div>
            </button>
          </div>

          {/* Add Widget Button - only when edit mode is on */}
          {isEditMode && (
            <div>
              <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Widgets</div>
              <button
                onClick={() => setShowComponentLibrary(true)}
                className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all font-medium text-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Add Widget</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Fixed Bottom Toolbar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center pb-6">
        <div className="bg-white shadow-sm border border-gray-200 px-4 py-2 flex items-center gap-3">
          {/* Edit Layout Button */}
          <button
            onClick={() => setShowLayoutSettingsModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all font-medium text-xs"
          >
            <Settings className="w-4 h-4" />
            Edit Layout
          </button>

          {/* Save Dashboard Button */}
          <button
            onClick={() => setShowSaveModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all font-medium text-xs"
          >
            <Save className="w-4 h-4" />
            {savedDashboardId ? 'Update Dashboard' : 'Save Dashboard'}
          </button>

          {/* Export PNG Button */}
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all font-medium text-xs"
          >
            <Download className="w-4 h-4" />
            Export PNG
          </button>

          {/* Show JSON Button */}
          <button
            onClick={() => setShowJsonModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all font-medium text-xs"
          >
            <Edit className="w-4 h-4" />
            Show JSON
          </button>

          {/* API Button */}
          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all font-medium text-xs"
          >
            <Edit className="w-4 h-4" />
            API
          </button>
        </div>
      </div>

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-4 shadow-sm flex items-center gap-3">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Dashboard saved successfully!</span>
          </div>
        </div>
      )}
    </div>
  );
}
