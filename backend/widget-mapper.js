/**
 * Maps complex widget types to simplified React components
 */

// Mapping from Claude-detected widget types to simplified components
const widgetTypeMapping = {
  kpi: 'SimpleKPI',
  kpi_card: 'SimpleKPI',
  metric: 'SimpleMetricCard',
  metric_card: 'SimpleMetricCard',
  line_chart: 'SimpleLineChart',
  area_chart: 'SimpleAreaChart',
  bar_chart: 'SimpleBarChart',
  column_chart: 'SimpleBarChart',
  pie_chart: 'SimplePieChart',
  donut_chart: 'SimplePieChart',
  gauge: 'SimpleGaugeChart',
  gauge_chart: 'SimpleGaugeChart',
  status_list: 'SimpleStatusCard',
  status_card: 'SimpleStatusCard',
  progress: 'SimpleProgressBar',
  progress_bar: 'SimpleProgressBar',
  table: 'SimpleBadgeList',
  data_table: 'SimpleBadgeList',
  heatmap: 'SimpleHeatmap',
  timeline: 'SimpleTimelineCard',
  score: 'SimpleScoreCard',
  score_card: 'SimpleScoreCard',
  comparison: 'SimpleComparisonCard',
  comparison_card: 'SimpleComparisonCard',
};

/**
 * Maps widgets from Claude analysis to simplified component specifications
 * @param {Array} widgets - Array of widgets from Claude Vision analysis
 * @returns {Array} Mapped widgets with component names and props
 */
export function mapWidgets(widgets) {
  if (!Array.isArray(widgets)) {
    throw new Error('Widgets must be an array');
  }

  const mapped = widgets.map((widget, index) => {
    const componentName = widgetTypeMapping[widget.type] || 'SimpleMetricCard';

    // Extract props based on widget type
    const props = extractProps(widget);

    // Position should be in x,y,w,h format from AI (20×30 grid)
    // Default to top-left corner if missing
    const position = widget.position || { x: 0, y: 0, w: 5, h: 4 };

    // Validate and correct widget width
    const validatedPosition = validateWidgetWidth(widget.type, position, widget.id || `widget-${index + 1}`);

    return {
      id: widget.id || `widget-${index + 1}`,
      component: componentName,
      position: validatedPosition,
      props,
      originalType: widget.type,
    };
  });

  // Apply 5-card layout normalization
  return normalize5CardLayout(mapped);
}

/**
 * Normalizes layout for 5 metric cards in one row to enforce 50-50 split
 * First 3 cards get 50% width total (w=3,3,4), last 2 cards get 50% width (w=5,5)
 * @param {Array} widgets - Array of mapped widgets
 * @returns {Array} Widgets with normalized positions for 5-card layouts
 */
function normalize5CardLayout(widgets) {
  // Define small widget types (metric/KPI cards)
  const smallWidgetTypes = [
    'kpi',
    'kpi_card',
    'metric',
    'metric_card',
    'score',
    'score_card',
    'comparison',
    'comparison_card',
  ];

  // Define small widget components (after mapping)
  const smallWidgetComponents = [
    'SimpleKPI',
    'SimpleMetricCard',
    'SimpleScoreCard',
    'SimpleComparisonCard',
  ];

  // Group widgets by row (y coordinate)
  const rowGroups = {};
  widgets.forEach((widget) => {
    const y = widget.position.y;
    if (!rowGroups[y]) {
      rowGroups[y] = [];
    }
    rowGroups[y].push(widget);
  });

  // Process each row
  Object.keys(rowGroups).forEach((y) => {
    const rowWidgets = rowGroups[y];

    // Check if this row has exactly 5 small widgets
    const smallWidgets = rowWidgets.filter((w) =>
      smallWidgetComponents.includes(w.component) ||
      smallWidgetTypes.includes(w.originalType)
    );

    if (smallWidgets.length === 5 && smallWidgets.length === rowWidgets.length) {
      // Sort by x position
      const sortedWidgets = [...smallWidgets].sort((a, b) => a.position.x - b.position.x);

      // Check if already in correct pattern [3,3,4,5,5]
      const currentWidths = sortedWidgets.map((w) => w.position.w);
      const targetWidths = [3, 3, 4, 5, 5];
      const alreadyCorrect = currentWidths.every((w, i) => w === targetWidths[i]);

      if (!alreadyCorrect) {
        // Log transformation
        const beforeWidths = sortedWidgets.map((w) => w.position.w);
        const beforeX = sortedWidgets.map((w) => w.position.x);

        console.log('🔧 5-card layout normalization:');
        console.log(`   BEFORE: w=[${beforeWidths.join(',')}], x=[${beforeX.join(',')}]`);

        // Apply new widths and x positions
        const newWidths = [3, 3, 4, 5, 5];
        const newX = [0, 3, 6, 10, 15];

        sortedWidgets.forEach((widget, i) => {
          widget.position.w = newWidths[i];
          widget.position.x = newX[i];
        });

        console.log(`   AFTER:  w=[${newWidths.join(',')}], x=[${newX.join(',')}]`);
      }
    }
  });

  return widgets;
}

/**
 * Validates and corrects widget width based on widget type
 * Enforces maximum width constraints for small widgets (metric/KPI cards)
 * @param {string} widgetType - The widget type from Claude analysis
 * @param {Object} position - Position object with x, y, w, h
 * @param {string} widgetId - Widget ID for logging
 * @returns {Object} Validated position object
 */
