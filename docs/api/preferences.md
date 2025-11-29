# Preferencje użytkownika API

Endpointy do zarządzania preferencjami użytkownika (badge'e, motywy).

## Pobierz preferencje

### GET `/api/user/preferences`

Pobiera preferencje dla aktualnej sesji.

**Wymaga:** `X-Session-Key`

**Request:**

```http
GET /api/user/preferences
X-Session-Key: a1b2c3d4e5f6...
```

**Response:**

```json
{
  "success": true,
  "preferences": {
    "defaultBadgeText": "Dashboard",
    "customBadges": [
      { "name": "ITSM", "color": "#9333EA" },
      { "name": "Security", "color": "#FFCC24" },
      { "name": "Monitoring", "color": "#0078B5" }
    ],
    "customThemes": [
      {
        "name": "ITSM",
        "primary": "#9333EA",
        "primaryLight": "#E9D5FF",
        "primaryDark": "#7E22CE"
      }
    ],
    "minHeightSettings": {
      "cols2": { "mode": "auto", "value": 7 },
      "cols3": { "mode": "auto", "value": 7 },
      "rows2": { "mode": "manual", "value": 7 }
    }
  },
  "email": "user@example.com"
}
```

## Zapisz preferencje

### PUT `/api/user/preferences`

Zapisuje preferencje dla sesji.

**Wymaga:** `X-Session-Key`

**Request:**

```http
PUT /api/user/preferences
Content-Type: application/json
X-Session-Key: a1b2c3d4e5f6...

{
  "preferences": {
    "defaultBadgeText": "My App",
    "customBadges": [
      { "name": "Production", "color": "#10B981" },
      { "name": "Staging", "color": "#F59E0B" },
      { "name": "Development", "color": "#6B7280" }
    ],
    "customThemes": [
      {
        "name": "Corporate",
        "primary": "#1E40AF",
        "primaryLight": "#DBEAFE",
        "primaryDark": "#1E3A8A"
      }
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "message": "Preferences saved",
  "session_key": "a1b2c3d4e5f6..."
}
```

## Struktura preferencji

### Preferences

```typescript
interface Preferences {
  defaultBadgeText?: string;
  customBadges?: Badge[];
  customThemes?: Theme[];
  minHeightSettings?: MinHeightSettings;
}
```

### Badge

```typescript
interface Badge {
  name: string;   // Tekst badge'a
  color: string;  // Kolor HEX (#RRGGBB)
}
```

### Theme

```typescript
interface Theme {
  name: string;         // Nazwa motywu
  primary: string;      // Główny kolor (#RRGGBB)
  primaryLight: string; // Jasny wariant
  primaryDark: string;  // Ciemny wariant
}
```

### MinHeightSettings

```typescript
interface MinHeightSettings {
  cols2?: HeightSetting;    // 2 kolumny
  cols3?: HeightSetting;    // 3 kolumny
  colsMore?: HeightSetting; // 4+ kolumn
  rows1?: HeightSetting;    // 1 rząd
  rows2?: HeightSetting;    // 2 rzędy
  rows3?: HeightSetting;    // 3 rzędy
  rowsMore?: HeightSetting; // 4+ rzędów
}

interface HeightSetting {
  mode: 'auto' | 'manual';
  value: number;  // Wysokość w jednostkach gridu (rowHeight = 30px)
}
```

## Domyślne preferencje

### Standardowy użytkownik

```json
{
  "defaultBadgeText": "Dashboard",
  "customBadges": [
    { "name": "Primary", "color": "#3B82F6" },
    { "name": "Success", "color": "#10B981" },
    { "name": "Warning", "color": "#F59E0B" }
  ],
  "customThemes": [
    {
      "name": "Ocean",
      "primary": "#0EA5E9",
      "primaryLight": "#E0F2FE",
      "primaryDark": "#0284C7"
    }
  ]
}
```

### Specjalny użytkownik (aleksander@kolaboit.pl)

```json
{
  "defaultBadgeText": "Dashboard",
  "customBadges": [
    { "name": "ITSM", "color": "#9333EA" },
    { "name": "Security", "color": "#FFCC24" },
    { "name": "Monitoring", "color": "#0078B5" },
    { "name": "AD", "color": "#C92133" },
    { "name": "UEM", "color": "#00994F" },
    { "name": "Custom", "color": "#138D8F" }
  ],
  "customThemes": [
    { "name": "ITSM", "primary": "#9333EA", "primaryLight": "#E9D5FF", "primaryDark": "#7E22CE" },
    { "name": "Security", "primary": "#FFCC24", "primaryLight": "#FEF3C7", "primaryDark": "#EAB308" },
    { "name": "Monitoring", "primary": "#0078B5", "primaryLight": "#BAE6FD", "primaryDark": "#0369A1" },
    { "name": "AD", "primary": "#C92133", "primaryLight": "#FECACA", "primaryDark": "#991B1B" },
    { "name": "UEM", "primary": "#00994F", "primaryLight": "#BBF7D0", "primaryDark": "#166534" },
    { "name": "Teal", "primary": "#14B8A6", "primaryLight": "#CCFBF1", "primaryDark": "#0D9488" }
  ]
}
```

## Wbudowane motywy

Oprócz custom themes, dostępne są wbudowane motywy:

| Nazwa | Primary | Light | Dark |
|-------|---------|-------|------|
| Teal | #14B8A6 | #CCFBF1 | #0D9488 |
| Blue | #3B82F6 | #DBEAFE | #2563EB |
| Purple | #8B5CF6 | #EDE9FE | #7C3AED |
| Orange | #F97316 | #FFEDD5 | #EA580C |
| Green | #10B981 | #D1FAE5 | #059669 |
| Red | #EF4444 | #FEE2E2 | #DC2626 |
| Gray | #6B7280 | #F3F4F6 | #4B5563 |

## Przykład użycia

```javascript
// Pobierz preferencje
const prefResponse = await fetch('/api/user/preferences', {
  headers: { 'X-Session-Key': sessionKey }
});
const { preferences } = await prefResponse.json();

// Dodaj nowy badge
preferences.customBadges.push({
  name: 'Urgent',
  color: '#DC2626'
});

// Dodaj nowy motyw
preferences.customThemes.push({
  name: 'Forest',
  primary: '#166534',
  primaryLight: '#BBF7D0',
  primaryDark: '#14532D'
});

// Zapisz zmiany
await fetch('/api/user/preferences', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Key': sessionKey
  },
  body: JSON.stringify({ preferences })
});
```

## Zastosowanie preferencji

### Badge'e

Badge'e są używane do:
- Tagowania dashboardów
- Kategoryzacji widgetów
- Oznaczania statusów

### Motywy

Motywy custom są dodawane do listy dostępnych motywów w selektorze.
Kolory są aplikowane poprzez CSS variables:

```css
:root {
  --theme-primary: <primary>;
  --theme-primary-light: <primaryLight>;
  --theme-primary-dark: <primaryDark>;
}
```

### Min Height Settings

Ustawienia wysokości wpływają na minimalną wysokość widgetów w zależności od:
- Liczby kolumn widgetu
- Liczby rzędów w layoucie
