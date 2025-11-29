# Przegląd widgetów

Dashboard Generator zawiera 20 uproszczonych widgetów podzielonych na 3 kategorie.

## Kategorie

| Kategoria | Widgety | Opis |
|-----------|---------|------|
| [Metryki](metrics.md) | 6 | KPI, liczniki, wskaźniki postępu |
| [Wykresy](charts.md) | 6 | Liniowe, słupkowe, kołowe, mapy ciepła |
| [Listy](lists.md) | 8 | Tabele, listy, timeline |

## Wspólne właściwości

Wszystkie widgety obsługują:

```typescript
interface CommonProps {
  title?: string;      // Tytuł widgetu
  skeleton?: SkeletonMode;  // Tryb ładowania
}

type SkeletonMode = false | 'title' | 'semi' | 'full';
```

### Tryby skeleton

| Tryb | Tytuł | Dane główne | Dane szczegółowe |
|------|-------|-------------|------------------|
| `false` | Normalny | Normalne | Normalne |
| `'title'` | Skeleton | Normalne | Normalne |
| `'semi'` | Skeleton | Normalne | Skeleton |
| `'full'` | Skeleton | Skeleton | Skeleton |

## Lista widgetów

### Metryki i KPI

| Widget | Min. kolumn | Opis |
|--------|-------------|------|
| `SimpleKPI` | 2 | Główna metryka z trendem |
| `SimpleMetricCard` | 3 | Metryka z jednostką |
| `SimpleScoreCard` | 3 | Wynik z kołowym wskaźnikiem |
| `SimpleStatusCard` | 4 | Lista statusów |
| `SimpleComparisonCard` | 4 | Porównanie dwóch wartości |
| `SimpleProgressBar` | 3 | Pasek postępu z procentem |

### Wykresy

| Widget | Min. kolumn | Opis |
|--------|-------------|------|
| `SimpleLineChart` | 6 | Wykres liniowy |
| `SimpleAreaChart` | 6 | Wykres obszarowy |
| `SimpleBarChart` | 6 | Wykres słupkowy |
| `SimplePieChart` | 4 | Wykres kołowy/donut |
| `SimpleGaugeChart` | 4 | Wskaźnik gauge |
| `SimpleHeatmap` | 6 | Mapa ciepła |

### Listy i tabele

| Widget | Min. kolumn | Opis |
|--------|-------------|------|
| `SimpleTable` | 6 | Tabela z nagłówkami |
| `SimpleBadgeList` | 3 | Lista z badge'ami |
| `SimpleAgentList` | 4 | Lista agentów/użytkowników |
| `SimpleStatusList` | 4 | Lista ze statusami |
| `SimplePriorityList` | 4 | Lista z priorytetami |
| `SimpleRecentList` | 4 | Lista ostatnich zdarzeń |
| `SimpleTimelineCard` | 4 | Oś czasu |
| `SimpleCategoryCards` | 6 | Karty kategorii |

## Użycie w kodzie

```jsx
import SimpleKPI from './components/simplified/SimpleKPI';

<SimpleKPI
  title="Active Users"
  value="1,234"
  subtitle="+12% from last month"
  trend="up"
  skeleton={false}
/>
```

## Responsywność

Wszystkie widgety automatycznie dostosowują się do rozmiaru kontenera:

- Wykresy skalują się proporcjonalnie
- Tabele ukrywają kolumny przy braku miejsca
- Tekst jest przycinany z `...` gdy za długi

## Styl CSS

Widgety używają klasy `.simplified-widget`:

```css
.simplified-widget {
  @apply bg-white rounded-xl shadow-sm hover:shadow-md;
  @apply transition-shadow duration-200;
  @apply p-6 h-full flex flex-col justify-between;
}

.widget-title {
  @apply text-sm font-medium text-gray-600;
  @apply uppercase tracking-wide mb-2;
}

.widget-value {
  @apply text-3xl font-bold text-gray-900 mt-auto;
}

.widget-subtitle {
  @apply text-sm text-gray-500 mt-1;
}
```

## Motywy kolorystyczne

Widgety używają hooka `useThemeColor()` do pobierania koloru motywu:

```jsx
import useThemeColor from '../../hooks/useThemeColor';

function MyWidget() {
  const themeColor = useThemeColor();

  return (
    <div style={{ color: themeColor }}>
      Theme-colored content
    </div>
  );
}
```

Kolor jest pobierany z CSS variable `--theme-primary`.
