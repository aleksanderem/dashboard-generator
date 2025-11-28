import puppeteer from 'puppeteer';

/**
 * Theme definitions matching frontend themes
 */
const themes = {
  itsm: {
    name: 'ITSM',
    primary: '#9333EA',
    primaryLight: '#E9D5FF',
    primaryDark: '#7E22CE',
  },
  security: {
    name: 'Security',
    primary: '#FFCC24',
    primaryLight: '#FEF3C7',
    primaryDark: '#EAB308',
  },
  monitoring: {
    name: 'Monitoring',
    primary: '#0078B5',
    primaryLight: '#BAE6FD',
    primaryDark: '#0369A1',
  },
  ad: {
    name: 'AD',
    primary: '#C92133',
    primaryLight: '#FECACA',
    primaryDark: '#991B1B',
  },
  uem: {
    name: 'UEM',
    primary: '#00994F',
    primaryLight: '#BBF7D0',
    primaryDark: '#166534',
  },
  custom: {
    name: 'Custom',
    primary: '#138D8F',
    primaryLight: '#CCFBF1',
    primaryDark: '#0F6B6D',
  },
  teal: {
    name: 'Teal',
    primary: '#14B8A6',
    primaryLight: '#CCFBF1',
    primaryDark: '#0D9488',
  },
};

/**
 * Get theme colors
 */
function getTheme(themeName) {
  return themes[themeName] || themes.teal;
}

/**
 * Generate Chart.js configuration for different chart types
 */
function generateChartConfig(widget, themeColor) {
  const baseOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };

  switch (widget.component) {
    case 'SimpleBarChart':
      return {
        type: 'bar',
        data: {
          labels: widget.props?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: widget.props?.title || 'Data',
            data: widget.props?.data || [65, 59, 80, 81, 56, 55],
            backgroundColor: `${themeColor}80`,
            borderColor: themeColor,
            borderWidth: 2,
          }],
        },
        options: {
          ...baseOptions,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      };

    case 'SimpleLineChart':
      return {
        type: 'line',
        data: {
          labels: widget.props?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: widget.props?.title || 'Data',
            data: widget.props?.data || [30, 45, 38, 50, 49, 60],
            borderColor: themeColor,
            backgroundColor: `${themeColor}20`,
            tension: 0.4,
            fill: true,
          }],
        },
        options: baseOptions,
      };

    case 'SimpleAreaChart':
      return {
        type: 'line',
        data: {
          labels: widget.props?.labels || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: widget.props?.title || 'Data',
            data: widget.props?.data || [30, 45, 38, 50, 49, 60],
            borderColor: themeColor,
            backgroundColor: `${themeColor}40`,
            tension: 0.4,
            fill: true,
          }],
        },
        options: baseOptions,
      };

    case 'SimplePieChart':
      return {
        type: 'doughnut',
        data: {
          labels: widget.props?.labels || ['A', 'B', 'C', 'D'],
          datasets: [{
            data: widget.props?.data || [30, 25, 25, 20],
            backgroundColor: [
              `${themeColor}`,
              `${themeColor}cc`,
              `${themeColor}99`,
              `${themeColor}66`,
            ],
          }],
        },
        options: baseOptions,
      };

    default:
      return null;
  }
}

/**
 * Render a widget as HTML
 */
