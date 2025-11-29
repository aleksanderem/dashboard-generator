// Widget configuration with default minimum widths (in grid columns, out of 12)
// minCols: 1 = any size, 2 = 1/6 width, 3 = 1/4 width, 4 = 1/3 width, 6 = 1/2 width, 12 = full width
const defaultWidgetConfig = {
  'SimpleKPI': { name: 'KPI', minCols: 2, category: 'metrics' },
  'SimpleMetricCard': { name: 'Metric Card', minCols: 3, category: 'metrics' },
  'SimpleScoreCard': { name: 'Score Card', minCols: 3, category: 'metrics' },
  'SimpleStatusCard': { name: 'Status Card', minCols: 4, category: 'metrics' },
  'SimpleComparisonCard': { name: 'Comparison Card', minCols: 4, category: 'metrics' },
  'SimpleProgressBar': { name: 'Progress Bar', minCols: 3, category: 'metrics' },
  'SimpleAreaChart': { name: 'Area Chart', minCols: 6, category: 'charts' },
  'SimpleBarChart': { name: 'Bar Chart', minCols: 6, category: 'charts' },
  'SimpleLineChart': { name: 'Line Chart', minCols: 6, category: 'charts' },
  'SimplePieChart': { name: 'Pie Chart', minCols: 4, category: 'charts' },
  'SimpleGaugeChart': { name: 'Gauge Chart', minCols: 4, category: 'charts' },
  'SimpleHeatmap': { name: 'Heatmap', minCols: 6, category: 'charts' },
  'SimpleTable': { name: 'Table', minCols: 6, category: 'lists' },
  'SimpleAgentList': { name: 'Agent List', minCols: 4, category: 'lists' },
  'SimpleBadgeList': { name: 'Badge List', minCols: 3, category: 'lists' },
  'SimplePriorityList': { name: 'Priority List', minCols: 4, category: 'lists' },
  'SimpleRecentList': { name: 'Recent List', minCols: 4, category: 'lists' },
  'SimpleStatusList': { name: 'Status List', minCols: 4, category: 'lists' },
  'SimpleTimelineCard': { name: 'Timeline Card', minCols: 4, category: 'lists' },
  'SimpleCategoryCards': { name: 'Category Cards', minCols: 6, category: 'lists' },
};

// Available components for random generation
const availableComponents = Object.keys(defaultWidgetConfig);

