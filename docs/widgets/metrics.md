# Metryki i KPI

Widgety do wyświetlania pojedynczych wartości, wskaźników i KPI.

## SimpleKPI

Główny widget KPI z dużą wartością i opcjonalnym trendem.

**Min. kolumny:** 2 (16.67% szerokości)

### Props

```typescript
interface SimpleKPIProps {
  title?: string;           // Tytuł widgetu
  value?: string | number;  // Główna wartość
  subtitle?: string;        // Tekst pod wartością
  trend?: 'up' | 'down' | 'neutral';  // Kierunek trendu
  color?: string;           // Kolor akcentu (domyślnie theme)
  skeleton?: SkeletonMode;
}
```

### Przykład

```jsx
<SimpleKPI
  title="Active Users"
  value="1,234"
  subtitle="+12% from last week"
  trend="up"
/>
```

### Wizualizacja trendu

- `up` - Zielona strzałka w górę
- `down` - Czerwona strzałka w dół
- `neutral` - Szara kreska

---

## SimpleMetricCard

Metryka z jednostką i podtytułem.

**Min. kolumny:** 3 (25% szerokości)

### Props

```typescript
interface SimpleMetricCardProps {
  title?: string;
  value?: string | number;
  unit?: string;      // Jednostka (np. "GB", "%", "ms")
  subtitle?: string;
  skeleton?: SkeletonMode;
}
```

### Przykład

```jsx
<SimpleMetricCard
  title="Storage Used"
  value="256"
  unit="GB"
  subtitle="of 500 GB total"
/>
```

---

## SimpleScoreCard

Wynik z kołowym wskaźnikiem postępu.

**Min. kolumny:** 3 (25% szerokości)

### Props

```typescript
interface SimpleScoreCardProps {
  title?: string;
  score?: number;     // Aktualny wynik
  maxScore?: number;  // Maksymalny wynik (domyślnie 100)
  subtitle?: string;
  skeleton?: SkeletonMode;
}
```

### Przykład

```jsx
<SimpleScoreCard
  title="Security Score"
  score={85}
  maxScore={100}
  subtitle="Good standing"
/>
```

### Wizualizacja

Kołowy progress indicator pokazujący procent `score/maxScore`.

---

## SimpleStatusCard

Karta ze statusami - ikonami i etykietami.

**Min. kolumny:** 4 (33.33% szerokości)

### Props

```typescript
interface SimpleStatusCardProps {
  title?: string;
  items?: StatusItem[];
  skeleton?: SkeletonMode;
}

interface StatusItem {
  label: string;
  status: 'success' | 'warning' | 'error' | 'info';
  value?: string | number;
}
```

### Przykład

```jsx
<SimpleStatusCard
  title="System Health"
  items={[
    { label: "API", status: "success", value: "Online" },
    { label: "Database", status: "warning", value: "High Load" },
    { label: "Cache", status: "error", value: "Offline" }
  ]}
/>
```

### Kolory statusów

| Status | Kolor | Ikona |
|--------|-------|-------|
| `success` | Zielony | Checkmark |
| `warning` | Żółty | Warning |
| `error` | Czerwony | X |
| `info` | Niebieski | Info |

---

## SimpleComparisonCard

Porównanie dwóch wartości obok siebie.

**Min. kolumny:** 4 (33.33% szerokości)

### Props

```typescript
interface SimpleComparisonCardProps {
  title?: string;
  valueA?: string | number;
  valueB?: string | number;
  labelA?: string;
  labelB?: string;
  skeleton?: SkeletonMode;
}
```

### Przykład

```jsx
<SimpleComparisonCard
  title="Traffic Comparison"
  valueA="12,450"
  labelA="This Month"
  valueB="10,230"
  labelB="Last Month"
/>
```

---

## SimpleProgressBar

Pasek postępu z dużym procentem.

**Min. kolumny:** 3 (25% szerokości)

### Props

```typescript
interface SimpleProgressBarProps {
  title?: string;
  percentage?: number;  // 0-100
  current?: number;     // Aktualna wartość
  total?: number;       // Wartość maksymalna
  label?: string;       // Niestandardowa etykieta
  color?: string;       // Kolor paska (domyślnie theme)
  skeleton?: SkeletonMode;
}
```

### Przykład

```jsx
<SimpleProgressBar
  title="Project Progress"
  percentage={75}
  current={15}
  total={20}
/>
```

### Wizualizacja

```
┌────────────────────────────┐
│ PROJECT PROGRESS           │
│                            │
│ ┌─ 15 / 20 ─┐              │
│                            │
│ ████████████░░░░           │
│                            │
│ 75%                        │
└────────────────────────────┘
```

- Duży procent (3rem) w kolorze motywu
- Pasek postępu nad procentem
- Etykieta `current / total` nad paskiem

### Automatyczna etykieta

Jeśli nie podano `label`, ale podano `current` i `total`:
- Wyświetla: `{current} / {total}`

Jeśli podano `label`:
- Wyświetla podaną etykietę

---

## Wspólne cechy

### Skeleton modes

Wszystkie widgety metryczne wspierają:

```jsx
// Tylko tytuł jako skeleton
<SimpleKPI title="Users" value="1,234" skeleton="title" />

// Tytuł i subtitle jako skeleton
<SimpleKPI title="Users" value="1,234" skeleton="semi" />

// Wszystko jako skeleton
<SimpleKPI title="Users" value="1,234" skeleton="full" />
```

### Responsywność

- Wartości automatycznie skalują rozmiar czcionki
- Długie wartości są przycinane
- Tytuły używają `uppercase` i `tracking-wide`

### Integracja z motywem

```jsx
import useThemeColor from '../../hooks/useThemeColor';

function SimpleKPI({ color, ...props }) {
  const themeColor = useThemeColor();
  const accentColor = color || themeColor;

  return (
    <span style={{ color: accentColor }}>
      {props.value}
    </span>
  );
}
```
