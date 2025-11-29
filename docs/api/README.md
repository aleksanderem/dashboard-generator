# API Reference

Backend Dashboard Generator udostępnia REST API do wszystkich operacji.

## Base URL

```
http://localhost:3001/api
```

## Autentykacja

Większość endpointów wymaga nagłówka `X-Session-Key`:

```http
X-Session-Key: <64-znakowy-token-hex>
```

Token otrzymujesz po zalogowaniu przez `/api/auth/login`.

## Endpointy

### Autentykacja

| Metoda | Endpoint | Opis |
|--------|----------|------|
| POST | `/auth/login` | Logowanie/rejestracja emailem |
| GET | `/auth/me` | Informacje o sesji |

### Dashboardy

| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | `/dashboards` | Lista wszystkich dashboardów |
| POST | `/dashboards` | Zapisz nowy dashboard |
| GET | `/dashboards/:id` | Pobierz dashboard |
| PUT | `/dashboards/:id` | Aktualizuj dashboard |
| DELETE | `/dashboards/:id` | Usuń dashboard |
| GET | `/dashboards/:id/thumbnail` | Pobierz URL miniatury |
| GET | `/dashboards/:id/thumbnail.png` | Pobierz miniaturę jako PNG |

### Generowanie

| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | `/layouts` | Lista layout presets |
| POST | `/generate` | Generuj z presetu |
| POST | `/generate/packed` | Generuj z bin-packing |

### Analiza i renderowanie

| Metoda | Endpoint | Opis |
|--------|----------|------|
| POST | `/analyze` | Analizuj zrzut ekranu |
| POST | `/render-dashboard` | Renderuj do PNG |
| POST | `/screenshot-to-dashboard` | Analiza + render w jednym |

### Konfiguracja

| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | `/widgets/config` | Pobierz konfigurację widgetów |
| PUT | `/widgets/config` | Zapisz konfigurację widgetów |
| GET | `/user/preferences` | Pobierz preferencje |
| PUT | `/user/preferences` | Zapisz preferencje |

### System

| Metoda | Endpoint | Opis |
|--------|----------|------|
| GET | `/health` | Health check |
| GET | `/session/stats` | Statystyki sesji |

## Odpowiedzi

### Sukces

```json
{
  "success": true,
  "data": { ... }
}
```

### Błąd

```json
{
  "success": false,
  "error": "Opis błędu"
}
```

## Rate limiting

Brak limitów - aplikacja przeznaczona do użytku wewnętrznego.

## Następne sekcje

- [Autentykacja](authentication.md)
- [Dashboardy](dashboards.md)
- [Generowanie](generation.md)
- [Renderowanie](rendering.md)
- [Widgety](widgets.md)
- [Preferencje](preferences.md)
