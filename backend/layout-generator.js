/**
 * Generates React Grid Layout configuration from widget positions
 *
 * Converts AI's 20-column grid coordinates to React Grid Layout's 12-column system:
 * - AI provides: position { x: 0-19, y: 0-29, w: 1-20, h: 1-30 }
 * - We scale x and w from 20-column to 12-column grid
 * - y and h remain unchanged (already in grid rows)
 */

/**
 * Get minimum dimensions for different widget types
 * @param {string} componentType - Component name
 * @returns {Object} Minimum width and height
 */
function getMinDimensions(componentType) {
  // Bar charts need more vertical space (minimum 240px = ~8 grid rows)
  if (componentType === 'SimpleBarChart') {
    return { minW: 6, minH: 8 }; // Bar charts: 6 cols × 8 rows (~240px height)
  }

  // Other chart components need moderate space
  const otherChartComponents = [
    'SimpleLineChart',
    'SimpleAreaChart',
    'SimplePieChart',
    'SimpleGaugeChart',
    'SimpleHeatmap'
  ];

  // Table and list components need more height
  const tableComponents = [
    'SimpleTable',
    'SimpleBadgeList',
    'SimpleTimelineCard'
  ];

  if (otherChartComponents.includes(componentType)) {
    return { minW: 3, minH: 6 }; // Charts: 3 cols × 6 rows (180px height)
  }

  if (tableComponents.includes(componentType)) {
    return { minW: 3, minH: 5 }; // Tables: 3 cols × 5 rows (150px height)
  }

  // Simple metric cards can be smaller
  return { minW: 2, minH: 3 }; // Metrics: 2 cols × 3 rows (90px height)
}

/**
 * Converts 20-column grid position to 12-column grid position
 * @param {number} value - Position value in 20-column grid (x coordinate)
 * @returns {number} Position value in 12-column grid
 */
function scalePosition20to12(value) {
  // Scale from 20-column to 12-column grid (positions can be 0)
  return Math.round((value / 20) * 12);
}

/**
 * Converts 20-column grid width to 12-column grid width
 * @param {number} value - Width value in 20-column grid (w dimension)
 * @returns {number} Width value in 12-column grid (minimum 1, maximum 12)
 */
function scaleWidth20to12(value) {
  // Scale from 20-column to 12-column grid
  const scaled = Math.round((value / 20) * 12);
  // Ensure at least 1 column and max 12 for widths
  return Math.max(1, Math.min(12, scaled));
}

/**
 * Generates layout array for React Grid Layout
 * @param {Array} mappedWidgets - Widgets with component names and props
 * @param {Object} layoutInfo - Layout information from Claude analysis (expected: { columns: 20, rows: 30 })
 * @returns {Array} React Grid Layout configuration
 */
export function generateLayout(mappedWidgets, layoutInfo) {
  if (!Array.isArray(mappedWidgets)) {
    throw new Error('Mapped widgets must be an array');
  }

  // Verify we're working with the 20×30 grid system
  if (layoutInfo?.columns !== 20 || layoutInfo?.rows !== 30) {
    console.warn(`Expected 20×30 grid, got ${layoutInfo?.columns}×${layoutInfo?.rows}`);
  }

  // Metric card components that should never exceed 25% width (3 columns)
  const metricCardComponents = [
    'SimpleMetricCard',
    'SimpleCategoryCard',
    'SimpleScoreCard',
    'SimpleProgressCard',
    'SimpleKPICard'
  ];

  return mappedWidgets.map((widget) => {
    const position = widget.position;

    // Validate position has x,y,w,h format
    if (!position || typeof position.x === 'undefined' || typeof position.y === 'undefined' ||
        typeof position.w === 'undefined' || typeof position.h === 'undefined') {
      throw new Error(`Widget ${widget.id} is missing required position fields (x, y, w, h)`);
    }

    const minDims = getMinDimensions(widget.component);

    // Convert from 20-column grid to 12-column grid
    const x = scalePosition20to12(position.x);
    const w = scaleWidth20to12(position.w);

    // Enforce minimum dimensions
    const width = Math.max(w, minDims.minW);
    const height = Math.max(position.h, minDims.minH);

    // Set maxW constraint for metric cards (cannot exceed 25% width = 3 columns)
    const maxW = metricCardComponents.includes(widget.component) ? 3 : undefined;

    // Convert position to React Grid Layout format
    return {
      i: widget.id, // Unique identifier
      x: x, // X position in 12-column grid (scaled from 20-column)
      y: position.y, // Y position (grid rows, unchanged)
      w: width, // Width in 12-column grid (scaled from 20-column)
      h: height, // Height in grid rows (unchanged)
      minW: minDims.minW, // Component-specific minimum width
      minH: minDims.minH, // Component-specific minimum height
      maxW: maxW, // Maximum width constraint (3 for metric cards)
      component: widget.component,
      props: widget.props,
      originalType: widget.originalType,
    };
  });
}

/**
 * Optimizes layout to prevent overlaps
 * @param {Array} layout - React Grid Layout configuration
 * @returns {Array} Optimized layout
 */
export function optimizeLayout(layout) {
  // Sort by row then column
  const sorted = [...layout].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });

  // Check for overlaps and adjust
  const optimized = [];
  const occupied = new Set();

  for (const item of sorted) {
    let newX = item.x;
    let newY = item.y;

    // Find first available position
    while (isOverlapping(newX, newY, item.w, item.h, occupied)) {
      newX += 1;
      if (newX + item.w > 12) {
        newX = 0;
        newY += 1;
      }
    }

    // Mark positions as occupied
    for (let y = newY; y < newY + item.h; y++) {
      for (let x = newX; x < newX + item.w; x++) {
        occupied.add(`${x},${y}`);
      }
    }

    optimized.push({
      ...item,
      x: newX,
      y: newY,
    });
  }

  return optimized;
}

/**
 * Checks if a position overlaps with occupied positions
 * @param {number} x - X position
 * @param {number} y - Y position
 * @param {number} w - Width
 * @param {number} h - Height
 * @param {Set} occupied - Set of occupied positions
 * @returns {boolean} True if overlapping
 */
function isOverlapping(x, y, w, h, occupied) {
  for (let py = y; py < y + h; py++) {
    for (let px = x; px < x + w; px++) {
      if (occupied.has(`${px},${py}`)) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Calculates optimal grid dimensions based on widget count
 * @param {number} widgetCount - Number of widgets
 * @returns {Object} Suggested columns and rows (always returns 20×30 for the new system)
 */
export function calculateGridDimensions(widgetCount) {
  // Always use the 20×30 grid system for AI analysis
  return { columns: 20, rows: 30 };
}
