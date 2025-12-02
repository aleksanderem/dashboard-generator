# Skeleton Mode Documentation

## Przegląd

Wszystkie widgety w Dashboard Generator obsługują teraz **skeleton mode** - stan ładowania, w którym zamiast prawdziwych danych wyświetlane są animowane placeholdery (szkielety).

## Jak Używać

### W Kodzie React

Każdy komponent widgetu akceptuje prop `skeleton`:

```jsx
import { SimpleKPI } from './components/simplified';

// Normalny tryb
<SimpleKPI
  title="Total Sales"
  value="$1,234"
  subtitle="+12.5%"
  trend="up"
/>

// Skeleton mode
<SimpleKPI
  skeleton={true}
/>
```

### Wszystkie Wspierane Komponenty

Wszystkie 19 komponentów widgetów obsługuje skeleton mode:

#### Metryki i KPI
- `<SimpleKPI skeleton={true} />`
- `<SimpleMetricCard skeleton={true} />`
- `<SimpleScoreCard skeleton={true} />`
- `<SimpleComparisonCard skeleton={true} />`

#### Wykresy
- `<SimpleAreaChart skeleton={true} />`
- `<SimpleBarChart skeleton={true} />`
- `<SimpleLineChart skeleton={true} />`
- `<SimplePieChart skeleton={true} />`
- `<SimpleGaugeChart skeleton={true} />`
- `<SimpleHeatmap skeleton={true} />`

#### Listy i Tabele
- `<SimpleTable skeleton={true} />`
- `<SimpleAgentList skeleton={true} />`
- `<SimpleBadgeList skeleton={true} />`
- `<SimplePriorityList skeleton={true} />`
- `<SimpleRecentList skeleton={true} />`
- `<SimpleStatusList skeleton={true} />`
- `<SimpleTimelineCard skeleton={true} />`

#### Status i Progress
- `<SimpleProgressBar skeleton={true} />`
- `<SimpleStatusCard skeleton={true} />`
- `<SimpleCategoryCards skeleton={true} />`

## Przykłady Użycia

### 1. Loading State w Dashboard

```jsx
import { useState, useEffect } from 'react';
import { SimpleKPI, SimpleAreaChart } from './components/simplified';

function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    fetchDashboardData().then(result => {
      setData(result);
      setLoading(false);
    });
  }, []);

  return (
    <div className="dashboard-grid">
      <SimpleKPI
        skeleton={loading}
        title={data?.title}
        value={data?.value}
        subtitle={data?.subtitle}
      />

      <SimpleAreaChart
        skeleton={loading}
        title={data?.chartTitle}
        data={data?.chartData}
      />
    </div>
  );
}
```

### 2. Conditional Skeleton Mode

```jsx
function Widget({ isLoading, data }) {
  return (
    <SimpleKPI
      skeleton={isLoading || !data}
      title={data?.title || 'Loading...'}
      value={data?.value || '0'}
    />
  );
}
```

### 3. Mixed States

```jsx
function Dashboard({ widgets }) {
  return (
    <div>
      {widgets.map(widget => (
        <SimpleKPI
          key={widget.id}
          skeleton={widget.loading}
          {...widget.data}
        />
      ))}
    </div>
  );
}
```

## Komponenty Skeleton

### Podstawowy Komponent

Został stworzony uniwersalny komponent `Skeleton` w `src/components/Skeleton.jsx`:

```jsx
import Skeleton from './components/Skeleton';

// Text skeleton
<Skeleton width="60%" height="14px" />

// Rectangular skeleton (dla wykresów)
<Skeleton width="100%" height="150px" variant="rectangular" />

// Circular skeleton (dla avatarów)
<Skeleton width="40px" variant="circular" />
```

### Właściwości

- **width**: Szerokość (string, np. "60%", "100px")
- **height**: Wysokość (string, np. "14px", "150px")
- **variant**: Typ szkieletu
  - `"text"` (domyślny) - zaokrąglone rogi 4px
  - `"rectangular"` - zaokrąglone rogi 8px, dla większych elementów
  - `"circular"` - okrągły (50% border-radius)
- **className**: Dodatkowe klasy CSS

## Animacja

Skeleton używa animacji shimmer (połysk przesuwający się):

```css
@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

Animacja jest automatycznie zastosowana do wszystkich elementów `.skeleton-loader`.

## Wzorce Projektowe

### Struktura Skeleton

Każdy widget skeleton zachowuje tę samą strukturę DOM co normalny widget:

```jsx
// Widget normalny
<div className="simplified-widget">
  <div className="widget-title">Total Sales</div>
  <div className="widget-value">$1,234</div>
  <div className="widget-subtitle">+12.5%</div>
</div>

// Widget skeleton
<div className="simplified-widget">
  <div className="widget-title">
    <Skeleton width="60%" height="14px" />
  </div>
  <div className="widget-value mt-4">
    <Skeleton width="80%" height="36px" />
  </div>
  <div className="mt-2">
    <Skeleton width="40%" height="14px" />
  </div>
