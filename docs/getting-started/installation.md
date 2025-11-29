# Instalacja

## Klonowanie repozytorium

```bash
git clone <repository-url>
cd dashboard-generator
```

## Instalacja zależności

### Backend

```bash
cd backend
npm install
```

Główne zależności:
- `express` - Framework HTTP
- `better-sqlite3` - Baza danych SQLite
- `multer` - Upload plików
- `cors` - Cross-Origin Resource Sharing
- `@anthropic-ai/sdk` - Claude Vision API

### Frontend

```bash
cd frontend
npm install
```

Główne zależności:
- `react` - Framework UI
- `react-grid-layout` - Drag-and-drop grid
- `recharts` - Biblioteka wykresów
- `tailwindcss` - Style CSS
- `vite` - Bundler

## Konfiguracja środowiska

### Backend (.env)

```env
ANTHROPIC_API_KEY=your-api-key-here
PORT=3001
```

### Frontend (vite.config.js)

```javascript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3001'
    }
  }
})
```

## Uruchomienie

### Development

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm run dev
```

### Production

```bash
# Build frontend
cd frontend
npm run build

# Uruchom backend z PM2
cd backend
pm2 start server.js --name dashboard-generator-backend
```

## Weryfikacja instalacji

1. Otwórz `http://localhost:5173` (dev) lub skonfigurowany URL
2. Zaloguj się emailem
3. Sprawdź czy możesz wygenerować dashboard

## Rozwiązywanie problemów

### EACCES permission denied

```bash
# Napraw uprawnienia do plików backend
chown -R dashboards:dashboards /path/to/backend/*.js
```

### Port zajęty

```bash
# Sprawdź który proces używa portu
lsof -i :3001
```

### Błąd połączenia z bazą danych

```bash
# Sprawdź uprawnienia do pliku .db
ls -la backend/dashboards.db
chmod 644 backend/dashboards.db
```
