# Visual Layout Conversion Example

## 20-Column Grid (AI Input)

```
Columns: 0  1  2  3  4  5  6  7  8  9  10 11 12 13 14 15 16 17 18 19
         ┌─────────────┬─────────────┬─────────────┬─────────────┐
Row 0    │   Metric 1  │   Metric 2  │   Metric 3  │   Metric 4  │
         │  x=0, w=5   │  x=5, w=5   │  x=10, w=5  │  x=15, w=5  │
Row 3    └─────────────┴─────────────┴─────────────┴─────────────┘
         ┌───────────────────────────────────────────────────────┐
Row 4    │                                                       │
         │                  Bar Chart                            │
         │                  x=0, w=20                            │
         │                                                       │
Row 18   └───────────────────────────────────────────────────────┘
         ┌─────────────────────────┬─────────────────────────────┐
Row 19   │                         │                             │
         │    Line Chart           │      Pie Chart              │
         │    x=0, w=10            │      x=10, w=10             │
         │                         │                             │
Row 29   └─────────────────────────┴─────────────────────────────┘
```

## 12-Column Grid (React Grid Layout Output)

```
Columns: 0  1  2  3  4  5  6  7  8  9  10 11
         ┌────────┬────────┬────────┬────────┐
Row 0    │ Metric │ Metric │ Metric │ Metric │
         │   1    │   2    │   3    │   4    │
         │ x=0    │ x=3    │ x=6    │ x=9    │
         │ w=3    │ w=3    │ w=3    │ w=3    │
Row 3    └────────┴────────┴────────┴────────┘
         ┌───────────────────────────────────┐
Row 4    │                                   │
         │          Bar Chart                │
         │          x=0, w=12                │
         │                                   │
Row 18   └───────────────────────────────────┘
         ┌─────────────────┬─────────────────┐
Row 19   │                 │                 │
         │   Line Chart    │   Pie Chart     │
         │   x=0, w=6      │   x=6, w=6      │
         │                 │                 │
Row 29   └─────────────────┴─────────────────┘
```

## Conversion Mappings

### Metric Cards (25% width each)

| Widget    | 20-Column Grid | 12-Column Grid | Calculation           |
|-----------|----------------|----------------|-----------------------|
| Metric 1  | x=0, w=5       | x=0, w=3       | 0/20*12=0, 5/20*12=3 |
| Metric 2  | x=5, w=5       | x=3, w=3       | 5/20*12=3, 5/20*12=3 |
| Metric 3  | x=10, w=5      | x=6, w=3       | 10/20*12=6, 5/20*12=3|
| Metric 4  | x=15, w=5      | x=9, w=3       | 15/20*12=9, 5/20*12=3|

### Full-Width Chart (100% width)

| Widget     | 20-Column Grid | 12-Column Grid | Calculation            |
|------------|----------------|----------------|------------------------|
| Bar Chart  | x=0, w=20      | x=0, w=12      | 0/20*12=0, 20/20*12=12|

### Half-Width Charts (50% width each)

| Widget      | 20-Column Grid | 12-Column Grid | Calculation             |
|-------------|----------------|----------------|-------------------------|
| Line Chart  | x=0, w=10      | x=0, w=6       | 0/20*12=0, 10/20*12=6  |
| Pie Chart   | x=10, w=10     | x=6, w=6       | 10/20*12=6, 10/20*12=6 |

## Grid Cell Occupancy

### 20-Column Grid Cell Coverage

```
Metric 1:   Cols 0-4   (5 columns = 25%)
Metric 2:   Cols 5-9   (5 columns = 25%)
Metric 3:   Cols 10-14 (5 columns = 25%)
Metric 4:   Cols 15-19 (5 columns = 25%)
Bar Chart:  Cols 0-19  (20 columns = 100%)
Line Chart: Cols 0-9   (10 columns = 50%)
Pie Chart:  Cols 10-19 (10 columns = 50%)
```

### 12-Column Grid Cell Coverage

```
Metric 1:   Cols 0-2   (3 columns = 25%)
Metric 2:   Cols 3-5   (3 columns = 25%)
Metric 3:   Cols 6-8   (3 columns = 25%)
Metric 4:   Cols 9-11  (3 columns = 25%)
Bar Chart:  Cols 0-11  (12 columns = 100%)
Line Chart: Cols 0-5   (6 columns = 50%)
Pie Chart:  Cols 6-11  (6 columns = 50%)
```

## Key Observations

### Perfect Alignment
- **No gaps**: Widgets align perfectly without gaps
- **No overlaps**: Adjacent widgets share edges exactly
- **Proportions preserved**: 25%, 50%, 100% widths maintained

### Y-Axis (Rows)
- **No conversion needed**: Row positions and heights pass through unchanged
- **Row 0**: Top of metric cards
- **Row 4**: Start of bar chart
- **Row 19**: Start of line/pie charts

### Rounding Strategy
- **Math.round()**: Provides best integer approximation
- **No gaps**: Round ensures adjacent widgets meet exactly
  - x=5 → 3 (Metric 2 starts where Metric 1 ends)
  - x=10 → 6 (Metric 3 and Line/Pie charts align)

## Edge Cases

### Odd Widths in 20-Column Grid

| 20-Col Width | 12-Col Width | Percentage | Note                    |
|--------------|--------------|------------|-------------------------|
| w=1          | w=1          | ~5%        | Minimum width enforced  |
| w=3          | w=2          | 15%        | Rounds to 2             |
| w=7          | w=4          | 35%        | Rounds to 4             |
| w=13         | w=8          | 65%        | Rounds to 8             |
| w=17         | w=10         | 85%        | Rounds to 10            |

### Position Precision

| 20-Col Position | 12-Col Position | Calculation        |
|-----------------|------------------|--------------------|
| x=1             | x=1              | 1/20*12 ≈ 0.6 → 1 |
| x=7             | x=4              | 7/20*12 = 4.2 → 4 |
| x=13            | x=8              | 13/20*12 = 7.8 → 8|

## Responsive Behavior

With React Grid Layout, the conversion maintains:
- **Desktop**: 12-column grid (as converted)
- **Tablet**: Can use breakpoints to adjust
- **Mobile**: Can collapse to single column

The 20→12 conversion provides the base layout that can be further customized per breakpoint.
