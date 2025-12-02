import { test, expect } from '@playwright/test';

test.describe('Dashboard Generator - Widget Configuration', () => {

  // Helper function to login
  async function login(page, email = 'test@playwright.com') {
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');

    // Wait for either login screen or dashboard to appear
    const emailInput = page.locator('input[type="email"]');
    const buildButton = page.locator('button:has-text("Build from Scratch")');

    // Check if we're on login screen
    const isLoginScreen = await emailInput.isVisible({ timeout: 5000 }).catch(() => false);

    if (isLoginScreen) {
      // Fill email and submit
      await emailInput.fill(email);
      await page.locator('button:has-text("Continue")').click();

      // Wait for response - either API key screen (new user) or redirect
      await page.waitForTimeout(1000);

      // Check for API key screen (new user)
      const apiKeyScreen = page.locator('h1:has-text("Your API Key")');
      if (await apiKeyScreen.isVisible({ timeout: 3000 }).catch(() => false)) {
        await page.locator('button:has-text("Continue to Dashboard")').click();
        await page.waitForTimeout(500);
      }
    }

    // Wait for dashboard to load
    await expect(buildButton).toBeVisible({ timeout: 15000 });
  }

  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test to ensure fresh login
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.clear();
    });
    // Login
    await login(page);
  });

  test('should load the main page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Dashboard/i);

    // Check if the app container exists
    const appContainer = page.locator('#root');
    await expect(appContainer).toBeVisible();
  });

  test('should display Build from Scratch button', async ({ page }) => {
    await page.goto('/');

    // Look for the Build from Scratch button
    const buildButton = page.locator('button:has-text("Build from Scratch")');
    await expect(buildButton).toBeVisible({ timeout: 10000 });
  });

  test('should display Saved Dashboards button', async ({ page }) => {
    await page.goto('/');

    // Look for Saved Dashboards button
    const savedButton = page.locator('button:has-text("Saved Dashboards")');
    await expect(savedButton).toBeVisible({ timeout: 10000 });
  });

  test('should open dashboard editor when clicking Build from Scratch', async ({ page }) => {
    await page.goto('/');

    // Click on Build from Scratch
    const buildButton = page.locator('button:has-text("Build from Scratch")');
    await buildButton.click();

    // Wait for editor to appear
    await page.waitForTimeout(1000);

    // Check for Edit Mode toggle in the fixed panel
    const editModeToggle = page.locator('button:has-text("OFF")');
    await expect(editModeToggle).toBeVisible({ timeout: 10000 });
  });

  test('should enable Edit Mode when clicking toggle', async ({ page }) => {
    await page.goto('/');

    // Click on Build from Scratch
    const buildButton = page.locator('button:has-text("Build from Scratch")');
    await buildButton.click();
    await page.waitForTimeout(1000);

    // Click Edit Mode toggle (shows OFF initially)
    const editModeToggle = page.locator('button:has-text("OFF")');
    await editModeToggle.click();
    await page.waitForTimeout(500);

    // Should now show ON - use first() to handle multiple matches
    const onButton = page.getByRole('button', { name: 'ON', exact: true });
    await expect(onButton).toBeVisible({ timeout: 5000 });
  });

  test('should show layout preset dropdown when Edit Mode is ON', async ({ page }) => {
    await page.goto('/');

    // Click on Build from Scratch
    const buildButton = page.locator('button:has-text("Build from Scratch")');
    await buildButton.click();
    await page.waitForTimeout(1000);

    // Enable Edit Mode
    const editModeToggle = page.locator('button:has-text("OFF")');
    await editModeToggle.click();
    await page.waitForTimeout(500);

    // Look for select dropdown with layout options
    const layoutSelect = page.locator('select');
    await expect(layoutSelect).toBeVisible({ timeout: 5000 });
  });

  test('should show Configure Widgets button when Edit Mode is ON', async ({ page }) => {
    await page.goto('/');

    // Click on Build from Scratch
    const buildButton = page.locator('button:has-text("Build from Scratch")');
    await buildButton.click();
    await page.waitForTimeout(1000);

    // Enable Edit Mode
    const editModeToggle = page.locator('button:has-text("OFF")');
    await editModeToggle.click();
    await page.waitForTimeout(500);

    // Look for Configure Widgets button
    const configureButton = page.locator('button:has-text("Configure Widgets")');
    await expect(configureButton).toBeVisible({ timeout: 5000 });
  });

  test('should open Widget Configuration modal when clicking Configure Widgets', async ({ page }) => {
    await page.goto('/');

    // Click on Build from Scratch
    const buildButton = page.locator('button:has-text("Build from Scratch")');
    await buildButton.click();
    await page.waitForTimeout(1000);

    // Enable Edit Mode
    const editModeToggle = page.locator('button:has-text("OFF")');
    await editModeToggle.click();
    await page.waitForTimeout(500);

    // Click Configure Widgets button
    const configureButton = page.locator('button:has-text("Configure Widgets")');
    await configureButton.click();

    // Wait for modal to load config (includes API call)
    await page.waitForTimeout(2000);

    // Check for modal with Widget Configuration title
    const modalTitle = page.locator('h3:has-text("Widget Configuration")');
    await expect(modalTitle).toBeVisible({ timeout: 10000 });
  });

  test('should display widget configuration table in modal', async ({ page }) => {
    await page.goto('/');

    // Click on Build from Scratch
    const buildButton = page.locator('button:has-text("Build from Scratch")');
    await buildButton.click();
    await page.waitForTimeout(1000);

    // Enable Edit Mode
    const editModeToggle = page.locator('button:has-text("OFF")');
    await editModeToggle.click();
    await page.waitForTimeout(500);

    // Click Configure Widgets button
    const configureButton = page.locator('button:has-text("Configure Widgets")');
    await configureButton.click();

    // Wait for modal to load config (includes API call)
    await page.waitForTimeout(2000);

    // Check for table headers
    const widgetHeader = page.locator('th:has-text("Widget")');
    const skeletonHeader = page.locator('th:has-text("Skeleton Mode")');
    const columnsHeader = page.locator('th:has-text("Min Columns")');
    const randomHeader = page.locator('th:has-text("In Random")');

    await expect(widgetHeader).toBeVisible({ timeout: 10000 });
    await expect(skeletonHeader).toBeVisible({ timeout: 10000 });
    await expect(columnsHeader).toBeVisible({ timeout: 10000 });
    await expect(randomHeader).toBeVisible({ timeout: 10000 });
  });

  test('should have Save Config button in modal', async ({ page }) => {
    await page.goto('/');

    // Click on Build from Scratch
    const buildButton = page.locator('button:has-text("Build from Scratch")');
    await buildButton.click();
    await page.waitForTimeout(1000);

    // Enable Edit Mode
    const editModeToggle = page.locator('button:has-text("OFF")');
    await editModeToggle.click();
    await page.waitForTimeout(500);

    // Click Configure Widgets button
    const configureButton = page.locator('button:has-text("Configure Widgets")');
    await configureButton.click();

    // Wait for modal to load config (includes API call)
    await page.waitForTimeout(2000);

    // Check for Save Config button
    const saveConfigButton = page.locator('button:has-text("Save Config")');
    await expect(saveConfigButton).toBeVisible({ timeout: 10000 });
  });

  // ===== API Tests =====

  test('API: should create session', async ({ request }) => {
    const response = await request.post('https://dashboards.tytan.kolabogroup.pl/api/session');
    expect(response.ok()).toBeTruthy();

    const data = await response.json();
    expect(data.success).toBe(true);
    expect(data.session).toBeDefined();
    expect(data.session.session_key).toBeDefined();
    expect(data.session.expires_at).toBeDefined();

    console.log('Session created:', data.session.session_key.substring(0, 16) + '...');
  });

  test('API: should get widget config', async ({ request }) => {
    // First create a session
    const sessionResponse = await request.post('https://dashboards.tytan.kolabogroup.pl/api/session');
    const sessionData = await sessionResponse.json();
    const sessionKey = sessionData.session.session_key;

    // Then get widget config
    const configResponse = await request.get('https://dashboards.tytan.kolabogroup.pl/api/widgets/config', {
      headers: {
        'X-Session-Key': sessionKey,
      },
    });

    expect(configResponse.ok()).toBeTruthy();

    const configData = await configResponse.json();
    expect(configData.success).toBe(true);
    expect(configData.config).toBeDefined();

    // Check that default widgets exist
    expect(configData.config.SimpleKPI).toBeDefined();
    expect(configData.config.SimpleBarChart).toBeDefined();
    expect(configData.config.SimpleTable).toBeDefined();

    console.log('Widget types:', Object.keys(configData.config).length);
  });

  test('API: should save widget config', async ({ request }) => {
    // First create a session
    const sessionResponse = await request.post('https://dashboards.tytan.kolabogroup.pl/api/session');
    const sessionData = await sessionResponse.json();
    const sessionKey = sessionData.session.session_key;

    // Save custom config
    const customConfig = {
      SimpleKPI: { skeletonMode: 'full', minColumns: 3, availableInRandom: true },
      SimpleBarChart: { skeletonMode: 'none', minColumns: 6, availableInRandom: false },
    };

    const saveResponse = await request.put('https://dashboards.tytan.kolabogroup.pl/api/widgets/config', {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      data: { config: customConfig },
    });

    expect(saveResponse.ok()).toBeTruthy();

    const saveData = await saveResponse.json();
    expect(saveData.success).toBe(true);

    // Verify config was saved by fetching it again
    const verifyResponse = await request.get('https://dashboards.tytan.kolabogroup.pl/api/widgets/config', {
      headers: {
        'X-Session-Key': sessionKey,
      },
    });

    const verifyData = await verifyResponse.json();
    expect(verifyData.config.SimpleKPI.skeletonMode).toBe('full');
    expect(verifyData.config.SimpleKPI.minColumns).toBe(3);
    expect(verifyData.config.SimpleBarChart.availableInRandom).toBe(false);

    console.log('Config saved and verified successfully');
  });

  test('API: should generate packed dashboard', async ({ request }) => {
    // First create a session
    const sessionResponse = await request.post('https://dashboards.tytan.kolabogroup.pl/api/session');
    const sessionData = await sessionResponse.json();
    const sessionKey = sessionData.session.session_key;

    // Generate dashboard
    const generateResponse = await request.post('https://dashboards.tytan.kolabogroup.pl/api/generate/packed', {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      data: { widgetCount: 5 },
    });

    expect(generateResponse.ok()).toBeTruthy();

    const generateData = await generateResponse.json();
    expect(generateData.success).toBe(true);
    expect(generateData.dashboard).toBeDefined();
    expect(generateData.dashboard.gridLayout).toBeDefined();
    expect(generateData.dashboard.widgets).toBeDefined();
    expect(generateData.dashboard.widgets.length).toBe(5);

    console.log('Generated dashboard with', generateData.dashboard.widgets.length, 'widgets');
    console.log('Widget types:', generateData.dashboard.widgets.map(w => w.component).join(', '));
  });

  test('API: should respect availableInRandom setting', async ({ request }) => {
    // First create a session
    const sessionResponse = await request.post('https://dashboards.tytan.kolabogroup.pl/api/session');
    const sessionData = await sessionResponse.json();
    const sessionKey = sessionData.session.session_key;

    // Save config with only one widget available
    const customConfig = {
      SimpleKPI: { skeletonMode: 'semi', minColumns: 2, availableInRandom: true },
      SimpleMetricCard: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimpleScoreCard: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimpleStatusCard: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleComparisonCard: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleProgressBar: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimpleAreaChart: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimpleBarChart: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimpleLineChart: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimplePieChart: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleGaugeChart: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleHeatmap: { skeletonMode: 'full', minColumns: 6, availableInRandom: false },
      SimpleTable: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimpleAgentList: { skeletonMode: 'full', minColumns: 4, availableInRandom: false },
      SimpleBadgeList: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimplePriorityList: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleRecentList: { skeletonMode: 'full', minColumns: 4, availableInRandom: false },
      SimpleStatusList: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleTimelineCard: { skeletonMode: 'full', minColumns: 4, availableInRandom: false },
      SimpleCategoryCards: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
    };

    await request.put('https://dashboards.tytan.kolabogroup.pl/api/widgets/config', {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      data: { config: customConfig },
    });

    // Generate dashboard - should only have SimpleKPI widgets
    const generateResponse = await request.post('https://dashboards.tytan.kolabogroup.pl/api/generate/packed', {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      data: { widgetCount: 3 },
    });

    const generateData = await generateResponse.json();

    // All widgets should be SimpleKPI since it's the only one available
    const allKPI = generateData.dashboard.widgets.every(w => w.component === 'SimpleKPI');
    expect(allKPI).toBe(true);

    console.log('All generated widgets are SimpleKPI:', allKPI);
  });

  test('API: should use minColumns from config when only one widget type available', async ({ request }) => {
    // First create a session
    const sessionResponse = await request.post('https://dashboards.tytan.kolabogroup.pl/api/session');
    const sessionData = await sessionResponse.json();
    const sessionKey = sessionData.session.session_key;

    // Save config with only SimpleKPI available and minColumns = 6
    const customConfig = {
      SimpleKPI: { skeletonMode: 'semi', minColumns: 6, availableInRandom: true },
      SimpleMetricCard: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimpleScoreCard: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimpleStatusCard: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleComparisonCard: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleProgressBar: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimpleAreaChart: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimpleBarChart: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimpleLineChart: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimplePieChart: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleGaugeChart: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleHeatmap: { skeletonMode: 'full', minColumns: 6, availableInRandom: false },
      SimpleTable: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimpleAgentList: { skeletonMode: 'full', minColumns: 4, availableInRandom: false },
      SimpleBadgeList: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimplePriorityList: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleRecentList: { skeletonMode: 'full', minColumns: 4, availableInRandom: false },
      SimpleStatusList: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleTimelineCard: { skeletonMode: 'full', minColumns: 4, availableInRandom: false },
      SimpleCategoryCards: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
    };

    await request.put('https://dashboards.tytan.kolabogroup.pl/api/widgets/config', {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      data: { config: customConfig },
    });

    // Generate dashboard
    const generateResponse = await request.post('https://dashboards.tytan.kolabogroup.pl/api/generate/packed', {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      data: { widgetCount: 2 },
    });

    const generateData = await generateResponse.json();

    // Check that all widgets have width >= 6 (the minColumns we set)
    const widthsCorrect = generateData.dashboard.gridLayout.every(item => item.w >= 6);
    expect(widthsCorrect).toBe(true);

    console.log('Widget widths:', generateData.dashboard.gridLayout.map(w => w.w).join(', '));
  });

  test('API: should include skeletonMode in generated widget props', async ({ request }) => {
    // First create a session
    const sessionResponse = await request.post('https://dashboards.tytan.kolabogroup.pl/api/session');
    const sessionData = await sessionResponse.json();
    const sessionKey = sessionData.session.session_key;

    // Save config with specific skeletonMode
    const customConfig = {
      SimpleKPI: { skeletonMode: 'full', minColumns: 2, availableInRandom: true },
      SimpleMetricCard: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimpleScoreCard: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimpleStatusCard: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleComparisonCard: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleProgressBar: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimpleAreaChart: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimpleBarChart: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimpleLineChart: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimplePieChart: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleGaugeChart: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleHeatmap: { skeletonMode: 'full', minColumns: 6, availableInRandom: false },
      SimpleTable: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
      SimpleAgentList: { skeletonMode: 'full', minColumns: 4, availableInRandom: false },
      SimpleBadgeList: { skeletonMode: 'semi', minColumns: 3, availableInRandom: false },
      SimplePriorityList: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleRecentList: { skeletonMode: 'full', minColumns: 4, availableInRandom: false },
      SimpleStatusList: { skeletonMode: 'semi', minColumns: 4, availableInRandom: false },
      SimpleTimelineCard: { skeletonMode: 'full', minColumns: 4, availableInRandom: false },
      SimpleCategoryCards: { skeletonMode: 'semi', minColumns: 6, availableInRandom: false },
    };

    await request.put('https://dashboards.tytan.kolabogroup.pl/api/widgets/config', {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      data: { config: customConfig },
    });

    // Generate dashboard
    const generateResponse = await request.post('https://dashboards.tytan.kolabogroup.pl/api/generate/packed', {
      headers: {
        'Content-Type': 'application/json',
        'X-Session-Key': sessionKey,
      },
      data: { widgetCount: 2 },
    });

    const generateData = await generateResponse.json();

    // Check that skeletonMode is 'full' in all widget props (since only SimpleKPI is available)
    const allFull = generateData.dashboard.widgets.every(w => w.props.skeletonMode === 'full');
    expect(allFull).toBe(true);

    console.log('Skeleton modes:', generateData.dashboard.widgets.map(w => w.props.skeletonMode).join(', '));
  });

});