// Layout presets
export const layoutPresets = {
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

/**
 * Parse layout preset to grid positions
 * @param {Array<number>} pattern - Array of columns per row
 * @param {number} minWidthCols - Minimum width in columns (1=no limit, 2=half, 3=third)
 * @returns {Array<Object>} Grid layout items
 */
function parseLayoutPreset(pattern, minWidthCols = 1) {
  const gridLayout = [];
  let currentY = 0;
  const rowHeight = 6; // Base height, frontend applies min height settings

  // Calculate minimum widget width based on minWidthCols setting
  // minWidthCols: 1 = any size, 2 = half width (6 cols), 3 = third width (4 cols)
  const minWidth = minWidthCols === 1 ? 1 : Math.floor(12 / minWidthCols);
  const maxWidgetsPerRow = Math.floor(12 / minWidth);

  pattern.forEach((colsInRow) => {
    // Limit widgets per row based on minimum width requirement
    const actualColsInRow = Math.min(colsInRow, maxWidgetsPerRow);
    const widgetWidth = Math.floor(12 / actualColsInRow);

    for (let i = 0; i < actualColsInRow; i++) {
      const widgetId = `widget-${Date.now()}-${currentY}-${i}-${Math.random().toString(36).substr(2, 9)}`;
      gridLayout.push({
        i: widgetId,
        x: i * widgetWidth,
        y: currentY,
        w: widgetWidth,
        h: rowHeight,
      });
    }

    currentY += rowHeight;
  });

  return gridLayout;
}

/**
 * Get random component name that fits in given width
 * @param {number} maxWidth - Maximum width available (in columns)
 * @param {Object} widgetConfig - Widget configuration (optional)
 * @returns {string} Random component name
 */
function getRandomComponent(maxWidth = 12, widgetConfig = null) {
  // If no config provided, use defaults and filter by width
  const config = widgetConfig || defaultWidgetConfig;

  const fittingWidgets = Object.entries(config)
    .filter(([_, cfg]) => {
      const minCols = cfg.minCols || cfg.minColumns || 2;
      const available = cfg.availableInRandom !== false;
      return available && minCols <= maxWidth;
    })
    .map(([widgetType, _]) => widgetType);

  if (fittingWidgets.length === 0) {
    // Fallback to SimpleKPI which is smallest
    return 'SimpleKPI';
  }

  return fittingWidgets[Math.floor(Math.random() * fittingWidgets.length)];
}

/**
 * Generate default props for a component
 * @param {string} componentName - Component name
 * @returns {Object} Default props
 */
function generateDefaultProps(componentName) {
  const baseName = componentName.replace('Simple', '');

  const props = {
    title: `${baseName} Widget`,
  };

  // Add component-specific default props
  switch (componentName) {
    case 'SimpleKPI':
    case 'SimpleMetricCard':
      props.value = Math.floor(Math.random() * 10000).toLocaleString();
      props.subtitle = `+${Math.floor(Math.random() * 30)}%`;
      break;

    case 'SimpleScoreCard':
      props.score = Math.floor(Math.random() * 100);
      break;

    case 'SimplePieChart':
    case 'SimpleGaugeChart':
      props.percentage = Math.floor(Math.random() * 100);
      break;

    case 'SimpleProgressBar':
      const total = Math.floor(Math.random() * 150) + 50;
      const current = Math.floor(Math.random() * total);
      props.percentage = Math.round((current / total) * 100);
      props.current = current;
      props.total = total;
      break;

    case 'SimpleComparisonCard':
      props.valueA = Math.floor(Math.random() * 1000);
      props.valueB = Math.floor(Math.random() * 1000);
      props.labelA = 'Current';
      props.labelB = 'Previous';
      break;

    default:
      // Charts and lists use default data
      break;
  }

  return props;
}

/**
 * Generate random dashboard from layout preset
 * @param {string} presetKey - Layout preset key (e.g., '2+2', '3+1')
 * @param {number} minWidthCols - Minimum widget width (1=any, 2=half, 3=third)
 * @param {Object} widgetConfig - Widget configuration from session
 * @returns {Object} Dashboard data with gridLayout and widgets
 */
export function generateRandomDashboard(presetKey, minWidthCols = 1, widgetConfig = null) {
  const preset = layoutPresets[presetKey];
  if (!preset) {
    throw new Error(`Invalid preset key: ${presetKey}`);
  }

  // Use provided config or defaults
  const config = widgetConfig && Object.keys(widgetConfig).length > 0 ? widgetConfig : defaultWidgetConfig;

  const gridLayout = parseLayoutPreset(preset.pattern, minWidthCols);
  const widgets = [];

  gridLayout.forEach((layoutItem) => {
    // Get random component that fits in the slot width
    const slotWidth = layoutItem.w;
    const randomComponent = getRandomComponent(slotWidth, config);

    // Get skeleton mode from config
    const widgetCfg = config[randomComponent] || {};
    const skeletonMode = widgetCfg.skeletonMode || 'none';

    widgets.push({
      id: layoutItem.i,
      component: randomComponent,
      props: {
        ...generateDefaultProps(randomComponent),
        skeleton: skeletonMode !== 'none' ? skeletonMode : false,
      },
    });
  });

  return {
    name: `Random Dashboard (${preset.name})`,
    theme: 'teal',
    metadata: {
      widgetCount: widgets.length,
      createdAt: new Date().toISOString(),
      layoutPreset: presetKey,
      generated: true,
    },
    gridLayout: gridLayout.map(item => ({
      ...item,
      component: widgets.find(w => w.id === item.i)?.component,
      props: widgets.find(w => w.id === item.i)?.props,
    })),
    widgets,
  };
}

/**
 * Get all available layout presets
 * @returns {Object} Layout presets
 */
export function getLayoutPresets() {
  return layoutPresets;
}

/**
 * Get default widget configuration
 * @returns {Object} Widget config with minCols
 */
export function getWidgetConfig() {
  return defaultWidgetConfig;
}

/**
 * Generate dashboard using bin-packing algorithm with session widget config
 * @param {number} widgetCount - Number of widgets to generate
 * @param {Object} widgetConfig - Full widget config from database { widgetType: { skeletonMode, minColumns, availableInRandom } }
 * @returns {Object} Dashboard data
 */
export function generateBinPackedDashboard(widgetCount = 6, widgetConfig = {}) {
  // Use provided config or defaults
  const config = Object.keys(widgetConfig).length > 0 ? widgetConfig : defaultWidgetConfig;

  // Get only widgets available for random generation
  const availableWidgets = Object.entries(config)
    .filter(([_, cfg]) => cfg.availableInRandom !== false)
    .map(([widgetType, _]) => widgetType);

  if (availableWidgets.length === 0) {
    throw new Error('No widgets available for random generation');
  }

  const gridLayout = [];
  const widgets = [];
  const rowHeight = 6; // Base height, frontend applies min height settings

  let currentX = 0;
  let currentY = 0;

  for (let i = 0; i < widgetCount; i++) {
    const remainingSpace = 12 - currentX;

    // Filter widgets that fit in remaining space
    const fittingWidgets = availableWidgets.filter(widgetType => {
      const cfg = config[widgetType] || {};
      const minCols = cfg.minColumns || 4;
      return minCols <= remainingSpace;
    });

    let randomComponent;
    let widgetWidth;

    if (fittingWidgets.length > 0) {
      // Pick from widgets that fit in current row
      randomComponent = fittingWidgets[Math.floor(Math.random() * fittingWidgets.length)];
      const widgetCfg = config[randomComponent] || {};
      widgetWidth = widgetCfg.minColumns || 4;
    } else {
      // No widget fits - start new row and pick any available widget
      currentX = 0;
      currentY += rowHeight;
      randomComponent = availableWidgets[Math.floor(Math.random() * availableWidgets.length)];
      const widgetCfg = config[randomComponent] || {};
      widgetWidth = widgetCfg.minColumns || 4;
    }

    const widgetCfg = config[randomComponent] || {};
    const skeletonMode = widgetCfg.skeletonMode || 'none';

    const widgetId = `widget-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 9)}`;

    gridLayout.push({
      i: widgetId,
      x: currentX,
      y: currentY,
      w: widgetWidth,
      h: rowHeight,
    });

    widgets.push({
      id: widgetId,
      component: randomComponent,
      props: {
        ...generateDefaultProps(randomComponent),
        skeletonMode, // Include skeleton mode in props
      },
    });

    currentX += widgetWidth;

    // If row is full, start new row
    if (currentX >= 12) {
      currentX = 0;
      currentY += rowHeight;
    }
  }

  return {
    name: `Generated Dashboard (${widgetCount} widgets)`,
    theme: 'teal',
    metadata: {
      widgetCount: widgets.length,
      createdAt: new Date().toISOString(),
      generated: true,
      binPacked: true,
    },
    gridLayout: gridLayout.map(item => ({
      ...item,
      component: widgets.find(w => w.id === item.i)?.component,
      props: widgets.find(w => w.id === item.i)?.props,
    })),
    widgets,
  };
}
