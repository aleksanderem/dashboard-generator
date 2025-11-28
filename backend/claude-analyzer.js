import dotenv from 'dotenv';

dotenv.config();

/**
 * Analyzes a dashboard screenshot using Anthropic Claude Vision API
 * @param {Buffer} imageBuffer - The screenshot image buffer
 * @param {string} mimeType - The image MIME type (e.g., 'image/png')
 * @returns {Promise<Object>} Analysis result with widgets, layout, and theme
 */
export async function analyzeDashboard(imageBuffer, mimeType) {
  try {
    // Convert buffer to base64
    const base64Image = imageBuffer.toString('base64');

    // Create the prompt for dashboard analysis
    const prompt = `Analyze this dashboard screenshot in detail and provide a comprehensive JSON response.

Your task is to identify:
1. All visible widgets/components (KPIs, charts, metrics, tables, etc.)
2. Their exact positions using a 20-column × 30-row grid system
3. Color theme being used
4. Data values, titles, and labels visible in each widget

🚨 GRID SYSTEM - 20 COLUMNS × 30 ROWS 🚨

ALL widgets MUST be positioned using this fixed grid:
- Grid width: 20 columns (x: 0-19)
- Grid height: 30 rows (y: 0-29)
- Each widget needs: x, y, w, h coordinates
  - x: column position (0-19)
  - y: row position (0-29)
  - w: width in columns (how many columns wide)
  - h: height in rows (how many rows tall)

🚨 CRITICAL LAYOUT RULE - READ THIS FIRST! 🚨
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
**WIDGETS PLACED NEXT TO EACH OTHER (side by side, in one row) MUST have the SAME y coordinate!**

✓ CORRECT (5 cards in one row - all have y=0):
  Card 1: x=0,  y=0, w=3, h=4  ← y=0
  Card 2: x=3,  y=0, w=3, h=4  ← y=0 (SAME as Card 1)
  Card 3: x=6,  y=0, w=3, h=4  ← y=0 (SAME as Card 1)
  Card 4: x=9,  y=0, w=3, h=4  ← y=0 (SAME as Card 1)
  Card 5: x=12, y=0, w=8, h=4  ← y=0 (SAME as Card 1)

✗ WRONG (cards stacked vertically - different y values):
  Card 1: x=0, y=0, w=3, h=4
  Card 2: x=0, y=1, w=3, h=4  ← WRONG! Different y=1
  Card 3: x=0, y=2, w=3, h=4  ← WRONG! Different y=2
  Card 4: x=0, y=3, w=3, h=4  ← WRONG! Different y=3

**REMEMBER: Same row = Same y coordinate! Only change y when starting a NEW row!**
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📐 COMMON LAYOUT EXAMPLES (COMPACT HEIGHTS):

5 METRIC CARDS IN ONE ROW (first 3 cards = 50% total, last 2 cards = 50% total):
Widget 1: x=0,  y=0, w=3, h=4
Widget 2: x=3,  y=0, w=3, h=4
Widget 3: x=6,  y=0, w=4, h=4
Widget 4: x=10, y=0, w=5, h=4
Widget 5: x=15, y=0, w=5, h=4

4 METRIC CARDS IN ONE ROW (25% width each):
Widget 1: x=0,  y=0, w=5, h=4
Widget 2: x=5,  y=0, w=5, h=4
Widget 3: x=10, y=0, w=5, h=4
Widget 4: x=15, y=0, w=5, h=4

3 METRIC CARDS IN ONE ROW (33% width each):
Widget 1: x=0,  y=0, w=6, h=4
Widget 2: x=6,  y=0, w=7, h=4
Widget 3: x=13, y=0, w=7, h=4

2 METRIC CARDS IN ONE ROW (50% width each):
Widget 1: x=0,  y=0, w=10, h=4
Widget 2: x=10, y=0, w=10, h=4

FULL WIDTH BAR CHART:
x=0, y=0, w=20, h=10

FULL WIDTH TABLE:
x=0, y=0, w=20, h=15

TWO CHARTS SIDE BY SIDE (50% width each):
Chart 1: x=0,  y=0, w=10, h=8
Chart 2: x=10, y=0, w=10, h=8

LARGE CHART WITH METRICS ON TOP:
Metrics row: x=0, y=0, w=4, h=4 (repeat for 5 metrics)
Chart below: x=0, y=4, w=20, h=12

📏 SIZING GUIDELINES (COMPACT PROFESSIONAL LAYOUT):

HEIGHT GUIDELINES - MATCH MANAGEENGINE AD360 PROPORTIONS:
- Metric/KPI/Summary cards: h=4 (compact, ~120px)
- Charts side-by-side (w=10): h=5 (medium, ~150px)
- Full-width charts (w=20): h=8-9 (tall, ~240-270px)
- Full-width tables: h=12-15 (very tall, ~360-450px)

WIDTH GUIDELINES:
- Metric cards (small): w=4-5 columns (for 4-5 cards in a row)
- Charts (medium): w=10-20 columns (half or full width)
- Tables (large): w=15-20 columns (usually full or 3/4 width)

🚨 CRITICAL WIDTH CONSTRAINTS 🚨

MAXIMUM WIDTHS BY WIDGET CATEGORY - NEVER EXCEED THESE:

SMALL WIDGETS (Metric/KPI/Summary/Score Cards):
- kpi, kpi_card: w=4 to w=7 MAX (20-35% width)
- metric, metric_card: w=4 to w=7 MAX (20-35% width)
- score, score_card: w=4 to w=7 MAX (20-35% width)
- comparison, comparison_card: w=4 to w=7 MAX (20-35% width)
- status_card (single): w=4 to w=7 MAX (20-35% width)
⚠️ NEVER assign w=20 to these small card widgets!
⚠️ If you see only 1-3 metric cards, use w=5 to w=7 (25-35%)
⚠️ If you see 4-5 metric cards in a row, use w=4 to w=5 (20-25%)

MEDIUM WIDGETS (Charts):
- line_chart, area_chart: w=10 to w=12 (50-60% width) for side-by-side
- pie_chart, donut_chart: w=10 to w=12 (50-60% width) for side-by-side
- gauge, gauge_chart: w=10 to w=12 (50-60% width) for side-by-side
- Or w=20 (100% width) for full-width charts

LARGE WIDGETS (Bar Charts, Lists, Tables):
- bar_chart, column_chart: w=15 to w=20 (75-100% width)
- status_list (multi-item): w=10 to w=20 (50-100% width)
- table, data_table: w=15 to w=20 (75-100% width)
- timeline: w=15 to w=20 (75-100% width)

EXAMPLES OF CORRECT WIDTHS:
✓ Single metric card: w=5 (25% width)
✓ Two metric cards: w=10 each (50% width each)
✓ Three metric cards: w=6 or w=7 each (30-35% width each)
✓ Four metric cards: w=5 each (25% width each)
✓ Five metric cards: first 3 w=3,3,4 (50% total), last 2 w=5,5 (50% total)
✗ WRONG: Single metric card with w=20 (100% width) - TOO WIDE!
✗ WRONG: Metric card with w=15 (75% width) - TOO WIDE!

🚨 CRITICAL RESTRICTIONS - WIDGET TYPES 🚨

You MUST use ONLY these exact widget types. DO NOT create any new types:

ALLOWED TYPES:
- kpi, kpi_card - for single metric/KPI displays
- metric, metric_card - for metric cards with values
- line_chart - for line charts
- area_chart - for area/filled line charts
- bar_chart, column_chart - for bar/column charts
- pie_chart, donut_chart - for pie and donut charts
- gauge, gauge_chart - for gauge/radial charts
- status_list, status_card - for status indicators
- progress, progress_bar - for progress indicators
- table, data_table - for data tables
- heatmap - for heatmaps
- timeline - for timeline visualizations
- score, score_card - for score displays
- comparison, comparison_card - for comparison widgets

IMPORTANT RULES:
1. ONLY detect actual visual widgets (charts, graphs, metrics, cards)
2. DO NOT create separate widgets for text labels, legends, axis labels, or metadata
3. DO NOT create widgets for table row data that's part of a larger table
4. DO NOT invent new widget types - use ONLY the types listed above
5. If a widget doesn't fit any type, skip it or use the closest matching type

🚨 MINIMUM CONTENT REQUIREMENTS 🚨

BAR CHARTS (bar_chart, column_chart):
- Minimum 7 data points (bars)
- If fewer → use metric cards instead
- Must have meaningful labels on each bar

LISTS (status_list, timeline):
- Title + minimum 3-4 list items
- Each item must have meaningful text
- If fewer items → use single metric card instead

TABLES (table, data_table):
- Minimum 3 rows of data
- At least 2 columns
- If less data → use list or metric cards

METRIC/KPI CARDS:
- Must have: title + value
- Optional: subtitle, trend indicator

CHARTS (line_chart, area_chart, pie_chart):
- Minimum 3-5 data points
- Must be clearly visible in screenshot

For each widget, determine:
- Type: MUST be one of the allowed types listed above
- Position: x (column 0-19), y (row 0-29), w (width in columns), h (height in rows)
- Title/Label
- Primary value or data points
- Subtitle or supporting text
- Trend indicator (up, down, neutral) if applicable
- Color or status indicator if applicable

Theme detection:
- Identify primary color (teal, blue, purple, orange, green, red, gray, pink)
- Note if it's light or dark mode

Return ONLY valid JSON (no markdown, no code blocks) in this exact structure:

EXAMPLE 1 - Single full-width bar chart:
{
  "layout": {
    "type": "grid",
    "columns": 20,
    "rows": 30,
    "hasHeader": true,
    "hasSidebar": false
  },
  "theme": "teal",
  "widgets": [
    {
      "id": "widget-1",
      "type": "bar_chart",
      "title": "Daily Activity",
      "dataPoints": 7,
      "position": {
        "x": 0,
        "y": 0,
        "w": 20,
        "h": 12
      }
    }
  ]
}

EXAMPLE 2 - Two charts side by side:
{
  "layout": {
    "type": "grid",
    "columns": 20,
    "rows": 30,
    "hasHeader": true,
    "hasSidebar": false
  },
  "theme": "teal",
  "widgets": [
    {
      "id": "widget-1",
      "type": "bar_chart",
      "title": "Revenue",
      "dataPoints": 7,
      "position": {
        "x": 0,
        "y": 0,
        "w": 10,
        "h": 5
      }
    },
    {
      "id": "widget-2",
      "type": "status_list",
      "title": "Active Tasks",
      "items": ["Task 1", "Task 2", "Task 3", "Task 4"],
      "position": {
        "x": 10,
        "y": 0,
        "w": 10,
        "h": 5
      }
    }
  ]
}

EXAMPLE 3 - Three metric cards in one row (proper 30-35% width each):
{
  "layout": {
    "type": "grid",
    "columns": 20,
    "rows": 30,
    "hasHeader": true,
    "hasSidebar": false
  },
  "theme": "teal",
  "widgets": [
    {
      "id": "widget-1",
      "type": "kpi",
      "title": "Total Users",
      "value": "2847",
      "subtitle": "+12%",
      "position": {
        "x": 0,
        "y": 0,
        "w": 6,
        "h": 4
      }
    },
    {
      "id": "widget-2",
      "type": "kpi",
      "title": "Revenue",
      "value": "$45k",
      "subtitle": "+23%",
      "position": {
        "x": 6,
        "y": 0,
        "w": 7,
        "h": 4
      }
    },
    {
      "id": "widget-3",
      "type": "kpi",
      "title": "Orders",
      "value": "892",
      "subtitle": "+8%",
      "position": {
        "x": 13,
        "y": 0,
        "w": 7,
        "h": 4
      }
    }
  ]
}

EXAMPLE 4 - Five metric cards in one row + full width chart below:
{
  "layout": {
    "type": "grid",
    "columns": 20,
    "rows": 30,
    "hasHeader": true,
    "hasSidebar": false
  },
  "theme": "blue",
  "widgets": [
    {
      "id": "widget-1",
      "type": "metric_card",
      "title": "Total Sales",
      "value": "$125k",
      "position": {
        "x": 0,
        "y": 0,
        "w": 3,
        "h": 4
      }
    },
    {
      "id": "widget-2",
      "type": "metric_card",
      "title": "New Users",
      "value": "1,234",
      "position": {
        "x": 3,
        "y": 0,
        "w": 3,
        "h": 4
      }
    },
    {
      "id": "widget-3",
      "type": "metric_card",
      "title": "Orders",
      "value": "456",
      "position": {
        "x": 6,
        "y": 0,
        "w": 3,
        "h": 4
      }
    },
    {
      "id": "widget-4",
      "type": "metric_card",
      "title": "Conversion",
      "value": "3.2%",
      "position": {
        "x": 9,
        "y": 0,
        "w": 3,
        "h": 4
      }
    },
    {
      "id": "widget-5",
      "type": "metric_card",
      "title": "AOV",
      "value": "$273",
      "position": {
        "x": 12,
        "y": 0,
        "w": 8,
        "h": 4
      }
    },
    {
      "id": "widget-6",
      "type": "line_chart",
      "title": "Sales Trend",
      "dataPoints": 12,
      "position": {
        "x": 0,
        "y": 4,
        "w": 20,
        "h": 10
      }
    }
  ]
}

Be thorough and accurate. Analyze the actual content, positioning, and styling visible in the screenshot. Use the 20×30 grid coordinates directly.`;

    console.log('Sending request to Anthropic Claude Vision API...');

    // Determine media type from mimeType parameter
    const mediaType = mimeType || 'image/png';

    // Call Anthropic API with Claude 3.5 Sonnet vision format
    const response = await fetch(process.env.ANTHROPIC_API_URL || 'https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: prompt
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Anthropic API error (${response.status}): ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('Received response from Anthropic Claude Vision API');

    // Extract text from Anthropic response format
    let analysisText;
    if (data.content && data.content[0] && data.content[0].text) {
      analysisText = data.content[0].text.trim();
    } else {
      throw new Error('Invalid response format from Anthropic API');
    }

    // Remove markdown code blocks if present
    analysisText = analysisText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

    // Extract JSON from text (handle cases where AI adds prefix like "Here is the JSON:")
    const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    analysisText = jsonMatch[0];

    // Parse the JSON response
    const analysis = JSON.parse(analysisText);

    // Validate the response structure
    if (!analysis.widgets || !Array.isArray(analysis.widgets)) {
      throw new Error('Invalid analysis response: missing or invalid widgets array');
    }

    if (!analysis.layout) {
      throw new Error('Invalid analysis response: missing layout information');
    }

    // Ensure all widgets have IDs
    analysis.widgets = analysis.widgets.map((widget, index) => ({
      ...widget,
      id: widget.id || `widget-${index + 1}`,
    }));

    // Validate that all widgets use the new x,y,w,h format
    analysis.widgets.forEach((widget, index) => {
      const pos = widget.position;
      if (!pos || typeof pos.x === 'undefined' || typeof pos.y === 'undefined' ||
          typeof pos.w === 'undefined' || typeof pos.h === 'undefined') {
        throw new Error(`Widget ${index + 1} is missing required position fields (x, y, w, h)`);
      }

      // Validate ranges
      if (pos.x < 0 || pos.x >= 20 || pos.y < 0 || pos.y >= 30) {
        throw new Error(`Widget ${index + 1} has invalid position: x=${pos.x}, y=${pos.y} (must be x: 0-19, y: 0-29)`);
      }

      if (pos.w <= 0 || pos.w > 20 || pos.h <= 0 || pos.h > 30) {
        throw new Error(`Widget ${index + 1} has invalid size: w=${pos.w}, h=${pos.h} (must be w: 1-20, h: 1-30)`);
      }
    });

    // Calculate dashboard area coverage (for logging only)
    const gridCols = 20;
    const gridRows = 30;
    const totalGridArea = gridCols * gridRows;

    let coveredArea = 0;
    analysis.widgets.forEach(widget => {
      const pos = widget.position;
      coveredArea += pos.w * pos.h;
    });

    const coveragePercent = (coveredArea / totalGridArea) * 100;
    console.log(`✓ Analysis complete: ${analysis.widgets.length} widgets identified`);
    console.log(`✓ Dashboard coverage: ${coveragePercent.toFixed(1)}% (${coveredArea}/${totalGridArea} grid cells)`);

    return analysis;
  } catch (error) {
    console.error('Error in analyzeDashboard:', error);

    if (error instanceof SyntaxError) {
      throw new Error(`Failed to parse Anthropic response as JSON: ${error.message}`);
    }

    if (error.message && error.message.includes('401')) {
      throw new Error('Invalid Anthropic API key. Please check your .env file');
    }

    throw error;
  }
}
