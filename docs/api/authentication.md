# Autentykacja

Aplikacja używa prostego systemu autentykacji opartego na emailu. Nie wymaga hasła - identyfikacja odbywa się przez adres email.

## Logowanie

### POST `/api/auth/login`

Loguje użytkownika lub tworzy nowe konto jeśli email nie istnieje.

**Request:**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com"
}
```

**Response (sukces):**

```json
{
  "success": true,
  "session": {
    "email": "user@example.com",
    "session_key": "a1b2c3d4e5f6...",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "is_new": false
}
```

**Pola odpowiedzi:**

| Pole | Typ | Opis |
|------|-----|------|
| `session.email` | string | Adres email użytkownika |
| `session.session_key` | string | 64-znakowy token sesji (hex) |
| `session.created_at` | string | Data utworzenia sesji (ISO 8601) |
| `is_new` | boolean | `true` jeśli to nowy użytkownik |

**Response (błąd):**

```json
{
  "success": false,
  "error": "Email is required"
}
```

## Informacje o sesji

### GET `/api/auth/me`

Pobiera informacje o aktualnej sesji.

**Request:**

```http
GET /api/auth/me
X-Session-Key: a1b2c3d4e5f6...
```

**Response:**

```json
{
  "success": true,
  "session": {
    "email": "user@example.com",
    "session_key": "a1b2c3d4e5f6...",
    "created_at": "2024-01-15T10:30:00.000Z"
  }
}
```

**Response (nieprawidłowa sesja):**

```json
{
  "success": false,
  "error": "Invalid or expired session"
}
```

## Używanie sesji

Po zalogowaniu, używaj tokena sesji w nagłówku `X-Session-Key`:

```http
GET /api/dashboards
X-Session-Key: a1b2c3d4e5f6...
```

### Endpointy wymagające sesji

- `POST /api/generate` - Generowanie dashboardów
- `POST /api/generate/packed` - Generowanie z bin-packing
- `PUT /api/widgets/config` - Zapisywanie konfiguracji widgetów
- `GET /api/user/preferences` - Pobieranie preferencji
- `PUT /api/user/preferences` - Zapisywanie preferencji

### Endpointy opcjonalnie używające sesji

- `GET /api/widgets/config` - Zwraca konfigurację sesji lub domyślną
- `POST /api/dashboards` - Wiąże dashboard z sesją

## Przechowywanie tokena

Frontend przechowuje token w `localStorage`:

```javascript
// Zapisz
localStorage.setItem('sessionKey', sessionKey);

// Pobierz
const sessionKey = localStorage.getItem('sessionKey');
```

## Bezpieczeństwo

- Token sesji jest generowany jako 64 znaki hex (256 bitów entropii)
- Sesje nie wygasają automatycznie
- Brak mechanizmu odświeżania tokenów
- Zalecane dla środowisk wewnętrznych/zaufanych

## Przykład w JavaScript

```javascript
// Logowanie
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com' })
});
const { session } = await loginResponse.json();
localStorage.setItem('sessionKey', session.session_key);

// Użycie sesji
const dashboards = await fetch('/api/dashboards', {
  headers: { 'X-Session-Key': session.session_key }
});
```
