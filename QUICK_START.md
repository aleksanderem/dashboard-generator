# Quick Start Guide

Get your Dashboard AI Generator running in 5 minutes!

## Prerequisites
- Node.js 18+ installed
- Anthropic API key ([Sign up free](https://console.anthropic.com/))

## 1. Setup Backend (2 minutes)

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Edit .env and add your API key
nano .env  # or use any text editor
```

Add your Anthropic API key to `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxx
PORT=3001
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:5173
```

Save and close.

## 2. Setup Frontend (1 minute)

```bash
# Navigate to frontend (from project root)
cd frontend

# Install dependencies
npm install
```

## 3. Run the Application (1 minute)

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```

You should see:
```
🚀 Dashboard AI Generator API running on port 3001
📊 Ready to analyze dashboard screenshots
🎨 Claude Vision API configured: true
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```

You should see:
```
VITE vX.X.X ready in XXX ms

➜  Local:   http://localhost:5173/
```

## 4. Test the Application (1 minute)

1. Open http://localhost:5173 in your browser
2. Take a screenshot of any dashboard (Google Analytics, Analytics Plus, etc.)
3. Drag and drop the screenshot into the upload area
4. Click "Analyze & Generate"
5. Wait 5-10 seconds for AI analysis
6. See your beautiful simplified dashboard!

## Testing Without a Real Dashboard

If you don't have a dashboard screenshot, you can:
1. Google "analytics dashboard example"
2. Take a screenshot of any complex dashboard you find
3. Upload it to the app

## Common Issues

### Backend won't start
- **Check**: Is port 3001 available?
- **Fix**: Change `PORT` in `.env` to another port (e.g., 3002)

### Frontend won't start
- **Check**: Is port 5173 available?
- **Fix**: Add `--port 3000` to the dev command in `package.json`

### API key error
- **Check**: Is your API key correctly set in `backend/.env`?
- **Fix**: Copy the full key including `sk-ant-api03-` prefix

### CORS error
- **Check**: Is backend running on port 3001?
- **Fix**: Update `ALLOWED_ORIGINS` in `backend/.env`

## What's Next?

- Try different dashboard screenshots
- Test all 7 color themes
- Use Edit Mode to adjust widget positions
- Export your dashboard as PNG
- Read the full README.md for advanced features

## Sample API Test (Optional)

Test the backend directly:

```bash
# Health check
curl http://localhost:3001/api/health

# Should return:
# {"status":"ok","message":"Dashboard AI Generator API is running"}
```

## File Checklist

Before running, ensure these files exist:
- ✅ `backend/.env` (with ANTHROPIC_API_KEY)
- ✅ `backend/node_modules/` (after npm install)
- ✅ `frontend/node_modules/` (after npm install)

## Support

If you encounter issues:
1. Check the console output in both terminals
2. Check browser console (F12) for frontend errors
3. Ensure your Anthropic API key is valid
4. Restart both backend and frontend

---

**Ready to transform dashboards!** 🚀
