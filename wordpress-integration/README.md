# Dashboard Generator - WordPress Integration

Integracja pozwalająca osadzić Dashboard Generator w WordPressie jako iframe z możliwością pobierania wygenerowanych obrazów do biblioteki mediów.

## Instalacja

### 1. Skopiuj pliki pluginu do WordPressa

Skopiuj cały folder `wordpress-integration` do `wp-content/plugins/dashboard-generator-wp/`:

```
wp-content/plugins/dashboard-generator-wp/
├── dashboard-generator-wp.php
├── dashboard-generator-integration.js
└── README.md
```

### 2. Aktywuj plugin

W panelu admina WordPress: **Wtyczki → Zainstalowane wtyczki → Dashboard Generator Integration → Aktywuj**

## Użycie

### Podstawowy shortcode

```
[dashboard_generator]
```

### Shortcode z parametrami

```
[dashboard_generator width="100%" height="900px" theme="security" preset="3+3" show_controls="true"]
```

**Dostępne parametry:**

| Parametr | Domyślnie | Opis |
|----------|-----------|------|
| `width` | 100% | Szerokość iframe |
| `height` | 800px | Wysokość iframe |
| `theme` | (brak) | Motyw: security, itsm, monitoring, ad, uem, teal |
| `preset` | 3+3 | Layout: 2+2, 3+3, 4+4, 3+1, 1+3, etc. |
| `skeleton` | false | Tryb szkieletowy (true/false) |
| `show_controls` | true | Pokazuj przyciski WP (true/false) |

## Jak to działa

1. **Iframe** - Dashboard Generator ładuje się w iframe z parametrem `embedMode=wordpress`
2. **postMessage** - Komunikacja między iframe a WordPressem przez Window.postMessage
3. **Przycisk "Wyślij do WordPress"** - W dashboardzie pojawia się nowy przycisk
4. **REST API** - WordPress przyjmuje obraz przez `/wp-json/dashboard-generator/v1/save-image`
5. **Media Library** - Obraz jest zapisywany w bibliotece mediów WP

## Przepływ pracy

1. Użytkownik edytuje dashboard w iframe
2. Klika "Regeneruj" (opcjonalnie) - generuje nowy dashboard
3. Klika "Wyślij do WordPress" w dashboardzie LUB "Zapisz obraz do biblioteki" w WP
4. Obraz jest automatycznie zapisywany do biblioteki mediów
5. URL jest kopiowany do schowka

## Komunikaty postMessage

### Od Dashboard Generator do WordPressa:

```javascript
// Dashboard gotowy
{ type: 'DASHBOARD_READY', payload: { dashboardId, widgetCount, theme } }

// Obraz wygenerowany
{ type: 'DASHBOARD_IMAGE_READY', payload: { imageData, dashboardId, dashboardName, theme, timestamp } }

// Status
{ type: 'DASHBOARD_STATUS', payload: { ready, dashboardId, widgetCount, theme } }
```

### Od WordPressa do Dashboard Generator:

```javascript
// Regeneruj dashboard
{ type: 'REGENERATE_DASHBOARD', payload: { preset: '3+3' } }

// Eksportuj i wyślij
{ type: 'EXPORT_AND_SEND', payload: {} }

// Pobierz status
{ type: 'GET_STATUS', payload: {} }
```

## REST API Endpoint

```
POST /wp-json/dashboard-generator/v1/save-image

Body:
{
  "imageData": "data:image/png;base64,...",
  "filename": "dashboard-123.png",
  "dashboardName": "Security Dashboard"
}

Response:
{
  "success": true,
  "attachmentId": 456,
  "url": "https://example.com/wp-content/uploads/2024/12/dashboard-123.png",
  "filename": "dashboard-123.png",
  "message": "Image saved to Media Library"
}
```

## Uprawnienia

Domyślnie endpoint REST API jest dostępny dla wszystkich (dla uproszczenia).

Aby ograniczyć do zalogowanych użytkowników z uprawnieniem `upload_files`, zmień w `dashboard-generator-wp.php`:

```php
public function check_permissions() {
    return current_user_can('upload_files');
}
```

## Testowanie

1. Otwórz stronę z shortcode `[dashboard_generator]`
2. Poczekaj aż dashboard się załaduje
3. Kliknij "Wyślij do WordPress" w dashboardzie
4. Powinieneś zobaczyć podgląd obrazu i status "Obraz otrzymany"
5. Kliknij "Zapisz obraz do biblioteki"
6. Sprawdź bibliotekę mediów - obraz powinien tam być

## Rozwiązywanie problemów

### Iframe się nie ładuje
- Sprawdź czy domeny są dodane do CORS w `.env` backendu
- Sprawdź Content-Security-Policy w nginx

### Obraz się nie zapisuje
- Sprawdź czy folder `wp-content/uploads` ma prawa zapisu
- Sprawdź konsolę przeglądarki na błędy
- Sprawdź czy nonce jest poprawny (zaloguj się do WP)

### Komunikacja nie działa
- Otwórz DevTools → Console i sprawdź logi `[DG-WP]`
- Sprawdź czy iframe ma poprawny URL z `embedMode=wordpress`
