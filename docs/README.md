# Dashboard Generator

Dashboard Generator to aplikacja do tworzenia, analizy i zarządzania dashboardami. Wykorzystuje AI (Claude Vision) do analizy zrzutów ekranu i automatycznego generowania uproszczonych widgetów.

## Kluczowe funkcje

- **Analiza AI** - Automatyczne rozpoznawanie widgetów ze zrzutów ekranu dashboardów
- **20 typów widgetów** - KPI, wykresy, tabele, listy i wiele innych
- **Generator losowy** - Tworzenie dashboardów z predefiniowanych layoutów
- **7 motywów kolorystycznych** - Teal, Blue, Purple, Orange, Green, Red, Gray
- **Tryby skeleton** - Różne stany ładowania dla lepszego UX
- **Eksport PNG** - Renderowanie dashboardów do obrazów

## Architektura

```
dashboard-generator/
├── frontend/          # React + Vite + Tailwind
│   └── src/
│       ├── components/
│       │   └── simplified/  # 20 widgetów
│       └── utils/
├── backend/           # Node.js + Express
│   ├── server.js      # API endpoints
│   ├── database.js    # SQLite
│   └── random-generator.js
└── docs/              # Ta dokumentacja
```

## Szybki start

1. Zaloguj się emailem
2. Wybierz "Create" aby wygenerować nowy dashboard
3. Wybierz layout preset lub użyj "Generate Random"
4. Dostosuj widgety i motywy
5. Zapisz lub eksportuj jako PNG

## Nawigacja

- [Rozpoczęcie pracy](getting-started/) - Instalacja i konfiguracja
- [API Reference](api/) - Dokumentacja endpointów
- [Widgety](widgets/) - Wszystkie typy widgetów
- [Funkcje](features/) - Motywy, skeleton, layouty
- [Konfiguracja](configuration/) - Ustawienia użytkownika
- [Baza danych](database/) - Schemat SQLite
