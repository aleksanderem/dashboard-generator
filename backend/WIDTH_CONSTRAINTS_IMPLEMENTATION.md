# Widget Width Constraints Implementation

## Summary
Fixed the issue where metric cards and small widgets were incorrectly getting 100% width (w=20) when they should be constrained to 20-35% width maximum.

## Changes Made

### 1. Updated claude-analyzer.js
**File**: `/Users/alex/Desktop/MOJE_PROJEKTY/MWT/dashboard-ai-generator/backend/claude-analyzer.js`

Added a new section `🚨 CRITICAL WIDTH CONSTRAINTS 🚨` in the AI prompt (lines 88-121) that explicitly defines:

**Small Widgets (20-35% max width):**
- kpi, kpi_card: w=4 to w=7 MAX
- metric, metric_card: w=4 to w=7 MAX
- score, score_card: w=4 to w=7 MAX
- comparison, comparison_card: w=4 to w=7 MAX
- status_card (single): w=4 to w=7 MAX

**Medium Widgets (50-60% width):**
- line_chart, area_chart: w=10 to w=12
- pie_chart, donut_chart: w=10 to w=12
- gauge, gauge_chart: w=10 to w=12
- Or w=20 for full-width charts

**Large Widgets (75-100% width):**
- bar_chart, column_chart: w=15 to w=20
- status_list (multi-item): w=10 to w=20
- table, data_table: w=15 to w=20
- timeline: w=15 to w=20

**Updated EXAMPLE 3** to show 3 metric cards with proper widths (w=6, w=7, w=7) instead of the previous incorrect widths.

### 2. Added Validation in widget-mapper.js
**File**: `/Users/alex/Desktop/MOJE_PROJEKTY/MWT/dashboard-ai-generator/backend/widget-mapper.js`

Added `validateWidgetWidth()` function (lines 66-109) that:
- Checks if a widget is a "small widget" type
- Validates the width doesn't exceed 7 columns (35%)
- If width is too large, corrects it to 5 columns (25%)
- Logs a warning when correction occurs

**Small widget types validated:**
```javascript
const smallWidgetTypes = [
  'kpi',
  'kpi_card',
  'metric',
  'metric_card',
  'score',
  'score_card',
  'comparison',
  'comparison_card',
  'status_card',
];
```

**Updated mapWidgets()** function to call `validateWidgetWidth()` for every widget before returning.

## Testing

Validation tests confirmed:
- ✅ Metric card with w=20 → corrected to w=5 (with warning)
- ✅ KPI card with w=15 → corrected to w=5 (with warning)
- ✅ Metric card with w=5 → unchanged (correct width)
- ✅ Bar chart with w=20 → unchanged (large widgets can be full width)

## Expected Behavior

**Before:**
- Metric cards could get w=20 (100% width) - WRONG
- No validation to prevent incorrect widths
- AI had no clear width constraints

**After:**
- Metric cards constrained to w=7 max (35% width)
- Backend validation corrects any incorrect widths
- AI prompt has explicit width constraints and examples
- Console warnings alert developers when widths are corrected

## Files Modified

1. `/Users/alex/Desktop/MOJE_PROJEKTY/MWT/dashboard-ai-generator/backend/claude-analyzer.js`
   - Added WIDTH CONSTRAINTS section (lines 88-121)
   - Updated EXAMPLE 3 for correct metric card widths

2. `/Users/alex/Desktop/MOJE_PROJEKTY/MWT/dashboard-ai-generator/backend/widget-mapper.js`
   - Added `validateWidgetWidth()` function (lines 66-109)
   - Updated `mapWidgets()` to use validation (line 54)

## Result

Metric cards and small widgets will now:
1. Be instructed by AI to use proper widths (20-35%)
2. Be validated by backend to never exceed 35% width
3. Show warnings in console when corrections are made
4. Display correctly in the dashboard UI

Zero risk of 100% width metric cards! ✅
