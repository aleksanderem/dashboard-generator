import { useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import { Download, Edit, Palette, Trash2, Settings, Save, CheckCircle, Plus, RefreshCw } from 'lucide-react';
import { toPng } from 'html-to-image';
import { componentRegistry } from './simplified';
import { applyTheme, getThemeColor, themes } from '../utils/themeManager';
import { saveDashboard, updateDashboard } from '../utils/api';
import { generateRandomDashboard as generateDashboardAPI, getWidgetConfig, generatePackedDashboard, saveWidgetConfig, getUserPreferences, saveUserPreferences } from '../utils/sessionManager';

export default function DashboardPreview({ dashboardData, theme, onThemeChange, dashboardId, onDashboardSaved, urlParams, initialSkeletonMode, onSkeletonModeChange, initialDashboardName, initialEditMode = false }) {
  const [layout, setLayout] = useState([]);
  const [widgetDataMap, setWidgetDataMap] = useState({});
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [appName, setAppName] = useState(urlParams?.appName || 'Dashboard');
  const [appCategory, setAppCategory] = useState(urlParams?.appCategory || 'ad');
  const [customCategoryName, setCustomCategoryName] = useState('');
  const [customCategoryColor, setCustomCategoryColor] = useState('#138D8F');
  // In render mode, hide sidebar and navbar
  const isRenderMode = urlParams?.renderMode === true;
  const [showSidebar, setShowSidebar] = useState(!isRenderMode);
  const [showNavbar, setShowNavbar] = useState(!isRenderMode);
  const [showSkeletonMode, setShowSkeletonMode] = useState(false);
  const [skeletonTitlesOnly, setSkeletonTitlesOnly] = useState(false);
  const [showComponentLibrary, setShowComponentLibrary] = useState(false);
  const [hoveredWidget, setHoveredWidget] = useState(null);
  const [editingWidget, setEditingWidget] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [dashboardName, setDashboardName] = useState(initialDashboardName || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [showConfigSavedToast, setShowConfigSavedToast] = useState(false);
  const [savedDashboardId, setSavedDashboardId] = useState(dashboardId || null);
  const [showLayoutSettingsModal, setShowLayoutSettingsModal] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);
  const [showApiModal, setShowApiModal] = useState(false);
  const [expandedEndpoints, setExpandedEndpoints] = useState({});
  const [showChartTooltips, setShowChartTooltips] = useState(true);
  const [lastGeneratedPreset, setLastGeneratedPreset] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [minWidthCols, setMinWidthCols] = useState(1);
  const [showWidthModal, setShowWidthModal] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState({});
  const [showWidgetConfigModal, setShowWidgetConfigModal] = useState(false);
  const [widgetCount, setWidgetCount] = useState(6);
  const [showLayoutModal, setShowLayoutModal] = useState(false);
  const [userPreferences, setUserPreferences] = useState(null);
  const [settingsTab, setSettingsTab] = useState('general'); // 'general', 'widgets', 'display', 'badges', 'heights'

  // Default min height settings (value in grid rows, 7 rows ≈ 306px)
  const defaultMinHeightSettings = {
    cols2: { mode: 'auto', value: 7 },
    cols3: { mode: 'auto', value: 7 },
    colsMore: { mode: 'auto', value: 7 },
    rows1: { mode: 'auto', value: 7 },
    rows2: { mode: 'auto', value: 7 },
    rows3: { mode: 'auto', value: 7 },
    rowsMore: { mode: 'auto', value: 7 }
  };

  // Min height settings per column/row count (in grid rows, 1 row = 30px)
  const [minHeightSettings, setMinHeightSettings] = useState(defaultMinHeightSettings);

  // Safe getter for min height settings with defaults
  const getSetting = (key) => minHeightSettings?.[key] || defaultMinHeightSettings[key];

  // Grid constants for height calculations
  const ROW_HEIGHT = 30;
  const GRID_MARGIN = 16;

  // Convert grid rows to actual pixels (accounting for margins between rows)
  const rowsToPx = (rows) => rows * ROW_HEIGHT + Math.max(0, rows - 1) * GRID_MARGIN;

  // Valid height options for select dropdown (rows 3-12)
  const heightOptions = [
    { rows: 3, px: 122 },
    { rows: 4, px: 168 },
    { rows: 5, px: 214 },
    { rows: 6, px: 260 },
    { rows: 7, px: 306 },
    { rows: 8, px: 352 },
    { rows: 9, px: 398 },
    { rows: 10, px: 444 },
    { rows: 11, px: 490 },
    { rows: 12, px: 536 },
  ];

  // State for editing custom badges and themes
  const [editingBadge, setEditingBadge] = useState(null); // { id, name, color } or null
  const [newBadge, setNewBadge] = useState({ name: '', color: '#14B8A6' });
  const [editingTheme, setEditingTheme] = useState(null); // { id, name, primary, primaryLight, primaryDark } or null
  const [newTheme, setNewTheme] = useState({ name: '', primary: '#14B8A6', primaryLight: '#CCFBF1', primaryDark: '#0D9488' });

  // Ref for dashboard container (for thumbnail generation)
  const dashboardRef = useRef(null);

  // Helper function to save user preferences with toast notification
  const savePreferencesWithToast = async (newPrefs) => {
    setUserPreferences(newPrefs);
    try {
      await saveUserPreferences(newPrefs);
      setShowConfigSavedToast(true);
      setTimeout(() => setShowConfigSavedToast(false), 2000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
    }
  };

  // Load user preferences on mount and when settings modal opens
  useEffect(() => {
    const loadPreferences = () => {
      getUserPreferences()
        .then(prefs => {
          setUserPreferences(prefs);
          // Apply default badge text if set (only on mount)
          if (prefs?.defaultBadgeText && !urlParams?.appName && !userPreferences) {
            setAppName(prefs.defaultBadgeText);
          }
          // Load min height settings if saved, merge with defaults
          if (prefs?.minHeightSettings) {
            setMinHeightSettings(prev => ({
              ...prev,
              ...prefs.minHeightSettings
            }));
          }
        })
        .catch(error => {
          console.error('Failed to load user preferences:', error);
        });
    };

    // Load on mount
    loadPreferences();
  }, []);

  // Reload preferences when settings modal opens
  useEffect(() => {
    if (showLayoutSettingsModal && !userPreferences) {
      getUserPreferences()
        .then(prefs => {
          setUserPreferences(prefs);
        })
        .catch(error => {
          console.error('Failed to load user preferences:', error);
        });
    }
  }, [showLayoutSettingsModal]);

  // Load widget config when widget config modal or settings modal with widgets tab is opened
  useEffect(() => {
    if (showWidgetConfigModal || (showLayoutSettingsModal && settingsTab === 'widgets')) {
      getWidgetConfig()
        .then(config => {
          setWidgetConfig(config);
        })
        .catch(error => {
          console.error('Failed to load widget config:', error);
        });
    }
  }, [showWidgetConfigModal, showLayoutSettingsModal, settingsTab]);

  // Set edit mode from initial prop
  useEffect(() => {
    if (initialEditMode) {
      setIsEditMode(true);
    }
  }, [initialEditMode]);

  // Helper function to get min height based on widget width (columns)
  // Returns null for auto mode (no minimum enforced), or the manual value
  const getMinHeightForWidth = (width) => {
    if (width >= 6) {
      // 2 columns
      return minHeightSettings?.cols2?.mode === 'manual' ? minHeightSettings.cols2.value : null;
    } else if (width >= 4) {
      // 3 columns
      return minHeightSettings?.cols3?.mode === 'manual' ? minHeightSettings.cols3.value : null;
    } else {
      // 4+ columns
      return minHeightSettings?.colsMore?.mode === 'manual' ? minHeightSettings.colsMore.value : null;
    }
  };

  // Helper function to get min height based on dashboard row count
  const getMinHeightForRowCount = (rowCount) => {
    if (rowCount === 1) {
      return minHeightSettings?.rows1?.mode === 'manual' ? minHeightSettings.rows1.value : null;
    } else if (rowCount === 2) {
      return minHeightSettings?.rows2?.mode === 'manual' ? minHeightSettings.rows2.value : null;
    } else if (rowCount === 3) {
      return minHeightSettings?.rows3?.mode === 'manual' ? minHeightSettings.rows3.value : null;
    } else {
      // 4+ rows
      return minHeightSettings?.rowsMore?.mode === 'manual' ? minHeightSettings.rowsMore.value : null;
    }
  };

  // Combined function: gets the effective min height considering both width and row count
  // Row count takes precedence if set, otherwise falls back to width-based setting
  const getEffectiveMinHeight = (width, rowCount) => {
    const rowBasedMin = getMinHeightForRowCount(rowCount);
    if (rowBasedMin !== null) return rowBasedMin;
    return getMinHeightForWidth(width);
  };

  useEffect(() => {
    if (dashboardData?.gridLayout) {
      console.log('Setting layout from dashboardData:', dashboardData);
      console.log('gridLayout:', dashboardData.gridLayout);

      // Calculate unique row count (number of distinct Y positions)
      const uniqueYs = new Set(dashboardData.gridLayout.map(item => item.y));
      const rowCount = uniqueYs.size;

      // Extract layout positions with configurable min height
      const cleanLayout = dashboardData.gridLayout.map(item => {
        const minH = getEffectiveMinHeight(item.w, rowCount);
        const layoutItem = {
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: minH ? Math.max(item.h, minH) : item.h // Apply min only if manual mode
        };
        if (minH) layoutItem.minH = minH; // Only set minH constraint in manual mode
        return layoutItem;
      });

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
  }, [dashboardData, minHeightSettings]);

  useEffect(() => {
    // Handle custom themes from user preferences
    if (theme && theme.startsWith('custom-') && userPreferences?.customThemes) {
      const themeIndex = parseInt(theme.replace('custom-', ''), 10);
      const customTheme = userPreferences.customThemes[themeIndex];
      if (customTheme) {
        applyTheme(theme, customTheme);
        return;
      }
    }
    applyTheme(theme);
  }, [theme, userPreferences]);

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

  // Load widget configuration on mount
  useEffect(() => {
    const loadWidgetConfig = async () => {
      try {
        const config = await getWidgetConfig();
        // Convert to simple minCols map
        const configMap = {};
        for (const [key, value] of Object.entries(config)) {
          configMap[key] = value.minCols;
        }
        setWidgetConfig(configMap);
      } catch (error) {
        console.error('Failed to load widget config:', error);
      }
    };
    loadWidgetConfig();
  }, []);

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

  // Available components for random generation
  const availableComponents = [
    'SimpleKPI',
    'SimpleMetricCard',
    'SimpleScoreCard',
    'SimpleStatusCard',
    'SimpleComparisonCard',
    'SimpleAreaChart',
    'SimpleBarChart',
    'SimpleLineChart',
    'SimplePieChart',
    'SimpleGaugeChart',
    'SimpleHeatmap',
    'SimpleTable',
    'SimpleAgentList',
    'SimpleBadgeList',
    'SimplePriorityList',
    'SimpleRecentList',
    'SimpleStatusList',
    'SimpleTimelineCard',
    'SimpleProgressBar',
    'SimpleCategoryCards',
  ];

  // Layout presets
  const layoutPresets = {
    '2+2': { name: '2+2 Grid (2 rows, 2 cols)', pattern: [2, 2] },
    '3+3': { name: '3+3 Grid (2 rows, 3 cols)', pattern: [3, 3] },
    '4+4': { name: '4+4 Grid (2 rows, 4 cols)', pattern: [4, 4] },
    '3+1': { name: '3+1 Layout', pattern: [3, 1] },
    '1+3': { name: '1+3 Layout', pattern: [1, 3] },
    '2+3+2': { name: '2+3+2 Layout', pattern: [2, 3, 2] },
    '4+2': { name: '4+2 Layout', pattern: [4, 2] },
    '2+4': { name: '2+4 Layout', pattern: [2, 4] },
    '1+2+1': { name: '1+2+1 Layout', pattern: [1, 2, 1] },
    '3': { name: '3 Columns', pattern: [3] },
    '4': { name: '4 Columns', pattern: [4] },
    '6': { name: '6 Grid (2 rows, 3 cols)', pattern: [3, 3] },
  };

  // Parse layout preset to grid positions
  const parseLayoutPreset = (pattern) => {
    const gridLayout = [];
    let currentY = 0;
    const DEFAULT_H = 6; // Default height when auto mode
    const rowCount = pattern.length; // Number of rows in the pattern

    pattern.forEach((colsInRow) => {
      const widgetWidth = Math.floor(12 / colsInRow); // 12 columns total
      const minH = getEffectiveMinHeight(widgetWidth, rowCount);
      const rowHeight = minH || DEFAULT_H; // Use minH if manual, otherwise default

      for (let i = 0; i < colsInRow; i++) {
        const widgetId = `widget-${Date.now()}-${currentY}-${i}`;
        const layoutItem = {
          i: widgetId,
          x: i * widgetWidth,
          y: currentY,
          w: widgetWidth,
          h: rowHeight,
        };
        if (minH) layoutItem.minH = minH; // Only set minH in manual mode
        gridLayout.push(layoutItem);
      }

      currentY += rowHeight;
    });

    return gridLayout;
  };

  // Generate random dashboard with given layout (using API)
  const generateRandomDashboard = async (presetKey) => {
    if (!presetKey) return;

    setIsGenerating(true);
    setLastGeneratedPreset(presetKey);

    try {
      const dashboard = await generateDashboardAPI(presetKey, minWidthCols);

      // Calculate unique row count
      const uniqueYs = new Set(dashboard.gridLayout.map(item => item.y));
      const rowCount = uniqueYs.size;

      // Convert dashboard data to layout and widgetDataMap with configurable min height
      const newLayout = dashboard.gridLayout.map(item => {
        const minH = getEffectiveMinHeight(item.w, rowCount);
        const layoutItem = {
          i: item.i,
          x: item.x,
          y: item.y,
          w: item.w,
          h: minH ? Math.max(item.h, minH) : item.h // Apply min only if manual mode
        };
        if (minH) layoutItem.minH = minH; // Only set minH in manual mode
        return layoutItem;
      });

      const newWidgetDataMap = {};
      dashboard.widgets.forEach(widget => {
        newWidgetDataMap[widget.id] = {
          component: widget.component,
          props: widget.props,
        };
      });

      setLayout(newLayout);
      setWidgetDataMap(newWidgetDataMap);
    } catch (error) {
      console.error('Error generating dashboard:', error);
      alert('Failed to generate dashboard: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Regenerate last dashboard (re-generate with same preset)
  const regenerateDashboard = () => {
    if (lastGeneratedPreset) {
      generateRandomDashboard(lastGeneratedPreset);
    }
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

    // Determine skeleton mode for this widget
    // Priority: widget's skeletonMode prop > skeletonOverride > global skeletonTitlesOnly > global showSkeletonMode
    let widgetSkeletonMode;
    if (widgetData.props?.skeletonMode && widgetData.props.skeletonMode !== 'none') {
      // Widget has specific skeleton mode from config ('title', 'semi', 'full')
      widgetSkeletonMode = widgetData.props.skeletonMode;
    } else if (widgetData.props?.skeletonOverride !== undefined) {
      // Legacy: widget has skeleton override
      widgetSkeletonMode = widgetData.props.skeletonOverride ? 'semi' : false;
    } else if (skeletonTitlesOnly) {
      // Global skeleton titles only mode
      widgetSkeletonMode = 'title';
    } else if (showSkeletonMode) {
      // Fall back to global skeleton mode
      widgetSkeletonMode = 'semi';
    } else {
      widgetSkeletonMode = false;
    }

    const props = {
      ...widgetData.props,
      // Note: color is NOT passed here - widgets use useThemeColor hook to get theme color from CSS variables
      height: containerHeight, // Pass calculated height for charts
      skeleton: widgetSkeletonMode, // Pass skeleton mode: false, 'semi', or 'full'
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

                {/* Skeleton mode toggle - for all widgets */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editFormData.skeletonOverride || false}
                      onChange={(e) => setEditFormData({ ...editFormData, skeletonOverride: e.target.checked })}
                      className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-medium text-gray-700">Skeleton Loading Mode</span>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Override global skeleton setting for this widget
                      </p>
                    </div>
                  </label>
                </div>
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md shadow-2xl rounded-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {savedDashboardId ? 'Update Dashboard' : 'Save Dashboard'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">Save your dashboard configuration</p>
              </div>
              <button
                onClick={() => {
                  setShowSaveModal(false);
                  setSaveError(null);
                  setDashboardName('');
                }}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 transition-colors rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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
                      // Generate thumbnail - SAME as Export PNG
                      let thumbnail = null;
                      const gridElement = document.getElementById('dashboard-grid');
                      if (gridElement) {
                        try {
                          const dataUrl = await toPng(gridElement, {
                            quality: 1.0,
                            pixelRatio: 2,
                            backgroundColor: '#f9fafb',
                          });
                          thumbnail = dataUrl;
                          console.log('Thumbnail generated:', thumbnail.length, 'chars');
                        } catch (thumbnailError) {
                          console.warn('Failed to generate thumbnail:', thumbnailError);
                          // Continue without thumbnail
                        }
                      }

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
                        appCategory: appCategory,
                        hasThumbnail: !!thumbnail
                      }, null, 2));

                      let result;
                      if (savedDashboardId) {
                        result = await updateDashboard(savedDashboardId, dashboardName, fullDashboardData, theme, appName, appCategory, thumbnail);
                      } else {
                        result = await saveDashboard(dashboardName, fullDashboardData, theme, appName, appCategory, thumbnail);
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

      {/* Widget Configuration Modal */}
      {showWidgetConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white w-full max-w-4xl shadow-sm max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-teal-600 to-teal-700 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Widget Configuration</h3>
              <button
                onClick={() => setShowWidgetConfigModal(false)}
                className="text-white hover:bg-white hover:bg-opacity-20 p-2 transition-colors"
              >
                <span className="text-2xl">×</span>
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Widget</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Skeleton Mode</th>
                    <th className="text-left py-2 px-2 font-semibold text-gray-700">Min Columns</th>
                    <th className="text-center py-2 px-2 font-semibold text-gray-700">In Random</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(widgetConfig)
                    .filter(([_, config]) => config != null)
                    .map(([widgetType, config]) => (
                    <tr key={widgetType} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-2 font-medium text-gray-800">
                        {widgetType.replace('Simple', '')}
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={config?.skeletonMode || 'none'}
                          onChange={(e) => setWidgetConfig(prev => ({
                            ...prev,
                            [widgetType]: { ...(prev[widgetType] || {}), skeletonMode: e.target.value }
                          }))}
                          className="w-full px-2 py-1 border border-gray-300 text-xs bg-white"
                        >
                          <option value="none">None</option>
                          <option value="title">Title Only</option>
                          <option value="semi">Semi</option>
                          <option value="full">Full</option>
                        </select>
                      </td>
                      <td className="py-2 px-2">
                        <select
                          value={config?.minColumns || 4}
                          onChange={(e) => setWidgetConfig(prev => ({
                            ...prev,
                            [widgetType]: { ...(prev[widgetType] || {}), minColumns: parseInt(e.target.value) }
                          }))}
                          className="w-full px-2 py-1 border border-gray-300 text-xs bg-white"
                        >
                          <option value="2">2 (1/6)</option>
                          <option value="3">3 (1/4)</option>
                          <option value="4">4 (1/3)</option>
                          <option value="6">6 (1/2)</option>
                          <option value="12">12 (Full)</option>
                        </select>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <input
                          type="checkbox"
                          checked={config?.availableInRandom !== false}
                          onChange={(e) => setWidgetConfig(prev => ({
                            ...prev,
                            [widgetType]: { ...(prev[widgetType] || {}), availableInRandom: e.target.checked }
                          }))}
                          className="w-4 h-4 text-teal-600 rounded border-gray-300"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700">Generate widgets:</label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={widgetCount}
                  onChange={(e) => setWidgetCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 6)))}
                  className="w-20 px-3 py-1 border border-gray-300 text-sm"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowWidgetConfigModal(false)}
                  className="px-4 py-2 border border-gray-300 hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      await saveWidgetConfig(widgetConfig);
                      setShowWidgetConfigModal(false);
                    } catch (error) {
                      alert('Failed to save: ' + error.message);
                    }
                  }}
                  className="px-4 py-2 bg-gray-600 text-white hover:bg-gray-700 transition-colors text-sm"
                >
                  Save Config
                </button>
                <button
                  onClick={async () => {
                    setShowWidgetConfigModal(false);
                    setIsGenerating(true);
                    try {
                      await saveWidgetConfig(widgetConfig);
                      const dashboard = await generatePackedDashboard(widgetCount);
                      const newLayout = dashboard.gridLayout.map(item => ({
                        i: item.i, x: item.x, y: item.y, w: item.w, h: item.h,
                      }));
                      const newWidgetDataMap = {};
                      dashboard.widgets.forEach(widget => {
                        newWidgetDataMap[widget.id] = {
                          component: widget.component,
                          props: widget.props,
                        };
                      });
                      setLayout(newLayout);
                      setWidgetDataMap(newWidgetDataMap);
                    } catch (error) {
                      alert('Failed to generate: ' + error.message);
                    } finally {
                      setIsGenerating(false);
                    }
                  }}
                  disabled={isGenerating}
                  className="px-4 py-2 bg-teal-600 text-white hover:bg-teal-700 transition-colors text-sm disabled:opacity-50"
                >
                  {isGenerating ? 'Generating...' : 'Generate Dashboard'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout Generator Modal */}
      {showLayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-4xl shadow-2xl rounded-2xl border border-gray-200 max-h-[90vh] flex flex-col overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Choose Layout</h3>
                <p className="text-sm text-gray-500 mt-0.5">Select a layout to generate random widgets</p>
              </div>
              <button
                onClick={() => setShowLayoutModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 transition-colors rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {Object.entries(layoutPresets).map(([key, preset]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setShowLayoutModal(false);
                      generateRandomDashboard(key);
                    }}
                    disabled={isGenerating}
                    className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:shadow-md transition-all group disabled:opacity-50"
                  >
                    {/* Visual representation */}
                    <div className="aspect-video bg-gray-100 rounded mb-3 p-2 flex flex-col gap-1">
                      {preset.pattern.map((cols, rowIndex) => (
                        <div key={rowIndex} className="flex-1 flex gap-1">
                          {Array.from({ length: cols }).map((_, colIndex) => (
                            <div
                              key={colIndex}
                              className="flex-1 bg-purple-200 group-hover:bg-purple-400 rounded transition-colors"
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                    <div className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition-colors">
                      {preset.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {preset.pattern.reduce((a, b) => a + b, 0)} widgets
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end rounded-b-lg bg-gray-50">
              <button
                onClick={() => setShowLayoutModal(false)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 transition-colors text-sm rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dashboard Preview */}
      <div ref={dashboardRef} className={isRenderMode ? "" : "bg-gray-50 border border-gray-100"}>
        {/* Dashboard Grid with Navbar and Sidebar  */}
        <div
          id="dashboard-grid"
          className={isRenderMode ? "bg-[#f5f6f8]" : "bg-[#f5f6f8] rounded-lg overflow-hidden"}
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

          <div className={isRenderMode ? "" : "flex min-h-[700px]"}>
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
            <div className={isRenderMode ? "" : "flex-1 p-8"} id="render-target">
              <div style={{ width: '100%' }}>
                {layout.length === 0 && !isRenderMode ? (
                  <div className="flex flex-col items-center justify-center py-12 px-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50/50">
                    <div className="w-14 h-14 mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                      <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-1">Choose a layout to get started</h3>
                    <p className="text-sm text-gray-500 text-center max-w-md mb-6">
                      Select a layout preset below or add widgets manually
                    </p>

                    {/* Layout Presets Grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-6 w-full max-w-2xl">
                      {Object.entries(layoutPresets).map(([key, preset]) => (
                        <button
                          key={key}
                          onClick={() => generateRandomDashboard(key)}
                          disabled={isGenerating}
                          className="flex flex-col items-center p-3 bg-white border border-gray-200 rounded-lg hover:border-teal-400 hover:bg-teal-50 transition-all group disabled:opacity-50"
                        >
                          {/* Mini layout preview */}
                          <div className="w-12 h-10 mb-2 flex flex-col gap-0.5">
                            {preset.pattern.map((cols, rowIdx) => (
                              <div key={rowIdx} className="flex gap-0.5 flex-1">
                                {Array.from({ length: cols }).map((_, colIdx) => (
                                  <div
                                    key={colIdx}
                                    className="flex-1 bg-gray-200 group-hover:bg-teal-300 rounded-sm transition-colors"
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-medium text-gray-600 group-hover:text-teal-700">{key}</span>
                        </button>
                      ))}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>or</span>
                    </div>

                    <button
                      onClick={() => setShowSidebar(true)}
                      className="mt-4 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Widgets Manually
                    </button>
                  </div>
                ) : (
                  <GridLayout
                    className="layout"
                    layout={layout}
                    cols={12}
                    rowHeight={30}
                    width={isRenderMode ? 1200 : (showSidebar ? 900 : 1164)}
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
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Edit Mode Instructions */}
        {isEditMode && !isRenderMode && (
          <div className="mt-4 p-4 bg-blue-50">
            <p className="text-sm text-blue-900">
              <strong>Edit Mode:</strong> Drag widgets to reposition them. Drag the
              bottom-right corner to resize. Click "Done Editing" when finished.
            </p>
          </div>
        )}

        {/* Metadata */}
        {!isRenderMode && <div className="mt-6 p-4 bg-white border border-gray-100">
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
                  {dashboardData.metadata?.analyzedAt
                    ? new Date(dashboardData.metadata.analyzedAt).toLocaleTimeString()
                    : new Date().toLocaleTimeString()}
                </div>
              </div>
            </div>
          </div>
        </div>}

        {/* Footer */}
        {!isRenderMode && <div className="mt-4 p-3 bg-white border border-gray-100">
          <div className="text-center text-xs text-gray-500">
            Created by <span className="font-medium text-gray-700">Aleksander Miesak</span>
          </div>
        </div>}
      </div>

      {/* Settings Modal with Tabs */}
      {showLayoutSettingsModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl rounded-2xl border border-gray-200">
            {/* Modal Header */}
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500 mt-0.5">Configure your dashboard preferences</p>
              </div>
              <button
                onClick={() => setShowLayoutSettingsModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 transition-colors rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 px-6 bg-gray-50/50">
              <div className="flex gap-1">
                <button
                  onClick={() => setSettingsTab('general')}
                  className={`px-4 py-3 text-sm font-medium transition-all rounded-t-lg ${
                    settingsTab === 'general'
                      ? 'text-teal-600 bg-white border-t-2 border-x border-teal-500 border-x-gray-100 -mb-px'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  General
                </button>
                <button
                  onClick={() => setSettingsTab('widgets')}
                  className={`px-4 py-3 text-sm font-medium transition-all rounded-t-lg ${
                    settingsTab === 'widgets'
                      ? 'text-teal-600 bg-white border-t-2 border-x border-teal-500 border-x-gray-100 -mb-px'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Widget Config
                </button>
                <button
                  onClick={() => setSettingsTab('display')}
                  className={`px-4 py-3 text-sm font-medium transition-all rounded-t-lg ${
                    settingsTab === 'display'
                      ? 'text-teal-600 bg-white border-t-2 border-x border-teal-500 border-x-gray-100 -mb-px'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Display
                </button>
                <button
                  onClick={() => setSettingsTab('badges')}
                  className={`px-4 py-3 text-sm font-medium transition-all rounded-t-lg ${
                    settingsTab === 'badges'
                      ? 'text-teal-600 bg-white border-t-2 border-x border-teal-500 border-x-gray-100 -mb-px'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Badges & Themes
                </button>
                <button
                  onClick={() => setSettingsTab('heights')}
                  className={`px-4 py-3 text-sm font-medium transition-all rounded-t-lg ${
                    settingsTab === 'heights'
                      ? 'text-teal-600 bg-white border-t-2 border-x border-teal-500 border-x-gray-100 -mb-px'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Min Heights
                </button>
              </div>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* General Tab */}
              {settingsTab === 'general' && (
                <div className="space-y-6">
                  {/* Loading state */}
                  {!userPreferences && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3 text-gray-500">
                        <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                        <span>Loading preferences...</span>
                      </div>
                    </div>
                  )}

                  {/* App Information Section */}
                  {userPreferences && (
                  <>
                  <div className="bg-gray-50 p-4 rounded-lg">
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
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      {/* Category Badge */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          Category Badge
                        </label>
                        {/* User's badges from preferences */}
                        <div className="grid grid-cols-3 gap-2">
                          {(userPreferences?.customBadges || []).map((badge, index) => (
                            <button
                              key={`badge-${index}`}
                              onClick={() => {
                                setAppCategory('custom');
                                setCustomCategoryName(badge.name);
                                setCustomCategoryColor(badge.color);
                              }}
                              className={`px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all rounded ${
                                appCategory === 'custom' && customCategoryName === badge.name
                                  ? 'ring-2 ring-blue-500 ring-offset-2'
                                  : 'opacity-60 hover:opacity-100'
                              }`}
                              style={{
                                background: `linear-gradient(to right, ${badge.color}, ${badge.color}dd)`,
                                color: 'white'
                              }}
                            >
                              {badge.name}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Manage badges in the "Badges & Themes" tab
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Theme Picker Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-3">Widget Theme</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {(userPreferences?.customThemes || []).map((customTheme, index) => (
                        <button
                          key={`theme-${index}`}
                          onClick={() => {
                            // Apply custom theme colors via CSS variables
                            document.documentElement.style.setProperty('--theme-primary', customTheme.primary);
                            document.documentElement.style.setProperty('--theme-primary-light', customTheme.primaryLight);
                            document.documentElement.style.setProperty('--theme-primary-dark', customTheme.primaryDark);
                            // Dispatch theme change event for widgets to react
                            window.dispatchEvent(new CustomEvent('themechange'));
                            onThemeChange(`custom-${index}`);
                          }}
                          className={`px-4 py-2 text-xs font-bold tracking-wide uppercase transition-all rounded ${
                            theme === `custom-${index}`
                              ? 'ring-2 ring-blue-500 ring-offset-2'
                              : 'opacity-60 hover:opacity-100'
                          }`}
                          style={{
                            background: `linear-gradient(to right, ${customTheme.primary}, ${customTheme.primaryDark})`,
                            color: 'white'
                          }}
                        >
                          {customTheme.name}
                        </button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Manage themes in the "Badges & Themes" tab
                    </p>
                  </div>
                  </>
                  )}
                </div>
              )}

              {/* Widget Config Tab */}
              {settingsTab === 'widgets' && (
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Widget Configuration</h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Configure how each widget type appears in generated dashboards. Changes affect random dashboard generation.
                    </p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b-2 border-gray-200">
                          <th className="text-left py-2 px-2 font-semibold text-gray-700">Widget</th>
                          <th className="text-left py-2 px-2 font-semibold text-gray-700">Skeleton Mode</th>
                          <th className="text-left py-2 px-2 font-semibold text-gray-700">Min Columns</th>
                          <th className="text-center py-2 px-2 font-semibold text-gray-700">In Random</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(widgetConfig)
                          .filter(([_, config]) => config != null)
                          .map(([widgetType, config]) => (
                          <tr key={widgetType} className="border-b border-gray-100 hover:bg-white">
                            <td className="py-2 px-2 font-medium text-gray-800">
                              {widgetType.replace('Simple', '')}
                            </td>
                            <td className="py-2 px-2">
                              <select
                                value={config?.skeletonMode || 'semi'}
                                onChange={(e) => setWidgetConfig(prev => ({
                                  ...prev,
                                  [widgetType]: { ...(prev[widgetType] || {}), skeletonMode: e.target.value }
                                }))}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                              >
                                <option value="none">None</option>
                                <option value="semi">Semi</option>
                                <option value="full">Full</option>
                              </select>
                            </td>
                            <td className="py-2 px-2">
                              <select
                                value={config?.minColumns || 4}
                                onChange={(e) => setWidgetConfig(prev => ({
                                  ...prev,
                                  [widgetType]: { ...(prev[widgetType] || {}), minColumns: parseInt(e.target.value) }
                                }))}
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs bg-white"
                              >
                                <option value="2">2 (1/6)</option>
                                <option value="3">3 (1/4)</option>
                                <option value="4">4 (1/3)</option>
                                <option value="6">6 (1/2)</option>
                                <option value="12">12 (Full)</option>
                              </select>
                            </td>
                            <td className="py-2 px-2 text-center">
                              <input
                                type="checkbox"
                                checked={config?.availableInRandom !== false}
                                onChange={(e) => setWidgetConfig(prev => ({
                                  ...prev,
                                  [widgetType]: { ...(prev[widgetType] || {}), availableInRandom: e.target.checked }
                                }))}
                                className="w-4 h-4 text-blue-600 rounded border-gray-300"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Generator settings */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Generator Settings</h4>
                    <div className="flex items-center gap-4">
                      <label className="text-sm text-gray-700">Default widget count:</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={widgetCount}
                        onChange={(e) => setWidgetCount(Math.max(1, Math.min(20, parseInt(e.target.value) || 6)))}
                        className="w-20 px-3 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Display Options Tab */}
              {settingsTab === 'display' && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4">Display Options</h4>
                  <div className="space-y-4">
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
                          if (newMode) setSkeletonTitlesOnly(false); // Disable titles-only when full skeleton enabled
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

                    {/* Skeleton Titles Only */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">Skeleton Titles Only</span>
                      <button
                        onClick={() => {
                          const newMode = !skeletonTitlesOnly;
                          setSkeletonTitlesOnly(newMode);
                          if (newMode) setShowSkeletonMode(false); // Disable full skeleton when titles-only enabled
                        }}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          skeletonTitlesOnly ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            skeletonTitlesOnly ? 'translate-x-6' : 'translate-x-1'
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
              )}

              {/* Badges & Themes Tab */}
              {settingsTab === 'badges' && (
                <div className="space-y-6">
                  {/* Custom Category Badges Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Custom Category Badges</h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Create custom badges to categorize your dashboards. Each badge has a name and color.
                    </p>

                    {/* List of existing custom badges */}
                    <div className="space-y-2 mb-4">
                      {(userPreferences?.customBadges || []).map((badge, index) => (
                        <div key={index} className="flex items-center gap-3 bg-white p-3 rounded border border-gray-200">
                          {editingBadge?.id === index ? (
                            // Editing mode
                            <>
                              <input
                                type="color"
                                value={editingBadge.color}
                                onChange={(e) => setEditingBadge({ ...editingBadge, color: e.target.value })}
                                className="w-10 h-10 cursor-pointer rounded border-0"
                              />
                              <input
                                type="text"
                                value={editingBadge.name}
                                onChange={(e) => setEditingBadge({ ...editingBadge, name: e.target.value })}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                                placeholder="Badge name"
                              />
                              <button
                                onClick={() => {
                                  const updatedBadges = [...(userPreferences?.customBadges || [])];
                                  updatedBadges[index] = { name: editingBadge.name, color: editingBadge.color };
                                  const newPrefs = { ...userPreferences, customBadges: updatedBadges };
                                  savePreferencesWithToast(newPrefs);
                                  setEditingBadge(null);
                                }}
                                className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => setEditingBadge(null)}
                                className="px-3 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                              >
                                Cancel
                              </button>
                            </>
                          ) : (
                            // Display mode
                            <>
                              <div
                                className="w-10 h-10 rounded"
                                style={{ backgroundColor: badge.color }}
                              />
                              <span
                                className="flex-1 px-3 py-2 text-xs font-bold tracking-wide uppercase text-white rounded"
                                style={{ background: `linear-gradient(to right, ${badge.color}, ${badge.color}dd)` }}
                              >
                                {badge.name}
                              </span>
                              <button
                                onClick={() => setEditingBadge({ id: index, name: badge.name, color: badge.color })}
                                className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => {
                                  const updatedBadges = (userPreferences?.customBadges || []).filter((_, i) => i !== index);
                                  const newPrefs = { ...userPreferences, customBadges: updatedBadges };
                                  savePreferencesWithToast(newPrefs);
                                }}
                                className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                              >
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add new badge form */}
                    <div className="flex items-center gap-3 p-3 bg-white rounded border-2 border-dashed border-gray-300">
                      <input
                        type="color"
                        value={newBadge.color}
                        onChange={(e) => setNewBadge({ ...newBadge, color: e.target.value })}
                        className="w-10 h-10 cursor-pointer rounded border-0"
                      />
                      <input
                        type="text"
                        value={newBadge.name}
                        onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="New badge name (e.g., Analytics, DevOps)"
                      />
                      <button
                        onClick={() => {
                          if (newBadge.name.trim()) {
                            const updatedBadges = [...(userPreferences?.customBadges || []), { name: newBadge.name, color: newBadge.color }];
                            const newPrefs = { ...userPreferences, customBadges: updatedBadges };
                            savePreferencesWithToast(newPrefs);
                            setNewBadge({ name: '', color: '#14B8A6' });
                          }
                        }}
                        disabled={!newBadge.name.trim()}
                        className="px-4 py-2 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Badge
                      </button>
                    </div>
                  </div>

                  {/* Custom Widget Themes Section */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Custom Widget Themes</h4>
                    <p className="text-xs text-gray-500 mb-4">
                      Create custom color themes for your widgets. Each theme has primary, light, and dark color variants.
                    </p>

                    {/* List of existing custom themes */}
                    <div className="space-y-2 mb-4">
                      {(userPreferences?.customThemes || []).map((customTheme, index) => (
                        <div key={index} className="bg-white p-3 rounded border border-gray-200">
                          {editingTheme?.id === index ? (
                            // Editing mode
                            <div className="space-y-3">
                              <input
                                type="text"
                                value={editingTheme.name}
                                onChange={(e) => setEditingTheme({ ...editingTheme, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                                placeholder="Theme name"
                              />
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Primary</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={editingTheme.primary}
                                      onChange={(e) => setEditingTheme({ ...editingTheme, primary: e.target.value })}
                                      className="w-10 h-10 cursor-pointer rounded border-0"
                                    />
                                    <input
                                      type="text"
                                      value={editingTheme.primary}
                                      onChange={(e) => setEditingTheme({ ...editingTheme, primary: e.target.value })}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Light</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={editingTheme.primaryLight}
                                      onChange={(e) => setEditingTheme({ ...editingTheme, primaryLight: e.target.value })}
                                      className="w-10 h-10 cursor-pointer rounded border-0"
                                    />
                                    <input
                                      type="text"
                                      value={editingTheme.primaryLight}
                                      onChange={(e) => setEditingTheme({ ...editingTheme, primaryLight: e.target.value })}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                                    />
                                  </div>
                                </div>
                                <div>
                                  <label className="block text-xs text-gray-600 mb-1">Dark</label>
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="color"
                                      value={editingTheme.primaryDark}
                                      onChange={(e) => setEditingTheme({ ...editingTheme, primaryDark: e.target.value })}
                                      className="w-10 h-10 cursor-pointer rounded border-0"
                                    />
                                    <input
                                      type="text"
                                      value={editingTheme.primaryDark}
                                      onChange={(e) => setEditingTheme({ ...editingTheme, primaryDark: e.target.value })}
                                      className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setEditingTheme(null)}
                                  className="px-3 py-2 bg-gray-400 text-white rounded text-sm hover:bg-gray-500"
                                >
                                  Cancel
                                </button>
                                <button
                                  onClick={() => {
                                    const updatedThemes = [...(userPreferences?.customThemes || [])];
                                    updatedThemes[index] = {
                                      name: editingTheme.name,
                                      primary: editingTheme.primary,
                                      primaryLight: editingTheme.primaryLight,
                                      primaryDark: editingTheme.primaryDark
                                    };
                                    const newPrefs = { ...userPreferences, customThemes: updatedThemes };
                                    savePreferencesWithToast(newPrefs);
                                    setEditingTheme(null);
                                  }}
                                  className="px-3 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          ) : (
                            // Display mode
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex gap-1">
                                  <div className="w-8 h-8 rounded" style={{ backgroundColor: customTheme.primary }} title="Primary" />
                                  <div className="w-8 h-8 rounded" style={{ backgroundColor: customTheme.primaryLight }} title="Light" />
                                  <div className="w-8 h-8 rounded" style={{ backgroundColor: customTheme.primaryDark }} title="Dark" />
                                </div>
                                <span className="font-medium text-gray-800">{customTheme.name}</span>
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setEditingTheme({
                                    id: index,
                                    name: customTheme.name,
                                    primary: customTheme.primary,
                                    primaryLight: customTheme.primaryLight,
                                    primaryDark: customTheme.primaryDark
                                  })}
                                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    const updatedThemes = (userPreferences?.customThemes || []).filter((_, i) => i !== index);
                                    const newPrefs = { ...userPreferences, customThemes: updatedThemes };
                                    savePreferencesWithToast(newPrefs);
                                  }}
                                  className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Add new theme form */}
                    <div className="p-3 bg-white rounded border-2 border-dashed border-gray-300 space-y-3">
                      <input
                        type="text"
                        value={newTheme.name}
                        onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        placeholder="New theme name (e.g., Ocean, Sunset, Forest)"
                      />
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Primary</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={newTheme.primary}
                              onChange={(e) => setNewTheme({ ...newTheme, primary: e.target.value })}
                              className="w-10 h-10 cursor-pointer rounded border-0"
                            />
                            <input
                              type="text"
                              value={newTheme.primary}
                              onChange={(e) => setNewTheme({ ...newTheme, primary: e.target.value })}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Light</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={newTheme.primaryLight}
                              onChange={(e) => setNewTheme({ ...newTheme, primaryLight: e.target.value })}
                              className="w-10 h-10 cursor-pointer rounded border-0"
                            />
                            <input
                              type="text"
                              value={newTheme.primaryLight}
                              onChange={(e) => setNewTheme({ ...newTheme, primaryLight: e.target.value })}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Dark</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={newTheme.primaryDark}
                              onChange={(e) => setNewTheme({ ...newTheme, primaryDark: e.target.value })}
                              className="w-10 h-10 cursor-pointer rounded border-0"
                            />
                            <input
                              type="text"
                              value={newTheme.primaryDark}
                              onChange={(e) => setNewTheme({ ...newTheme, primaryDark: e.target.value })}
                              className="flex-1 px-2 py-1 border border-gray-300 rounded text-xs font-mono"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (newTheme.name.trim()) {
                            const updatedThemes = [...(userPreferences?.customThemes || []), {
                              name: newTheme.name,
                              primary: newTheme.primary,
                              primaryLight: newTheme.primaryLight,
                              primaryDark: newTheme.primaryDark
                            }];
                            const newPrefs = { ...userPreferences, customThemes: updatedThemes };
                            savePreferencesWithToast(newPrefs);
                            setNewTheme({ name: '', primary: '#14B8A6', primaryLight: '#CCFBF1', primaryDark: '#0D9488' });
                          }
                        }}
                        disabled={!newTheme.name.trim()}
                        className="w-full px-4 py-2 bg-teal-600 text-white rounded text-sm hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" /> Add Theme
                      </button>
                    </div>
                  </div>

                  {/* Default Settings */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-gray-700 mb-4">Default Settings</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Default Badge Text</label>
                        <input
                          type="text"
                          value={userPreferences?.defaultBadgeText || 'Dashboard'}
                          onChange={(e) => {
                            setUserPreferences({ ...userPreferences, defaultBadgeText: e.target.value });
                          }}
                          onBlur={(e) => {
                            const newPrefs = { ...userPreferences, defaultBadgeText: e.target.value };
                            savePreferencesWithToast(newPrefs);
                          }}
                          placeholder="e.g., Dashboard, My App"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
                        />
                        <p className="text-xs text-gray-500 mt-1">This text will be used as the default app name for new dashboards.</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Heights Tab */}
              {settingsTab === 'heights' && (
                <div className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      Configure minimum widget heights. <strong>Auto</strong> uses natural height from generator,
                      <strong> Manual</strong> enforces a fixed minimum. Row settings take precedence over column settings.
                    </p>
                  </div>

                  <h3 className="text-sm font-semibold text-gray-700 mb-4 mt-6">By Column Count</h3>

                  {/* 2 Columns (w=6) */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">2 Columns</h4>
                        <p className="text-xs text-gray-500">Widgets spanning half width (6 grid columns)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, cols2: { ...getSetting('cols2'), mode: 'auto' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border ${
                            getSetting('cols2').mode === 'auto'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Auto
                        </button>
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, cols2: { ...getSetting('cols2'), mode: 'manual' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border-y border-r ${
                            getSetting('cols2').mode === 'manual'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>
                    {getSetting('cols2').mode === 'manual' && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        <label className="text-sm text-gray-600">Min height:</label>
                        <select
                          value={getSetting('cols2').value}
                          onChange={(e) => {
                            const rows = parseInt(e.target.value);
                            const newSettings = { ...minHeightSettings, cols2: { ...getSetting('cols2'), value: rows } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                        >
                          {heightOptions.map(opt => (
                            <option key={opt.rows} value={opt.rows}>{opt.px}px</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 3 Columns (w=4) */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">3 Columns</h4>
                        <p className="text-xs text-gray-500">Widgets spanning third width (4 grid columns)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, cols3: { ...getSetting('cols3'), mode: 'auto' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border ${
                            getSetting('cols3').mode === 'auto'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Auto
                        </button>
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, cols3: { ...getSetting('cols3'), mode: 'manual' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border-y border-r ${
                            getSetting('cols3').mode === 'manual'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>
                    {getSetting('cols3').mode === 'manual' && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        <label className="text-sm text-gray-600">Min height:</label>
                        <select
                          value={getSetting('cols3').value}
                          onChange={(e) => {
                            const rows = parseInt(e.target.value);
                            const newSettings = { ...minHeightSettings, cols3: { ...getSetting('cols3'), value: rows } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                        >
                          {heightOptions.map(opt => (
                            <option key={opt.rows} value={opt.rows}>{opt.px}px</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 4+ Columns (w<=3) */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">4+ Columns</h4>
                        <p className="text-xs text-gray-500">Widgets spanning quarter width or less (≤3 grid columns)</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, colsMore: { ...getSetting('colsMore'), mode: 'auto' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border ${
                            getSetting('colsMore').mode === 'auto'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Auto
                        </button>
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, colsMore: { ...getSetting('colsMore'), mode: 'manual' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border-y border-r ${
                            getSetting('colsMore').mode === 'manual'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>
                    {getSetting('colsMore').mode === 'manual' && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        <label className="text-sm text-gray-600">Min height:</label>
                        <select
                          value={getSetting('colsMore').value}
                          onChange={(e) => {
                            const rows = parseInt(e.target.value);
                            const newSettings = { ...minHeightSettings, colsMore: { ...getSetting('colsMore'), value: rows } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                        >
                          {heightOptions.map(opt => (
                            <option key={opt.rows} value={opt.rows}>{opt.px}px</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-200 my-6"></div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-4">By Row Count (takes precedence over columns)</h3>

                  {/* 1 Row */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">1 Row</h4>
                        <p className="text-xs text-gray-500">Dashboard with single row of widgets</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, rows1: { ...getSetting('rows1'), mode: 'auto' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border ${
                            getSetting('rows1').mode === 'auto'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Auto
                        </button>
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, rows1: { ...getSetting('rows1'), mode: 'manual' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border-y border-r ${
                            getSetting('rows1').mode === 'manual'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>
                    {getSetting('rows1').mode === 'manual' && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        <label className="text-sm text-gray-600">Min height:</label>
                        <select
                          value={getSetting('rows1').value}
                          onChange={(e) => {
                            const rows = parseInt(e.target.value);
                            const newSettings = { ...minHeightSettings, rows1: { ...getSetting('rows1'), value: rows } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                        >
                          {heightOptions.map(opt => (
                            <option key={opt.rows} value={opt.rows}>{opt.px}px</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 2 Rows */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">2 Rows</h4>
                        <p className="text-xs text-gray-500">Dashboard with two rows of widgets</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, rows2: { ...getSetting('rows2'), mode: 'auto' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border ${
                            getSetting('rows2').mode === 'auto'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Auto
                        </button>
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, rows2: { ...getSetting('rows2'), mode: 'manual' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border-y border-r ${
                            getSetting('rows2').mode === 'manual'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>
                    {getSetting('rows2').mode === 'manual' && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        <label className="text-sm text-gray-600">Min height:</label>
                        <select
                          value={getSetting('rows2').value}
                          onChange={(e) => {
                            const rows = parseInt(e.target.value);
                            const newSettings = { ...minHeightSettings, rows2: { ...getSetting('rows2'), value: rows } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                        >
                          {heightOptions.map(opt => (
                            <option key={opt.rows} value={opt.rows}>{opt.px}px</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 3 Rows */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">3 Rows</h4>
                        <p className="text-xs text-gray-500">Dashboard with three rows of widgets</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, rows3: { ...getSetting('rows3'), mode: 'auto' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border ${
                            getSetting('rows3').mode === 'auto'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Auto
                        </button>
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, rows3: { ...getSetting('rows3'), mode: 'manual' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border-y border-r ${
                            getSetting('rows3').mode === 'manual'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>
                    {getSetting('rows3').mode === 'manual' && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        <label className="text-sm text-gray-600">Min height:</label>
                        <select
                          value={getSetting('rows3').value}
                          onChange={(e) => {
                            const rows = parseInt(e.target.value);
                            const newSettings = { ...minHeightSettings, rows3: { ...getSetting('rows3'), value: rows } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                        >
                          {heightOptions.map(opt => (
                            <option key={opt.rows} value={opt.rows}>{opt.px}px</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 4+ Rows */}
                  <div className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-900">4+ Rows</h4>
                        <p className="text-xs text-gray-500">Dashboard with four or more rows of widgets</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, rowsMore: { ...getSetting('rowsMore'), mode: 'auto' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-l-lg border ${
                            getSetting('rowsMore').mode === 'auto'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Auto
                        </button>
                        <button
                          onClick={() => {
                            const newSettings = { ...minHeightSettings, rowsMore: { ...getSetting('rowsMore'), mode: 'manual' } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className={`px-3 py-1.5 text-xs font-medium rounded-r-lg border-y border-r ${
                            getSetting('rowsMore').mode === 'manual'
                              ? 'bg-teal-500 text-white border-teal-500'
                              : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          Manual
                        </button>
                      </div>
                    </div>
                    {getSetting('rowsMore').mode === 'manual' && (
                      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                        <label className="text-sm text-gray-600">Min height:</label>
                        <select
                          value={getSetting('rowsMore').value}
                          onChange={(e) => {
                            const rows = parseInt(e.target.value);
                            const newSettings = { ...minHeightSettings, rowsMore: { ...getSetting('rowsMore'), value: rows } };
                            setMinHeightSettings(newSettings);
                            savePreferencesWithToast({ ...userPreferences, minHeightSettings: newSettings });
                          }}
                          className="px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                        >
                          {heightOptions.map(opt => (
                            <option key={opt.rows} value={opt.rows}>{opt.px}px</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                    <strong>Note:</strong> Row-based settings take precedence over column-based. Auto mode uses the natural height from generator. Changes apply to newly generated dashboards.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="border-t border-gray-100 px-6 py-4 flex justify-between items-center bg-gray-50/50">
              {settingsTab === 'widgets' && (
                <button
                  onClick={async () => {
                    try {
                      await saveWidgetConfig(widgetConfig);
                      setShowConfigSavedToast(true);
                      setTimeout(() => setShowConfigSavedToast(false), 2000);
                    } catch (error) {
                      alert('Failed to save: ' + error.message);
                    }
                  }}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors font-medium text-sm rounded-lg border border-gray-200"
                >
                  Save Widget Config
                </button>
              )}
              {settingsTab !== 'widgets' && <div />}
              <button
                onClick={() => setShowLayoutSettingsModal(false)}
                className="px-5 py-2.5 bg-teal-600 text-white hover:bg-teal-700 transition-colors font-medium text-sm rounded-lg shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* JSON Modal */}
      {showJsonModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-4xl max-h-[80vh] overflow-hidden shadow-2xl rounded-2xl border border-gray-200">
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Dashboard JSON</h3>
                <p className="text-sm text-gray-500 mt-0.5">Export your dashboard configuration</p>
              </div>
              <button
                onClick={() => setShowJsonModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 transition-colors rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto border border-gray-100">
                <code>{JSON.stringify(getDashboardJson(), null, 2)}</code>
              </pre>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(JSON.stringify(getDashboardJson(), null, 2));
                  }}
                  className="px-4 py-2.5 bg-teal-600 text-white hover:bg-teal-700 transition-colors text-sm font-medium rounded-lg shadow-sm"
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
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-5xl max-h-[85vh] overflow-hidden shadow-2xl rounded-2xl border border-gray-200">
            <div className="px-6 py-5 flex items-center justify-between border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">API Documentation</h3>
                <p className="text-sm text-gray-500 mt-0.5">Integrate with external systems</p>
              </div>
              <button
                onClick={() => setShowApiModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 transition-colors rounded-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
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

                {/* Section: Authentication */}
                <div className="mt-6 mb-3">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Authentication</h4>
                </div>

                {/* Login Endpoint */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleEndpoint('login')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">POST</span>
                      <span className="font-semibold text-gray-900">/api/auth/login</span>
                    </div>
                    <span className="text-gray-400">{expandedEndpoints['login'] ? '−' : '+'}</span>
                  </button>
                  {expandedEndpoints['login'] && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-3">
                        Login or register by email. Returns API key for authenticated requests.
                      </p>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Body:</h5>
                        <p className="text-xs text-gray-600">• <strong>email</strong>: User email address (string)</p>
                      </div>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Returns:</h5>
                        <p className="text-xs text-gray-600">• session_key: API key for authenticated requests</p>
                        <p className="text-xs text-gray-600">• is_new: Boolean indicating if this is a new user</p>
                      </div>
                      <div className="relative">
                        <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200"><code>{`curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com"}'`}</code></pre>
                        <button
                          onClick={() => copyToClipboard(`curl -X POST http://localhost:3001/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "user@example.com"}'`)}
                          className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Generator */}
                <div className="mt-6 mb-3">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Dashboard Generator</h4>
                </div>

                {/* Generate Packed Dashboard Endpoint */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleEndpoint('generate-packed')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded">POST</span>
                      <span className="font-semibold text-gray-900">/api/generate/packed</span>
                    </div>
                    <span className="text-gray-400">{expandedEndpoints['generate-packed'] ? '−' : '+'}</span>
                  </button>
                  {expandedEndpoints['generate-packed'] && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-3">
                        Generates a random dashboard using bin-packing algorithm. Requires API key.
                      </p>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Headers:</h5>
                        <p className="text-xs text-gray-600">• <strong>X-Session-Key</strong>: Your API key</p>
                      </div>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Body:</h5>
                        <p className="text-xs text-gray-600">• <strong>widgetCount</strong>: Number of widgets to generate (1-20, default: 6)</p>
                      </div>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Returns:</h5>
                        <p className="text-xs text-gray-600">• Complete dashboard with gridLayout and widgets array</p>
                      </div>
                      <div className="relative">
                        <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200"><code>{`curl -X POST http://localhost:3001/api/generate/packed \\
  -H "Content-Type: application/json" \\
  -H "X-Session-Key: YOUR_API_KEY" \\
  -d '{"widgetCount": 6}'`}</code></pre>
                        <button
                          onClick={() => copyToClipboard(`curl -X POST http://localhost:3001/api/generate/packed \\
  -H "Content-Type: application/json" \\
  -H "X-Session-Key: YOUR_API_KEY" \\
  -d '{"widgetCount": 6}'`)}
                          className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section: Configuration */}
                <div className="mt-6 mb-3">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wide">Configuration</h4>
                </div>

                {/* Widget Config Endpoint */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleEndpoint('widget-config')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">GET</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">PUT</span>
                      <span className="font-semibold text-gray-900">/api/widgets/config</span>
                    </div>
                    <span className="text-gray-400">{expandedEndpoints['widget-config'] ? '−' : '+'}</span>
                  </button>
                  {expandedEndpoints['widget-config'] && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-3">
                        Get or update widget configuration for dashboard generation. Each widget type can have custom skeleton mode, minimum columns, and availability in random generation.
                      </p>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Headers:</h5>
                        <p className="text-xs text-gray-600">• <strong>X-Session-Key</strong>: Your API key</p>
                      </div>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Config Options per Widget:</h5>
                        <p className="text-xs text-gray-600">• <strong>skeletonMode</strong>: "none", "semi", or "full"</p>
                        <p className="text-xs text-gray-600">• <strong>minColumns</strong>: Minimum width (2, 3, 4, 6, 12)</p>
                        <p className="text-xs text-gray-600">• <strong>availableInRandom</strong>: Include in random generation</p>
                      </div>
                      <div className="relative">
                        <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200"><code>{`# Get config
curl http://localhost:3001/api/widgets/config \\
  -H "X-Session-Key: YOUR_API_KEY"

# Update config
curl -X PUT http://localhost:3001/api/widgets/config \\
  -H "Content-Type: application/json" \\
  -H "X-Session-Key: YOUR_API_KEY" \\
  -d '{"config": {"SimpleKPI": {"skeletonMode": "semi", "minColumns": 3}}}'`}</code></pre>
                        <button
                          onClick={() => copyToClipboard(`curl http://localhost:3001/api/widgets/config \\
  -H "X-Session-Key: YOUR_API_KEY"`)}
                          className="absolute top-2 right-2 px-2 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* User Preferences Endpoint */}
                <div className="border border-gray-200 rounded">
                  <button
                    onClick={() => toggleEndpoint('user-prefs')}
                    className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded">GET</span>
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">PUT</span>
                      <span className="font-semibold text-gray-900">/api/user/preferences</span>
                    </div>
                    <span className="text-gray-400">{expandedEndpoints['user-prefs'] ? '−' : '+'}</span>
                  </button>
                  {expandedEndpoints['user-prefs'] && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <p className="text-sm text-gray-600 mb-3">
                        Get or update user preferences including category badges, widget themes, and default settings.
                      </p>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Headers:</h5>
                        <p className="text-xs text-gray-600">• <strong>X-Session-Key</strong>: Your API key</p>
                      </div>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-gray-700 mb-1">Preference Options:</h5>
                        <p className="text-xs text-gray-600">• <strong>categoryBadges</strong>: Array of allowed badge keys</p>
                        <p className="text-xs text-gray-600">• <strong>widgetTheme</strong>: Default widget theme</p>
                        <p className="text-xs text-gray-600">• <strong>defaultBadgeText</strong>: Default dashboard title</p>
                      </div>
                      <div className="relative">
                        <pre className="bg-white p-3 rounded text-xs overflow-x-auto border border-gray-200"><code>{`# Get preferences
curl http://localhost:3001/api/user/preferences \\
  -H "X-Session-Key: YOUR_API_KEY"

# Update preferences
curl -X PUT http://localhost:3001/api/user/preferences \\
  -H "Content-Type: application/json" \\
  -H "X-Session-Key: YOUR_API_KEY" \\
  -d '{"preferences": {"defaultBadgeText": "My Dashboard"}}'`}</code></pre>
                        <button
                          onClick={() => copyToClipboard(`curl http://localhost:3001/api/user/preferences \\
  -H "X-Session-Key: YOUR_API_KEY"`)}
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
      {!isRenderMode && (
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
            <>
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

              {/* Layout Generator */}
              <div>
                <div className="text-xs font-semibold text-gray-600 mb-2 uppercase tracking-wide">Layout Generator</div>
                <button
                  onClick={() => {
                    setSettingsTab('widgets');
                    setShowLayoutSettingsModal(true);
                  }}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mb-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all font-medium text-xs rounded"
                >
                  Configure Widgets
                </button>
                <button
                  onClick={() => setShowLayoutModal(true)}
                  disabled={isGenerating}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-2 mb-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700 transition-all font-medium text-xs rounded disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Generating...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Generate Layout</span>
                    </>
                  )}
                </button>

                {/* Regenerate Button */}
                {lastGeneratedPreset && (
                  <button
                    onClick={regenerateDashboard}
                    disabled={isGenerating}
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-teal-600 text-white hover:bg-teal-700 transition-all font-medium text-xs rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                    <span>Regenerate ({lastGeneratedPreset})</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
      )}

      {/* Fixed Bottom Toolbar */}
      {!isRenderMode && (
      <div className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-center pb-6">
        <div className="bg-white shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-3 rounded-xl">
          {/* Drag Handle */}
          <div className="flex flex-col gap-0.5 pr-2 border-r border-gray-200 cursor-grab active:cursor-grabbing">
            <div className="w-4 h-0.5 bg-gray-300 rounded"></div>
            <div className="w-4 h-0.5 bg-gray-300 rounded"></div>
            <div className="w-4 h-0.5 bg-gray-300 rounded"></div>
          </div>

          {/* Settings Button */}
          <button
            onClick={() => setShowLayoutSettingsModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all font-medium text-xs rounded-lg"
          >
            <Settings className="w-4 h-4" />
            Settings
          </button>

          {/* Save Dashboard Button */}
          <button
            onClick={() => {
              // Generate default name: AppName + Date
              const now = new Date();
              const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              const defaultName = `${appName || 'Dashboard'} - ${dateStr}`;
              setDashboardName(defaultName);
              setShowSaveModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all font-medium text-xs rounded-lg"
          >
            <Save className="w-4 h-4" />
            {savedDashboardId ? 'Update Dashboard' : 'Save Dashboard'}
          </button>

          {/* Export PNG Button */}
          <button
            onClick={handleExportPNG}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white border border-teal-500 hover:from-teal-600 hover:to-teal-700 transition-all font-medium text-xs rounded-lg shadow-sm"
          >
            <Download className="w-4 h-4" />
            Export PNG
          </button>

          {/* Show JSON Button */}
          <button
            onClick={() => setShowJsonModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all font-medium text-xs rounded-lg"
          >
            <Edit className="w-4 h-4" />
            Show JSON
          </button>

          {/* API Button */}
          <button
            onClick={() => setShowApiModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 transition-all font-medium text-xs rounded-lg"
          >
            <Edit className="w-4 h-4" />
            API
          </button>
        </div>
      </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-green-500 text-white px-6 py-4 shadow-sm flex items-center gap-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Dashboard saved successfully!</span>
          </div>
        </div>
      )}

      {/* Config Saved Toast */}
      {showConfigSavedToast && (
        <div className="fixed top-4 right-4 z-50 animate-fade-in">
          <div className="bg-teal-500 text-white px-6 py-4 shadow-lg flex items-center gap-3 rounded-lg">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Configuration saved!</span>
          </div>
        </div>
      )}
    </div>
  );
}