function validateWidgetWidth(widgetType, position, widgetId) {
  const MAX_SMALL_WIDGET_WIDTH = 7; // 35% width maximum
  const DEFAULT_SMALL_WIDGET_WIDTH = 5; // 25% width default

  // Define small widget types that should never exceed 35% width
  const smallWidgetTypes = [
    'kpi',
    'kpi_card',
    'metric',
    'metric_card',
    'score',
    'score_card',
    'comparison',
    'comparison_card',
    'status_card', // Single status card (not multi-item list)
  ];

  // Check if this is a small widget type
  const isSmallWidget = smallWidgetTypes.includes(widgetType);

  // If it's a small widget and width exceeds maximum, correct it
  if (isSmallWidget && position.w > MAX_SMALL_WIDGET_WIDTH) {
    console.warn(
      `⚠️  Widget width corrected: ${widgetId} (${widgetType}) had w=${position.w} (${(position.w / 20 * 100).toFixed(0)}% width), ` +
      `corrected to w=${DEFAULT_SMALL_WIDGET_WIDTH} (${(DEFAULT_SMALL_WIDGET_WIDTH / 20 * 100).toFixed(0)}% width). ` +
      `Small metric/KPI cards should never exceed ${MAX_SMALL_WIDGET_WIDTH} columns (35% width).`
    );

    return {
      ...position,
      w: DEFAULT_SMALL_WIDGET_WIDTH,
    };
  }

  return position;
}

/**
 * Extracts appropriate props for each widget type
 * @param {Object} widget - Widget data from Claude analysis
 * @returns {Object} Props object for the simplified component
 */
function extractProps(widget) {
  const baseProps = {
    title: widget.title || '',
  };

  switch (widget.type) {
    case 'kpi':
    case 'kpi_card':
      return {
        ...baseProps,
        value: widget.value || '0',
        subtitle: widget.subtitle || '',
        trend: widget.trend || 'neutral', // up, down, neutral
        color: widget.color || undefined,
      };

    case 'metric':
    case 'metric_card':
      return {
        ...baseProps,
        value: widget.value || '0',
        unit: widget.unit || '',
        subtitle: widget.subtitle || '',
      };

    case 'line_chart':
    case 'area_chart':
    case 'bar_chart':
    case 'column_chart':
      return {
        ...baseProps,
        dataPoints: widget.dataPoints || 7,
        data: widget.data || generateMockData(widget.dataPoints || 7),
        color: widget.color || undefined,
      };

    case 'pie_chart':
    case 'donut_chart':
      return {
        ...baseProps,
        percentage: widget.percentage || 75,
        value: widget.value || '75%',
        segments: widget.segments || [
          { name: 'Complete', value: 75, color: '#10b981' },
          { name: 'Remaining', value: 25, color: '#e5e7eb' },
        ],
      };

    case 'gauge':
    case 'gauge_chart':
      return {
        ...baseProps,
        value: widget.value || 75,
        min: widget.min || 0,
        max: widget.max || 100,
        unit: widget.unit || '',
      };

    case 'status_list':
    case 'status_card':
      return {
        ...baseProps,
        items: widget.items || [
          { label: 'Active', value: widget.value || '24', status: 'success' },
        ],
      };

    case 'progress':
    case 'progress_bar':
      return {
        ...baseProps,
        percentage: widget.percentage || widget.value || 50,
        current: widget.current,
        total: widget.total,
        label: widget.label || widget.subtitle || '',
      };

    case 'table':
    case 'data_table':
      return {
        ...baseProps,
        badges: widget.badges || extractBadgesFromTable(widget),
      };

    case 'heatmap':
      return {
        ...baseProps,
        data: widget.data || generateHeatmapData(),
      };

    case 'timeline':
      return {
        ...baseProps,
        events: widget.events || [
          { time: '2h ago', text: widget.value || 'Event', status: 'success' },
        ],
      };

    case 'score':
    case 'score_card':
      return {
        ...baseProps,
        score: widget.score || widget.value || '8.5',
        maxScore: widget.maxScore || '10',
        subtitle: widget.subtitle || '',
      };

    case 'comparison':
    case 'comparison_card':
      return {
        ...baseProps,
        valueA: widget.valueA || widget.value || '120',
        valueB: widget.valueB || '95',
        labelA: widget.labelA || 'Current',
        labelB: widget.labelB || 'Previous',
      };

    default:
      return {
        ...baseProps,
        value: widget.value || '',
        subtitle: widget.subtitle || '',
      };
  }
}

/**
 * Generates mock data for chart widgets
 * @param {number} count - Number of data points
 * @returns {Array} Array of data points
 */
function generateMockData(count) {
  const data = [];
  for (let i = 0; i < count; i++) {
    data.push({
      name: `Day ${i + 1}`,
      value: Math.floor(Math.random() * 100) + 20,
    });
  }
  return data;
}

/**
 * Extracts badges from table widget data
 * @param {Object} widget - Table widget data
 * @returns {Array} Array of badge objects
 */
function extractBadgesFromTable(widget) {
  if (widget.rows && Array.isArray(widget.rows)) {
    return widget.rows.map((row) => ({
      text: row.label || row.name || row.value || 'Item',
      color: row.color || 'gray',
    }));
  }

  return [
    { text: 'Active', color: 'green' },
    { text: 'Pending', color: 'yellow' },
    { text: 'Complete', color: 'blue' },
  ];
}

/**
 * Generates mock heatmap data
 * @returns {Array} 2D array of heatmap values
 */
function generateHeatmapData() {
  const data = [];
  for (let row = 0; row < 5; row++) {
    const rowData = [];
    for (let col = 0; col < 7; col++) {
      rowData.push(Math.floor(Math.random() * 100));
    }
    data.push(rowData);
  }
  return data;
}
