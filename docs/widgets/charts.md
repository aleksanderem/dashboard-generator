# Wykresy

Widgety do wizualizacji danych w formie wykresów. Używają biblioteki **Recharts**.

## SimpleLineChart

Wykres liniowy do prezentacji trendów.

**Min. kolumny:** 6 (50% szerokości)

### Props

```typescript
interface SimpleLineChartProps {
  title?: string;
  data?: DataPoint[];
  color?: string;      // Kolor linii (domyślnie theme)
  height?: number;     // Wysokość wykresu w px
  skeleton?: SkeletonMode;
}

interface DataPoint {
  name: string;   // Etykieta osi X
  value: number;  // Wartość Y
}
```

### Przykład

```jsx
<SimpleLineChart
  title="Weekly Traffic"
  data={[
    { name: "Mon", value: 120 },
    { name: "Tue", value: 150 },
    { name: "Wed", value: 180 },
    { name: "Thu", value: 140 },
    { name: "Fri", value: 200 }
  ]}
/>
```

### Cechy

- Brak osi (uproszczony wygląd)
- Gładka linia z `type="monotone"`
- Responsywna szerokość

---

## SimpleAreaChart

Wykres obszarowy z wypełnieniem.

**Min. kolumny:** 6 (50% szerokości)

### Props

```typescript
interface SimpleAreaChartProps {
  title?: string;
  data?: DataPoint[];
  color?: string;
  height?: number;
  skeleton?: SkeletonMode;
}
```

### Przykład

```jsx
<SimpleAreaChart
  title="Memory Usage"
  data={[
    { name: "00:00", value: 45 },
    { name: "06:00", value: 52 },
    { name: "12:00", value: 78 },
    { name: "18:00", value: 65 }
  ]}
  color="#10B981"
/>
```

### Cechy

- Wypełnienie z gradientem (opacity 0.3)
- Linia obrysowa
- Brak legendy

---

## SimpleBarChart

Wykres słupkowy.

**Min. kolumny:** 6 (50% szerokości)

### Props

```typescript
interface SimpleBarChartProps {
  title?: string;
  data?: DataPoint[];
  color?: string;
  height?: number;
  maxBars?: number;      // Maks. liczba słupków (domyślnie 10)
  showTooltip?: boolean; // Pokaż tooltip (domyślnie true)
  skeleton?: SkeletonMode;
}
```

### Przykład

```jsx
<SimpleBarChart
  title="Sales by Region"
  data={[
    { name: "North", value: 4500 },
    { name: "South", value: 3200 },
    { name: "East", value: 5100 },
    { name: "West", value: 2800 }
  ]}
  maxBars={5}
/>
```

### Cechy

- Automatyczne obcinanie do `maxBars`
- Tooltip z wartością
- Zaokrąglone rogi słupków

---

## SimplePieChart

Wykres kołowy/donut z wartością w środku.

**Min. kolumny:** 4 (33.33% szerokości)

### Props

```typescript
interface SimplePieChartProps {
  title?: string;
  percentage?: number;   // Procent wypełnienia (0-100)
  value?: string;        // Wartość wyświetlana w środku
  segments?: Segment[];  // Niestandardowe segmenty
  height?: number;
  skeleton?: SkeletonMode;
}

interface Segment {
  name: string;
  value: number;
  color: string;
}
```

### Przykład podstawowy

```jsx
<SimplePieChart
  title="Disk Usage"
  percentage={75}
  value="75%"
/>
```

### Przykład z segmentami

```jsx
<SimplePieChart
  title="Traffic Sources"
  segments={[
    { name: "Organic", value: 45, color: "#10B981" },
    { name: "Direct", value: 30, color: "#3B82F6" },
    { name: "Referral", value: 25, color: "#F59E0B" }
  ]}
  value="100%"
/>
```

### Cechy

- Styl donut (innerRadius 60%, outerRadius 85%)
- Wartość w centrum
- Kolor theme dla prostych procentów
- Start od góry (90°), zgodnie z ruchem wskazówek zegara

---

## SimpleGaugeChart

Wskaźnik gauge (półkole).

**Min. kolumny:** 4 (33.33% szerokości)

### Props

```typescript
interface SimpleGaugeChartProps {
  title?: string;
  value?: number;    // Aktualna wartość
  min?: number;      // Minimum (domyślnie 0)
  max?: number;      // Maximum (domyślnie 100)
  unit?: string;     // Jednostka (np. "%", "°C")
  skeleton?: SkeletonMode;
}
```

### Przykład

```jsx
<SimpleGaugeChart
  title="CPU Temperature"
  value={65}
  min={0}
  max={100}
  unit="°C"
/>
```

### Wizualizacja

```
    ╭───────────╮
   ╱             ╲
  │               │
  │     65°C      │
  ╰───────────────╯
```

- Półkole z wypełnieniem proporcjonalnym do wartości
- Wartość z jednostką w centrum
- Gradient kolorów (zielony → żółty → czerwony)

---

## SimpleHeatmap

Mapa ciepła - siatka kolorów.

**Min. kolumny:** 6 (50% szerokości)

### Props

```typescript
interface SimpleHeatmapProps {
  title?: string;
  data?: number[][];     // Macierz wartości
  rowLabels?: string[];  // Etykiety rzędów
  colLabels?: string[];  // Etykiety kolumn
  skeleton?: SkeletonMode;
}
```

### Przykład

```jsx
<SimpleHeatmap
  title="Activity by Hour"
  data={[
    [10, 20, 30, 40],
    [15, 25, 35, 45],
    [5, 15, 25, 35]
  ]}
  rowLabels={["Mon", "Tue", "Wed"]}
  colLabels={["00:00", "06:00", "12:00", "18:00"]}
/>
```

### Cechy

- Automatyczne kolorowanie (niskie = jasne, wysokie = ciemne)
- Używa koloru motywu
- Responsywna siatka

---

## Wspólne cechy wykresów

### Responsywność

```jsx
<ResponsiveContainer width="100%" height="100%">
  <LineChart data={data}>
    ...
  </LineChart>
</ResponsiveContainer>
```

### Brak elementów dekoracyjnych

Wykresy są uproszczone - brak:
- Osi X/Y
- Legendy
- Grid lines
- Etykiet danych

### Integracja z motywem

```jsx
const themeColor = useThemeColor();

<Line stroke={color || themeColor} />
<Bar fill={color || themeColor} />
<Area fill={color || themeColor} fillOpacity={0.3} />
```

### Skeleton loading

W trybie `skeleton="full"`:
- Zamiast wykresu pokazywany jest szary placeholder
- Zachowuje proporcje kontenera

```jsx
{showDataSkeleton ? (
  <Skeleton width="100%" height={height || 200} />
) : (
  <ResponsiveContainer>
    <LineChart data={data}>...</LineChart>
  </ResponsiveContainer>
)}
```