function renderWidget(widget, gridItem, themeColor) {
  const { component, props } = widget;
  const { x, y, w, h } = gridItem;

  // Calculate position and size (using 12-column grid, 30px row height)
  const colWidth = 100 / 12; // percentage
  const left = x * colWidth;
  const width = w * colWidth;
  const top = y * 30;
  const height = h * 30;

  const widgetId = `widget-${gridItem.i}`;

  // Metric/KPI cards
  if (component === 'SimpleKPI' || component === 'SimpleMetricCard' || component === 'SimpleScoreCard') {
    return `
      <div class="widget" style="position: absolute; left: ${left}%; top: ${top}px; width: ${width}%; height: ${height}px;">
        <div class="metric-card">
          <div class="metric-title">${props?.title || 'Metric'}</div>
          <div class="metric-value" style="color: ${themeColor};">${props?.value || '0'}</div>
          ${props?.subtitle ? `<div class="metric-subtitle">${props.subtitle}</div>` : ''}
        </div>
      </div>
    `;
  }

  // Chart components
  if (['SimpleBarChart', 'SimpleLineChart', 'SimpleAreaChart', 'SimplePieChart'].includes(component)) {
    const chartConfig = generateChartConfig(widget, themeColor);
    return `
      <div class="widget" style="position: absolute; left: ${left}%; top: ${top}px; width: ${width}%; height: ${height}px;">
        <div class="chart-card">
          <div class="chart-title">${props?.title || 'Chart'}</div>
          <div class="chart-container">
            <canvas id="${widgetId}"></canvas>
          </div>
        </div>
      </div>
      <script>
        (function() {
          const ctx = document.getElementById('${widgetId}').getContext('2d');
          new Chart(ctx, ${JSON.stringify(chartConfig)});
        })();
      </script>
    `;
  }

  // Status/Progress components
  if (component === 'SimpleProgressBar') {
    const progress = props?.progress || 75;
    return `
      <div class="widget" style="position: absolute; left: ${left}%; top: ${top}px; width: ${width}%; height: ${height}px;">
        <div class="progress-card">
          <div class="progress-title">${props?.title || 'Progress'}</div>
          <div class="progress-bar-container">
            <div class="progress-bar" style="width: ${progress}%; background-color: ${themeColor};"></div>
          </div>
          <div class="progress-value">${progress}%</div>
        </div>
      </div>
    `;
  }

  if (component === 'SimpleStatusCard') {
    return `
      <div class="widget" style="position: absolute; left: ${left}%; top: ${top}px; width: ${width}%; height: ${height}px;">
        <div class="status-card">
          <div class="status-title">${props?.title || 'Status'}</div>
          <div class="status-value" style="color: ${themeColor};">${props?.status || 'Active'}</div>
          ${props?.subtitle ? `<div class="status-subtitle">${props.subtitle}</div>` : ''}
        </div>
      </div>
    `;
  }

  // List components
  if (component === 'SimpleStatusList' || component === 'SimplePriorityList' || component === 'SimpleRecentList') {
    const items = props?.items || ['Item 1', 'Item 2', 'Item 3', 'Item 4'];
    return `
      <div class="widget" style="position: absolute; left: ${left}%; top: ${top}px; width: ${width}%; height: ${height}px;">
        <div class="list-card">
          <div class="list-title">${props?.title || 'List'}</div>
          <div class="list-items">
            ${items.map((item, idx) => `
              <div class="list-item">
                <div class="list-item-dot" style="background-color: ${themeColor};"></div>
                <div class="list-item-text">${item}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Table component
  if (component === 'SimpleTable') {
    const headers = props?.headers || ['Column 1', 'Column 2', 'Column 3'];
    const rows = props?.rows || [
      ['Data 1', 'Data 2', 'Data 3'],
      ['Data 4', 'Data 5', 'Data 6'],
      ['Data 7', 'Data 8', 'Data 9'],
    ];
    return `
      <div class="widget" style="position: absolute; left: ${left}%; top: ${top}px; width: ${width}%; height: ${height}px;">
        <div class="table-card">
          <div class="table-title">${props?.title || 'Table'}</div>
          <table class="data-table">
            <thead>
              <tr>
                ${headers.map(h => `<th>${h}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${rows.map(row => `
                <tr>
                  ${row.map(cell => `<td>${cell}</td>`).join('')}
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Default fallback
  return `
    <div class="widget" style="position: absolute; left: ${left}%; top: ${top}px; width: ${width}%; height: ${height}px;">
      <div class="default-card">
        <div class="default-title">${props?.title || component}</div>
        <div class="default-content">${props?.value || props?.subtitle || 'Widget'}</div>
      </div>
    </div>
  `;
}

/**
 * Generate complete HTML dashboard
 */
function generateDashboardHTML(dashboardData, options = {}) {
  const {
    theme = 'teal',
    appName = 'Dashboard',
    appCategory = 'custom',
    width = 1920,
    height = 1080,
  } = options;

  const themeConfig = getTheme(theme);
  const { widgets = [], gridLayout = [] } = dashboardData;

  // Create widget map for easy lookup
  const widgetMap = {};
  widgets.forEach(widget => {
    widgetMap[widget.id] = widget;
  });

  // Calculate dashboard content height based on grid layout
  const maxY = gridLayout.reduce((max, item) => Math.max(max, item.y + item.h), 0);
  const contentHeight = maxY * 30 + 100; // Add padding

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${appName}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
      background-color: #f5f6f8;
      width: ${width}px;
      height: auto;
      min-height: ${height}px;
    }

    .navbar {
      background: white;
      border-bottom: 1px solid #e5e7eb;
      padding: 20px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .navbar-left {
      display: flex;
      align-items: center;
      gap: 24px;
    }

    .navbar-brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .navbar-accent {
      width: 4px;
      height: 32px;
      border-radius: 2px;
      background: linear-gradient(to bottom, ${themeConfig.primary}, ${themeConfig.primaryDark});
    }

    .navbar-title {
      font-size: 24px;
      font-weight: 700;
      color: #111827;
    }

    .navbar-right {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .category-badge {
      padding: 6px 16px;
      border-radius: 4px;
      background: linear-gradient(to right, ${themeConfig.primary}, ${themeConfig.primaryDark});
      color: white;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }

    .dashboard-container {
      display: flex;
      min-height: calc(${height}px - 72px);
    }

    .sidebar {
      background: white;
      border-right: 1px solid #e5e7eb;
      width: 256px;
      padding: 16px;
    }

    .sidebar-item {
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      padding: 0 12px;
      margin-bottom: 8px;
    }

    .sidebar-item.active {
      background-color: ${themeConfig.primaryLight};
      border-left: 4px solid ${themeConfig.primaryDark};
    }

    .sidebar-item:not(.active) {
      background-color: #f9fafb;
    }

    .sidebar-placeholder {
      width: 80px;
      height: 16px;
      border-radius: 4px;
    }

    .sidebar-item.active .sidebar-placeholder {
      background-color: ${themeConfig.primaryDark};
    }

    .sidebar-item:not(.active) .sidebar-placeholder {
      background-color: #d1d5db;
    }

    .main-content {
      flex: 1;
      padding: 24px;
      position: relative;
    }

    .grid-container {
      position: relative;
      width: 100%;
      min-height: ${contentHeight}px;
    }

    .widget {
      padding: 16px;
    }

    .metric-card, .chart-card, .status-card, .progress-card, .list-card, .table-card, .default-card {
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      padding: 20px;
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .metric-title, .chart-title, .status-title, .progress-title, .list-title, .table-title, .default-title {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      margin-bottom: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .metric-value {
      font-size: 36px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .metric-subtitle, .status-subtitle {
      font-size: 14px;
      color: #9ca3af;
    }

    .status-value {
      font-size: 24px;
      font-weight: 600;
    }

    .chart-container {
      flex: 1;
      position: relative;
      min-height: 200px;
    }

    .progress-bar-container {
      width: 100%;
      height: 24px;
      background-color: #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-bar {
      height: 100%;
      border-radius: 12px;
      transition: width 0.3s ease;
    }

    .progress-value {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
    }

    .list-items {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .list-item {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .list-item-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }

    .list-item-text {
      font-size: 14px;
      color: #374151;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
    }

    .data-table th {
      background-color: #f9fafb;
      padding: 12px;
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      color: #6b7280;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      border-bottom: 2px solid #e5e7eb;
    }

    .data-table td {
      padding: 12px;
      font-size: 14px;
      color: #374151;
      border-bottom: 1px solid #e5e7eb;
    }

    .default-content {
      font-size: 18px;
      color: #6b7280;
      text-align: center;
      margin-top: 20px;
    }
  </style>
</head>
<body>
  <!-- Navbar -->
  <div class="navbar">
    <div class="navbar-left">
      <div class="navbar-brand">
        <div class="navbar-accent"></div>
        <div class="navbar-title">${appName}</div>
      </div>
    </div>
    <div class="navbar-right">
      <div class="category-badge">${themeConfig.name}</div>
    </div>
  </div>

  <!-- Dashboard Container -->
  <div class="dashboard-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <div class="sidebar-item active">
        <div class="sidebar-placeholder"></div>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-placeholder"></div>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-placeholder"></div>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-placeholder"></div>
      </div>
      <div class="sidebar-item">
        <div class="sidebar-placeholder"></div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="main-content">
      <div class="grid-container">
        ${gridLayout.map(item => {
          const widget = widgetMap[item.i] || { component: 'Unknown', props: {} };
          return renderWidget(widget, item, themeConfig.primary);
        }).join('\n')}
      </div>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Validate dashboard data before rendering
 * @param {Object} dashboardData - Dashboard data to validate
 * @returns {Object} Validation result with isValid and errors array
 */
function validateDashboardData(dashboardData) {
  const errors = [];

  if (!dashboardData || typeof dashboardData !== 'object') {
    errors.push('Dashboard data is missing or invalid');
    return { isValid: false, errors };
  }

  if (!dashboardData.widgets || !Array.isArray(dashboardData.widgets)) {
    errors.push('Missing or invalid widgets array');
  }

  if (!dashboardData.gridLayout || !Array.isArray(dashboardData.gridLayout)) {
    errors.push('Missing or invalid gridLayout array');
  }

  if (dashboardData.widgets && dashboardData.gridLayout) {
    // Check each widget in layout
    dashboardData.gridLayout.forEach((layout, idx) => {
      if (layout.x === undefined || layout.y === undefined ||
          layout.w === undefined || layout.h === undefined) {
        errors.push(`Widget at index ${idx} (id: ${layout.i}) missing position data (x, y, w, h)`);
      }
    });

    // Check for widget-layout mismatch
    if (dashboardData.widgets.length !== dashboardData.gridLayout.length) {
      errors.push(
        `Widget count mismatch: ${dashboardData.widgets.length} widgets but ${dashboardData.gridLayout.length} layout items`
      );
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Render dashboard to PNG buffer
 * @param {Object} dashboardData - Dashboard data with widgets and gridLayout
 * @param {Object} options - Rendering options (theme, appName, appCategory, width, height)
 * @returns {Promise<Buffer>} PNG image buffer
 */
export async function renderDashboard(dashboardData, options = {}) {
  let browser = null;

  try {
    // Validate dashboard data
    const validation = validateDashboardData(dashboardData);
    if (!validation.isValid) {
      const errorMessage = `Invalid dashboard data:\n${validation.errors.join('\n')}`;
      console.error('[Render] Validation failed:', errorMessage);
      throw new Error(errorMessage);
    }

    const {
      width = 1920,
      height = 1080,
      theme = 'teal',
      appName = 'Dashboard',
      appCategory = 'custom',
    } = options;

    console.log(`[Render] Starting dashboard render: ${appName} (${theme} theme)`);
    console.log(`[Render] Dimensions: ${width}x${height}`);
    console.log(`[Render] Widgets: ${dashboardData.widgets.length}`);

    // Generate HTML
    const html = generateDashboardHTML(dashboardData, options);

    // Launch browser
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    // Set viewport
    await page.setViewport({ width, height });

    // Set content
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    // Wait for Chart.js to render (if any charts present)
    const hasCharts = dashboardData.widgets.some(w =>
      ['SimpleBarChart', 'SimpleLineChart', 'SimpleAreaChart', 'SimplePieChart'].includes(w.component)
    );

    if (hasCharts) {
      await page.waitForFunction(() => {
        return window.Chart !== undefined;
      }, { timeout: 5000 }).catch(() => {
        console.warn('[Render] Chart.js timeout - continuing anyway');
      });
      // Give charts time to render
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Take screenshot
    const screenshot = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: {
        x: 0,
        y: 0,
        width,
        height,
      },
    });

    console.log(`[Render] ✓ Dashboard rendered successfully (${screenshot.length} bytes)`);

    return screenshot;

  } catch (error) {
    console.error('[Render] Error rendering dashboard:', error);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
