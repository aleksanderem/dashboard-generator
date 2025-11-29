# Tryby skeleton

Skeleton loading to technika UX pokazująca placeholder podczas ładowania danych. Dashboard Generator oferuje 4 tryby skeleton.

## Tryby

### Off (`false`)

Normalne wyświetlanie - wszystkie dane widoczne.

```jsx
<SimpleKPI title="Users" value="1,234" skeleton={false} />
```

```
┌────────────────────┐
│ USERS              │
│                    │
│ 1,234              │
│ +12% from last week│
└────────────────────┘
```

### Title Only (`'title'`)

Skeleton tylko na tytule widgetu.

```jsx
<SimpleKPI title="Users" value="1,234" skeleton="title" />
```

```
┌────────────────────┐
│ ████████           │  <- skeleton
│                    │
│ 1,234              │  <- normalne
│ +12% from last week│  <- normalne
└────────────────────┘
```

### Semi (`'semi'`)

Skeleton na tytule i podtytule, dane główne widoczne.

```jsx
<SimpleKPI title="Users" value="1,234" skeleton="semi" />
```

```
┌────────────────────┐
│ ████████           │  <- skeleton
│                    │
│ 1,234              │  <- normalne
│ ██████████████     │  <- skeleton
└────────────────────┘
```

### Full (`'full'`)

Pełny skeleton - wszystko jako placeholder.

```jsx
<SimpleKPI title="Users" value="1,234" skeleton="full" />
```

```
┌────────────────────┐
│ ████████           │  <- skeleton
│                    │
│ ██████             │  <- skeleton
│ ██████████████     │  <- skeleton
└────────────────────┘
```

## Implementacja w widgetach

Każdy widget implementuje logikę skeleton:

```jsx
export default function SimpleKPI({ title, value, subtitle, skeleton = false }) {
  // Określ które elementy pokazać jako skeleton
  const showTitleSkeleton = skeleton === 'title' || skeleton === 'semi' ||
                            skeleton === 'full' || skeleton === true;
  const showTextSkeleton = skeleton === 'semi' || skeleton === 'full';
  const showDataSkeleton = skeleton === 'full';

  return (
    <div className="simplified-widget">
      {/* Tytuł */}
      <div className="widget-title">
        {showTitleSkeleton ? <Skeleton width="60%" height="14px" /> : title}
      </div>

      {/* Wartość główna */}
      <div className="widget-value">
        {showDataSkeleton ? <Skeleton width="80px" height="36px" /> : value}
      </div>

      {/* Podtytuł */}
      <div className="widget-subtitle">
        {showTextSkeleton ? <Skeleton width="100px" height="14px" /> : subtitle}
      </div>
    </div>
  );
}
```

## Komponent Skeleton

```jsx
// components/Skeleton.jsx
export default function Skeleton({ width, height }) {
  return (
    <div
      className="skeleton-loader animate-pulse"
      style={{
        width: width || '100%',
        height: height || '1em',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px'
      }}
    />
  );
}
```

## Animacja

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.skeleton-loader {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Ustawianie trybu skeleton

### Globalnie (dla wszystkich widgetów)

W ustawieniach Display:

1. **Off** - `showSkeletonMode: false`, `skeletonTitlesOnly: false`
2. **Titles Only** - `showSkeletonMode: false`, `skeletonTitlesOnly: true`
3. **Full** - `showSkeletonMode: true`, `skeletonTitlesOnly: false`

### Per widget (konfiguracja)

W Widget Settings:

```javascript
// Przez API
await fetch('/api/widgets/config', {
  method: 'PUT',
  headers: { 'X-Session-Key': sessionKey },
  body: JSON.stringify({
    config: {
      'SimpleKPI': { skeletonMode: 'title' },
      'SimpleTable': { skeletonMode: 'full' }
    }
  })
});
```

### Per widget (inline)

Bezpośrednio w props widgetu:

```jsx
<SimpleKPI skeleton="semi" {...otherProps} />
```

## Priorytet ustawień

1. **Widget props** - najwyższy priorytet
2. **Widget config** (per session)
3. **Global skeleton mode**
4. **Default** (`false`)

```javascript
// Logika w DashboardPreview.jsx
let widgetSkeletonMode;

if (widgetData.props?.skeletonMode && widgetData.props.skeletonMode !== 'none') {
  // Z props widgetu
  widgetSkeletonMode = widgetData.props.skeletonMode;
} else if (widgetData.props?.skeletonOverride !== undefined) {
  // Override per widget
  widgetSkeletonMode = widgetData.props.skeletonOverride ? 'semi' : false;
} else if (skeletonTitlesOnly) {
  // Globalny tryb titles only
  widgetSkeletonMode = 'title';
} else if (showSkeletonMode) {
  // Globalny tryb full
  widgetSkeletonMode = 'semi';
} else {
  // Domyślnie wyłączony
  widgetSkeletonMode = false;
}
```

## Use cases

### Mockupy / Prototypy

Użyj `skeleton="full"` aby pokazać strukturę bez rzeczywistych danych.

### Prezentacje

Użyj `skeleton="title"` aby ukryć nazwy metryki zachowując dane.

### Loading states

Użyj `skeleton="semi"` podczas ładowania danych z API.

### Demo

Kombinuj różne tryby dla różnych widgetów w celach demonstracyjnych.

## Wykresy

Dla wykresów, `skeleton="full"` ukrywa cały wykres:

```jsx
{showDataSkeleton ? (
  <Skeleton width="100%" height={200} />
) : (
  <ResponsiveContainer>
    <LineChart data={data}>...</LineChart>
  </ResponsiveContainer>
)}
```
