# Przegląd funkcji

Dashboard Generator oferuje szereg funkcji do tworzenia i zarządzania dashboardami.

## Główne funkcje

### Analiza AI

Aplikacja wykorzystuje **Claude Vision API** do analizy zrzutów ekranu:

- Automatyczne rozpoznawanie widgetów
- Wykrywanie struktury layoutu
- Identyfikacja kolorystyki
- Ocena jakości z confidence score

### Generator dashboardów

Dwa tryby generowania:

1. **Preset-based** - wybierz predefiniowany układ
2. **Bin-packing** - automatyczne optymalne rozmieszczenie

### Edytor drag-and-drop

- Zmiana pozycji widgetów przez przeciąganie
- Zmiana rozmiaru przez chwytanie rogów
- 12-kolumnowa siatka responsywna

### Eksport PNG

Renderowanie dashboardów do obrazów PNG:
- Konfigurowalna rozdzielczość
- Automatyczne miniatury przy zapisie
- API do masowego renderowania

## Funkcje szczegółowe

| Funkcja | Opis | Dokumentacja |
|---------|------|--------------|
| **Motywy** | 7 wbudowanych + custom | [themes.md](themes.md) |
| **Skeleton** | 4 tryby ładowania | [skeleton-modes.md](skeleton-modes.md) |
| **Layouty** | 12 predefiniowanych układów | [layout-presets.md](layout-presets.md) |

## Workflow użytkownika

```
┌─────────────────────────────────────────────────────────┐
│                    CREATE                                │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │   Layout    │  │   Random    │  │   Upload    │      │
│  │   Preset    │  │  Generator  │  │ Screenshot  │      │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │
│         │                │                │              │
│         └────────────────┴────────────────┘              │
│                          │                               │
│                          ▼                               │
│  ┌───────────────────────────────────────────────────┐  │
│  │                  PREVIEW                           │  │
│  │  • Theme selection                                 │  │
│  │  • Edit mode (drag & drop)                        │  │
│  │  • Skeleton mode toggle                           │  │
│  │  • Widget configuration                           │  │
│  └───────────────────────────────────────────────────┘  │
│                          │                               │
│         ┌────────────────┼────────────────┐              │
│         ▼                ▼                ▼              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │
│  │    Save     │  │   Export    │  │  Discard    │      │
│  │  Dashboard  │  │    PNG      │  │             │      │
│  └─────────────┘  └─────────────┘  └─────────────┘      │
└─────────────────────────────────────────────────────────┘
```

## Integracje

### React Grid Layout

Używamy `react-grid-layout` do:
- Responsywnego rozmieszczania widgetów
- Drag-and-drop edycji
- Automatycznego dostosowania wysokości

Konfiguracja:
```javascript
{
  cols: 12,
  rowHeight: 30,
  margin: [16, 16],
  containerPadding: [16, 16]
}
```

### Recharts

Biblioteka wykresów do:
- LineChart, AreaChart, BarChart
- PieChart (donut)
- Responsywne kontenery

### Tailwind CSS

System stylów z:
- Utility classes
- Custom components (`simplified-widget`)
- CSS variables dla motywów

## Sesje i dane

### Przechowywanie danych

| Dane | Lokalizacja | Zasięg |
|------|-------------|--------|
| Session key | localStorage | Przeglądarka |
| Dashboardy | SQLite | Serwer |
| Preferencje | SQLite (per session) | Użytkownik |
| Widget config | SQLite (per session) | Użytkownik |

### Bezpieczeństwo

- Autentykacja email-based (bez hasła)
- 256-bit session tokens
- Brak rate limiting (użytek wewnętrzny)
