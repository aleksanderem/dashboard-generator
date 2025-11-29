# Preferencje użytkownika

Preferencje użytkownika pozwalają na personalizację aplikacji - custom badge'e, motywy i ustawienia wysokości.

## Struktura preferencji

```typescript
interface UserPreferences {
  defaultBadgeText?: string;
  customBadges?: CustomBadge[];
  customThemes?: CustomTheme[];
  minHeightSettings?: MinHeightSettings;
}
```

## Custom Badges

Badge'e to kolorowe etykiety używane do kategoryzacji.

### Struktura

```typescript
interface CustomBadge {
  name: string;   // Tekst wyświetlany
  color: string;  // Kolor HEX (#RRGGBB)
}
```

### Przykład

```json
{
  "customBadges": [
    { "name": "Production", "color": "#10B981" },
    { "name": "Staging", "color": "#F59E0B" },
    { "name": "Development", "color": "#6B7280" },
    { "name": "Critical", "color": "#EF4444" }
  ]
}
```

### Domyślne badge'e

Nowi użytkownicy otrzymują:

```json
[
  { "name": "Primary", "color": "#3B82F6" },
  { "name": "Success", "color": "#10B981" },
  { "name": "Warning", "color": "#F59E0B" }
]
```

### Specjalny użytkownik

Użytkownik `aleksander@kolaboit.pl` ma predefiniowane:

```json
[
  { "name": "ITSM", "color": "#9333EA" },
  { "name": "Security", "color": "#FFCC24" },
  { "name": "Monitoring", "color": "#0078B5" },
  { "name": "AD", "color": "#C92133" },
  { "name": "UEM", "color": "#00994F" },
  { "name": "Custom", "color": "#138D8F" }
]
```

## Custom Themes

Niestandardowe motywy kolorystyczne dodawane do wbudowanych.

### Struktura

```typescript
interface CustomTheme {
  name: string;         // Unikalna nazwa
  primary: string;      // Główny kolor (#RRGGBB)
  primaryLight: string; // Jasny wariant
  primaryDark: string;  // Ciemny wariant
}
```

### Przykład

```json
{
  "customThemes": [
    {
      "name": "Corporate",
      "primary": "#1E40AF",
      "primaryLight": "#DBEAFE",
      "primaryDark": "#1E3A8A"
    },
    {
      "name": "Forest",
      "primary": "#166534",
      "primaryLight": "#BBF7D0",
      "primaryDark": "#14532D"
    }
  ]
}
```

### Dobór kolorów

Dla spójnego wyglądu:

| Wariant | Opis | Jasność |
|---------|------|---------|
| primary | Główny akcent | Średnia |
| primaryLight | Tła, hover | Jasna (90%+) |
| primaryDark | Tekst, border | Ciemna |

Narzędzia pomocne:
- [Tailwind Color Generator](https://uicolors.app/create)
- [Coolors](https://coolors.co/)

## Min Height Settings

Ustawienia minimalnej wysokości widgetów w zależności od layoutu.

### Struktura

```typescript
interface MinHeightSettings {
  cols2?: HeightSetting;    // Widget zajmuje 2 kolumny
  cols3?: HeightSetting;    // Widget zajmuje 3 kolumny
  colsMore?: HeightSetting; // Widget zajmuje 4+ kolumn
  rows1?: HeightSetting;    // Dashboard ma 1 rząd
  rows2?: HeightSetting;    // Dashboard ma 2 rzędy
  rows3?: HeightSetting;    // Dashboard ma 3 rzędy
  rowsMore?: HeightSetting; // Dashboard ma 4+ rzędów
}

interface HeightSetting {
  mode: 'auto' | 'manual';
  value: number;  // Wysokość w jednostkach (rowHeight = 30px)
}
```

### Przykład

```json
{
  "minHeightSettings": {
    "cols2": { "mode": "auto", "value": 7 },
    "cols3": { "mode": "auto", "value": 7 },
    "colsMore": { "mode": "auto", "value": 7 },
    "rows1": { "mode": "auto", "value": 7 },
    "rows2": { "mode": "manual", "value": 7 },
    "rows3": { "mode": "auto", "value": 7 },
    "rowsMore": { "mode": "auto", "value": 7 }
  }
}
```

### Tryby

- **auto** - wysokość obliczana automatycznie
- **manual** - używa wartości `value`

### Obliczanie wysokości

```
Wysokość w px = value × rowHeight + (value - 1) × margin
Wysokość w px = 7 × 30 + 6 × 16 = 210 + 96 = 306px
```

## API

### Pobieranie preferencji

```http
GET /api/user/preferences
X-Session-Key: <required>
```

```javascript
const response = await fetch('/api/user/preferences', {
  headers: { 'X-Session-Key': sessionKey }
});
const { preferences, email } = await response.json();
```

### Zapisywanie preferencji

```http
PUT /api/user/preferences
X-Session-Key: <required>
Content-Type: application/json

{
  "preferences": {
    "defaultBadgeText": "My App",
    "customBadges": [...],
    "customThemes": [...],
    "minHeightSettings": {...}
  }
}
```

## Interfejs użytkownika

### Dostęp do ustawień

1. Kliknij menu (hamburger) w prawym górnym rogu
2. Wybierz "Settings" lub "Preferences"
3. Edytuj badge'e, motywy, ustawienia wysokości
4. Zmiany zapisują się automatycznie

### Sekcje

- **Badges** - zarządzanie custom badge'ami
- **Themes** - dodawanie/edycja motywów
- **Display** - ustawienia wysokości i skeleton

## Przykłady użycia

### Dodanie nowego badge'a

```javascript
const { preferences } = await fetch('/api/user/preferences', {
  headers: { 'X-Session-Key': sessionKey }
}).then(r => r.json());

preferences.customBadges.push({
  name: 'Urgent',
  color: '#DC2626'
});

await fetch('/api/user/preferences', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Key': sessionKey
  },
  body: JSON.stringify({ preferences })
});
```

### Dodanie nowego motywu

```javascript
preferences.customThemes.push({
  name: 'Sunset',
  primary: '#F97316',
  primaryLight: '#FFEDD5',
  primaryDark: '#EA580C'
});

await savePreferences(preferences);
```

### Ustawienie minimalnej wysokości

```javascript
preferences.minHeightSettings = {
  ...preferences.minHeightSettings,
  rows2: { mode: 'manual', value: 8 }  // 8 jednostek dla 2-rzędowych layoutów
};

await savePreferences(preferences);
```

## Przechowywanie

Preferencje są przechowywane w tabeli `user_preferences`:

```sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY,
  session_key TEXT UNIQUE NOT NULL,
  preferences TEXT NOT NULL DEFAULT '{}',  -- JSON
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

Wszystkie preferencje są serializowane do JSON w jednym polu.
