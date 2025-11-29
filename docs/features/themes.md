# Motywy kolorystyczne

Dashboard Generator obsługuje 7 wbudowanych motywów oraz niestandardowe motywy użytkownika.

## Wbudowane motywy

| Nazwa | Primary | Light | Dark |
|-------|---------|-------|------|
| **Teal** | #14B8A6 | #CCFBF1 | #0D9488 |
| **Blue** | #3B82F6 | #DBEAFE | #2563EB |
| **Purple** | #8B5CF6 | #EDE9FE | #7C3AED |
| **Orange** | #F97316 | #FFEDD5 | #EA580C |
| **Green** | #10B981 | #D1FAE5 | #059669 |
| **Red** | #EF4444 | #FEE2E2 | #DC2626 |
| **Gray** | #6B7280 | #F3F4F6 | #4B5563 |

## Zastosowanie kolorów

### Primary

Główny kolor akcentu używany dla:
- Wartości KPI
- Linii wykresów
- Pasków postępu
- Aktywnych elementów

### Primary Light

Jasny wariant dla:
- Tła highlighted elementów
- Hover states
- Subtelnych akcentów

### Primary Dark

Ciemny wariant dla:
- Tekstu na jasnym tle
- Obramowań
- Cieni

## Zmiana motywu

### W interfejsie

1. Kliknij ikonę palety kolorów
2. Wybierz motyw z listy
3. Zmiana jest natychmiastowa

### Programowo

```javascript
import { applyTheme } from './utils/themeManager';

// Zastosuj wbudowany motyw
applyTheme('blue');

// Zastosuj custom motyw
applyTheme({
  primary: '#1E40AF',
  primaryLight: '#DBEAFE',
  primaryDark: '#1E3A8A'
});
```

## CSS Variables

Motywy są aplikowane przez CSS variables:

```css
:root {
  --theme-primary: #14b8a6;
  --theme-primary-light: #ccfbf1;
  --theme-primary-dark: #0d9488;
}
```

### Użycie w komponentach

```jsx
// Przez hook
import useThemeColor from '../../hooks/useThemeColor';

function MyComponent() {
  const themeColor = useThemeColor();
  return <div style={{ color: themeColor }}>Themed text</div>;
}

// Przez CSS
.themed-element {
  color: var(--theme-primary);
  background: var(--theme-primary-light);
  border-color: var(--theme-primary-dark);
}
```

## Custom motywy

### Tworzenie

1. Otwórz ustawienia użytkownika
2. Przejdź do sekcji "Themes"
3. Kliknij "Add Theme"
4. Podaj nazwę i 3 kolory

### Struktura

```typescript
interface CustomTheme {
  name: string;         // Unikalna nazwa
  primary: string;      // #RRGGBB
  primaryLight: string; // #RRGGBB
  primaryDark: string;  // #RRGGBB
}
```

### Przykład

```json
{
  "name": "Corporate",
  "primary": "#1E40AF",
  "primaryLight": "#DBEAFE",
  "primaryDark": "#1E3A8A"
}
```

### Przechowywanie

Custom motywy są zapisywane w preferencjach użytkownika:

```javascript
// Pobierz preferencje
const { preferences } = await fetch('/api/user/preferences');

// Dodaj motyw
preferences.customThemes.push({
  name: 'Forest',
  primary: '#166534',
  primaryLight: '#BBF7D0',
  primaryDark: '#14532D'
});

// Zapisz
await fetch('/api/user/preferences', {
  method: 'PUT',
  body: JSON.stringify({ preferences })
});
```

## Predefiniowane motywy (specjalny użytkownik)

Użytkownik `aleksander@kolaboit.pl` ma predefiniowane motywy:

| Nazwa | Primary | Zastosowanie |
|-------|---------|--------------|
| ITSM | #9333EA | IT Service Management |
| Security | #FFCC24 | Bezpieczeństwo |
| Monitoring | #0078B5 | Monitoring |
| AD | #C92133 | Active Directory |
| UEM | #00994F | Endpoint Management |
| Teal | #14B8A6 | Domyślny |

## Motyw w dashboardzie

Dashboard zapisuje wybrany motyw:

```json
{
  "name": "My Dashboard",
  "theme": "blue",
  "metadata": {
    "appCategory": "security"
  }
}
```

Przy ładowaniu dashboardu motyw jest automatycznie aplikowany.

## Accessibility

Motywy są zaprojektowane z uwzględnieniem kontrastu:

- Primary na białym tle: min 4.5:1
- Tekst na Primary Light: min 4.5:1
- Primary Dark na jasnym tle: min 4.5:1

## Best practices

1. **Spójność** - używaj jednego motywu dla całego dashboardu
2. **Kontrast** - upewnij się, że tekst jest czytelny
3. **Semantyka** - czerwony dla błędów, zielony dla sukcesu
4. **Prostota** - unikaj zbyt wielu kolorów
