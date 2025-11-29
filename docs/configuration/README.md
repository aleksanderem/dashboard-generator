# Przegląd konfiguracji

Dashboard Generator oferuje dwupoziomową konfigurację: widgetów i preferencji użytkownika.

## Typy konfiguracji

| Typ | Zakres | Przechowywanie | API |
|-----|--------|----------------|-----|
| Widget Config | Per widget type, per session | SQLite | `/api/widgets/config` |
| User Preferences | Per session | SQLite | `/api/user/preferences` |

## Widget Configuration

Konfiguracja każdego typu widgetu:

- **skeletonMode** - tryb wyświetlania skeleton
- **minColumns** - minimalna szerokość w siatce
- **availableInRandom** - uwzględniaj w generatorze losowym

[Szczegóły →](widget-config.md)

## User Preferences

Preferencje użytkownika:

- **customBadges** - niestandardowe badge'e
- **customThemes** - niestandardowe motywy kolorystyczne
- **minHeightSettings** - ustawienia wysokości widgetów

[Szczegóły →](user-preferences.md)

## Hierarchia ustawień

```
┌─────────────────────────────────────────┐
│          Global Defaults                │
│  (hardcoded w random-generator.js)      │
└───────────────────┬─────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         Session Widget Config           │
│    (SQLite: widget_configs table)       │
└───────────────────┬─────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│          Widget Props Override          │
│      (inline w dashboard data)          │
└─────────────────────────────────────────┘
```

## Dostęp do konfiguracji

### Frontend

```javascript
import { getWidgetConfig, getUserPreferences } from './utils/sessionManager';

// Pobierz konfigurację widgetów
const config = await getWidgetConfig();
console.log(config.SimpleKPI.skeletonMode); // 'semi'

// Pobierz preferencje
const prefs = await getUserPreferences();
console.log(prefs.customThemes); // [{name: 'ITSM', ...}]
```

### Backend

```javascript
// server.js
const { getWidgetConfigs } = require('./widget-config');

app.post('/api/generate', (req, res) => {
  const sessionWidgetConfig = getWidgetConfigs(req.sessionKey);
  // Użyj config przy generowaniu
});
```

## Sesja wymagana

Większość operacji konfiguracyjnych wymaga sesji:

```http
X-Session-Key: a1b2c3d4e5f6...
```

Bez sesji:
- `GET /api/widgets/config` - zwraca domyślną konfigurację
- `PUT /api/widgets/config` - błąd 401
- `GET /api/user/preferences` - błąd 401
- `PUT /api/user/preferences` - błąd 401

## Resetowanie do domyślnych

Obecnie brak dedykowanego endpointa do resetu. Aby zresetować:

```javascript
// Pobierz domyślną konfigurację (bez sesji)
const defaultConfig = await fetch('/api/widgets/config').then(r => r.json());

// Zapisz jako aktualną
await fetch('/api/widgets/config', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'X-Session-Key': sessionKey
  },
  body: JSON.stringify({ config: defaultConfig.config })
});
```

## Migracja danych

Przy aktualizacji aplikacji, nowe typy widgetów automatycznie otrzymują domyślną konfigurację. Istniejące konfiguracje są zachowane.
