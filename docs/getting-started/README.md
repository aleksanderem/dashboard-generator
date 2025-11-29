# Rozpoczęcie pracy

Ta sekcja pomoże Ci rozpocząć pracę z Dashboard Generator.

## Wymagania systemowe

- **Node.js** 18.x lub nowszy
- **npm** 9.x lub nowszy
- **SQLite3** (wbudowany w Node.js)

## Struktura projektu

```
dashboard-generator/
├── frontend/                 # Aplikacja React
│   ├── src/
│   │   ├── components/       # Komponenty UI
│   │   │   ├── simplified/   # Widgety dashboardowe
│   │   │   ├── App.jsx       # Główny komponent
│   │   │   └── DashboardPreview.jsx
│   │   ├── utils/            # Narzędzia
│   │   │   ├── sessionManager.js
│   │   │   ├── themeManager.js
│   │   │   └── api.js
│   │   └── hooks/            # Custom hooks
│   ├── package.json
│   └── vite.config.js
├── backend/                  # Serwer Express
│   ├── server.js             # Główny plik serwera
│   ├── database.js           # Obsługa SQLite
│   ├── random-generator.js   # Generator dashboardów
│   ├── widget-mapper.js      # Mapowanie widgetów
│   └── dashboards.db         # Baza danych SQLite
└── docs/                     # Dokumentacja
```

## Następne kroki

- [Instalacja](installation.md) - Jak zainstalować projekt
- [Szybki start](quick-start.md) - Pierwsze kroki z aplikacją