</div>
```

### Różne Szerokości

Dla lepszego efektu wizualnego, używaj różnych szerokości:

```jsx
<Skeleton width="60%" height="14px" />  // Tytuł
<Skeleton width="80%" height="36px" />  // Wartość główna
<Skeleton width="40%" height="14px" />  // Podtytuł
```

### Wysokości

- **14px** - Normalny tekst, tytuły
- **20px** - Średni tekst
- **36px** - Duże wartości (KPI, metryki)
- **150px** - Wykresy, większe elementy
- **100%** - Pełna wysokość kontenera

## Best Practices

### ✅ Dobre Praktyki

```jsx
// 1. Używaj skeleton podczas ładowania danych
<SimpleKPI skeleton={isLoading} {...data} />

// 2. Zachowaj tę samą strukturę
if (skeleton) {
  return <SkeletonVersion />;
}
return <NormalVersion />;

// 3. Używaj różnych szerokości dla realizmu
<Skeleton width="60%" />
<Skeleton width="80%" />
<Skeleton width="40%" />
```

### ❌ Złe Praktyki

```jsx
// 1. Nie używaj skeleton jako placeholder bez danych
<SimpleKPI skeleton={!hasData} /> // Źle
<SimpleKPI skeleton={isLoading} /> // Dobrze

// 2. Nie mieszaj skeleton z prawdziwymi danymi
<SimpleKPI
  skeleton={true}
  value="123"  // To będzie zignorowane
/>

// 3. Nie używaj stałych szerokości wszędzie
<Skeleton width="100%" /> // Monotonne
<Skeleton width="100%" />
<Skeleton width="100%" />
```

## Dostosowywanie

### Zmiana Koloru

Edytuj `Skeleton.jsx`:

```jsx
backgroundColor: '#e0e0e0',  // Kolor podstawowy
background: 'linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%)',
```

### Zmiana Prędkości Animacji

Edytuj `index.css`:

```css
animation: skeleton-shimmer 1.5s ease-in-out infinite;
                           /* ↑ zmień czas */
```

### Własny Komponent Skeleton

```jsx
import Skeleton from './components/Skeleton';

function CustomWidget({ skeleton }) {
  if (skeleton) {
    return (
      <div className="my-widget">
        <Skeleton width="70%" height="20px" />
        <Skeleton width="50%" height="40px" className="mt-4" />
        <div className="flex gap-2 mt-2">
          <Skeleton width="30%" height="16px" />
          <Skeleton width="30%" height="16px" />
        </div>
      </div>
    );
  }

  return <div className="my-widget">...</div>;
}
```

## Testowanie

### Test w Przeglądarce

```javascript
// W konsoli przeglądarki
// Zmień wszystkie widgety na skeleton mode
document.querySelectorAll('.simplified-widget').forEach(widget => {
  // Dodaj klasę skeleton lub zmień props w React DevTools
});
```

### Test w Storybook (jeśli używasz)

```jsx
export const Loading = {
  args: {
    skeleton: true,
  },
};

export const WithData = {
  args: {
    skeleton: false,
    title: 'Sales',
    value: '$1,234',
  },
};
```

## API Reference

### Prop `skeleton`

**Typ**: `boolean`
**Domyślnie**: `false`
**Opis**: Włącza tryb skeleton dla widgetu

```jsx
<SimpleKPI skeleton={true} />
<SimpleKPI skeleton={false} />
<SimpleKPI />  {/* skeleton=false domyślnie */}
```

### Komponent `<Skeleton>`

```jsx
<Skeleton
  width="60%"           // Szerokość (string)
  height="14px"         // Wysokość (string)
  variant="text"        // "text" | "rectangular" | "circular"
  className="mt-4"      // Dodatkowe klasy
/>
```

## Troubleshooting

### Problem: Skeleton nie animuje się

**Rozwiązanie**: Sprawdź czy animacja jest zdefiniowana w `index.css`:

```css
@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

### Problem: Skeleton ma złą wysokość

**Rozwiązanie**: Dodaj jawną wysokość:

```jsx
<Skeleton height="14px" />  // Zamiast polegać na domyślnej
```

### Problem: Layout się przesuwa między skeleton a data

**Rozwiązanie**: Zachowaj tę samą strukturę DOM i wysokości:

```jsx
if (skeleton) {
  return (
    <div className="simplified-widget">
      <div className="widget-title">
        <Skeleton width="60%" height="14px" />
      </div>
      {/* Zachowaj te same elementy */}
    </div>
  );
}
```

## Changelog

### v1.0.0 (2025-11-28)
- ✅ Dodano skeleton mode do wszystkich 19 komponentów widgetów
- ✅ Stworzono uniwersalny komponent `Skeleton`
- ✅ Dodano animację shimmer
- ✅ Wsparcie dla 3 wariantów: text, rectangular, circular

---

**Wdrożono**: 2025-11-28
**Build**: Zbudowano w wersji production
**Status**: ✅ Gotowe do użycia
