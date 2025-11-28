# Dashboard AI Generator

An AI-powered application that transforms complex dashboard screenshots into beautiful simplified dashboards using Claude Vision API.

## Quick Start

```bash
# Clone and enter project
git clone <repo-url>
cd dashboard-ai-generator

# Backend setup
cd backend
cp .env.example .env    # Then edit .env and add ANTHROPIC_API_KEY
npm install
npm start               # Runs on http://localhost:3001

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev             # Runs on http://localhost:5173
```

Open http://localhost:5173 and upload a dashboard screenshot!

---

## Overview

Upload a screenshot of any complex dashboard (e.g., Analytics Plus, Google Analytics, Tableau) and get a clean, minimal dashboard with simplified widgets automatically positioned and styled.

## Features

- **AI-Powered Analysis**: Uses Claude Vision API to analyze dashboard screenshots
- **Automatic Widget Detection**: Identifies KPIs, charts, metrics, and other components
- **Position Preservation**: Maintains the original layout structure
- **Simplified Components**: 15 beautiful minimal components (no axes, no clutter)
- **7 Color Themes**: Teal, Blue, Purple, Orange, Green, Red, Gray
- **Drag-and-Drop Layout**: Edit mode for adjusting widget positions
- **PNG Export**: Export your generated dashboard as an image

## Architecture

```
User Upload Screenshot
    ↓
Claude Vision API Analysis
    ↓
Widget Mapping (Complex → Simple)
    ↓
Layout Generation (React Grid Layout)
    ↓
Beautiful Simplified Dashboard
```

## Tech Stack

### Backend
- **Node.js** + **Express**: API server
- **Anthropic SDK**: Claude Vision API integration
- **Multer**: File upload handling

### Frontend
- **React** + **Vite**: UI framework
- **Tailwind CSS**: Styling
- **React Grid Layout**: Drag-and-drop positioning
- **Recharts**: Chart rendering
- **html-to-image**: PNG export

## Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Anthropic API key ([Get one here](https://console.anthropic.com/))

### Setup

1. **Clone/Navigate to the project**
   ```bash
   cd dashboard-ai-generator
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install

   # Create .env file
   cp .env.example .env
   # Edit .env and add your ANTHROPIC_API_KEY
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure Environment**

   Edit `backend/.env`:

   > **Note:** SQLite database (`dashboards.db`) is created automatically on first run.
   ```env
   ANTHROPIC_API_KEY=your_api_key_here
   PORT=3001
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

## Running the Application

### Development Mode

1. **Start Backend Server**
   ```bash
   cd backend
   npm start
   ```
   Server will run on http://localhost:3001

2. **Start Frontend Dev Server** (in a new terminal)
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on http://localhost:5173

3. **Open your browser** and navigate to http://localhost:5173

## Usage

### Step 1: Upload Screenshot
- Drag and drop a dashboard screenshot
- Or click "Choose File" to browse
- Supports PNG, JPG, JPEG (max 10MB)

### Step 2: Analyze & Generate
- Click "Analyze & Generate" button
- Wait for Claude Vision AI to analyze the dashboard
- Widget detection and mapping happens automatically

### Step 3: Customize & Export
- **Switch Themes**: Click the "Theme" button to try different color schemes
- **Edit Layout**: Click "Edit Layout" to drag and resize widgets
- **Export PNG**: Click "Export PNG" to download your dashboard

## Simplified Components

The app includes 15 minimal, beautiful components:

1. **SimpleKPI** - Large value with trend indicator
2. **SimpleMetricCard** - Metric with unit
3. **SimpleAreaChart** - Area chart without axes
4. **SimpleBarChart** - Bar chart without axes
5. **SimpleLineChart** - Line chart without grid
6. **SimplePieChart** - Donut chart with center value
7. **SimpleGaugeChart** - Semicircle gauge
8. **SimpleProgressBar** - Horizontal progress
9. **SimpleStatusCard** - Status indicators with icons
10. **SimpleBadgeList** - Colored tags/badges
11. **SimpleHeatmap** - Color grid
12. **SimpleScoreCard** - Score with circular progress
13. **SimpleComparisonCard** - Compare two values
14. **SimpleTimelineCard** - Event timeline
15. **SimpleTable** - Minimal data table

## API Endpoints

### `GET /api/health`
Health check endpoint
- **Response**: `{ status: 'ok', message: '...' }`

### `POST /api/analyze`
Analyze dashboard screenshot
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: `screenshot` (image file)
- **Response**:
  ```json
  {
    "success": true,
    "dashboard": {
      "layout": { "type": "grid", "columns": 3, "rows": 4 },
      "theme": "teal",
      "widgets": [...],
      "gridLayout": [...],
      "metadata": { "analyzedAt": "...", "widgetCount": 12 }
    }
  }
  ```

## Project Structure

```
dashboard-ai-generator/
├── backend/
│   ├── server.js                 # Express server
│   ├── claude-analyzer.js        # Claude Vision integration
│   ├── widget-mapper.js          # Widget type mapping
│   ├── layout-generator.js       # Layout calculation
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # Entry point
│   │   ├── index.css             # Global styles
│   │   ├── components/
│   │   │   ├── ScreenshotUploader.jsx
│   │   │   ├── DashboardPreview.jsx
│   │   │   └── simplified/       # 15 simplified components
│   │   │       ├── SimpleKPI.jsx
│   │   │       ├── SimpleAreaChart.jsx
│   │   │       └── ...
│   │   └── utils/
│   │       └── themeManager.js   # Theme management
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
└── README.md
```

## How It Works

### 1. Screenshot Upload
User uploads a complex dashboard screenshot via drag-and-drop or file picker.

### 2. Claude Vision Analysis
The backend sends the image to Claude Vision API with a detailed prompt asking for:
- Widget types (KPIs, charts, metrics, etc.)
- Positions (row, column, width, height)
- Data values and labels
- Layout structure
- Color theme

### 3. Widget Mapping
The `widget-mapper.js` module converts complex widget types to simplified components:
- `kpi_card` → `SimpleKPI`
- `line_chart` → `SimpleLineChart`
- `bar_chart` → `SimpleBarChart`
- etc.

### 4. Layout Generation
The `layout-generator.js` module calculates React Grid Layout positions:
- Converts grid positions to 12-column system
- Prevents overlaps
- Maintains relative positioning

### 5. Rendering
The frontend dynamically loads simplified components and renders them with:
- Applied theme colors
- Drag-and-drop support (edit mode)
- Export functionality

## Customization

### Adding New Simplified Components

1. Create component in `frontend/src/components/simplified/`:
   ```jsx
   export default function SimpleNewWidget({ title, ...props }) {
     return (
       <div className="simplified-widget">
         <div className="widget-title">{title}</div>
         {/* Your component */}
       </div>
     );
   }
   ```

2. Export it in `index.js`:
   ```javascript
   import SimpleNewWidget from './SimpleNewWidget';
   export const componentRegistry = {
     ...
     SimpleNewWidget,
   };
   ```

3. Add mapping in `backend/widget-mapper.js`:
   ```javascript
   const widgetTypeMapping = {
     ...
     'new_widget_type': 'SimpleNewWidget',
   };
   ```

### Adding New Themes

Edit `frontend/src/utils/themeManager.js`:
```javascript
export const themes = {
  ...
  pink: {
    name: 'Pink',
    primary: '#ec4899',
    primaryLight: '#fce7f3',
    primaryDark: '#db2777',
  },
};
```

## Troubleshooting

### Backend Issues

**Error: Invalid API key**
- Check your `backend/.env` file
- Ensure `ANTHROPIC_API_KEY` is set correctly
- Verify your API key at console.anthropic.com

**Error: Port 3001 already in use**
- Change `PORT` in `backend/.env`
- Update proxy in `frontend/vite.config.js`

### Frontend Issues

**Charts not rendering**
- Ensure `recharts` is installed: `npm install recharts`
- Check browser console for errors

**PNG export fails**
- Try a different browser (Chrome recommended)
- Check browser console for CORS issues

## Performance Tips

- Use PNG/JPG images under 5MB for faster analysis
- Claude Vision API typically responds in 3-10 seconds
- Export large dashboards in chunks if needed

## Limitations

- Maximum screenshot size: 10MB
- Claude Vision API timeout: 60 seconds
- React Grid Layout requires fixed width (1200px default)
- Export quality depends on browser rendering

## Future Enhancements

- [ ] Real-time data connections
- [ ] Dashboard templates library
- [ ] Collaborative editing
- [ ] Custom widget builder
- [ ] PDF export
- [ ] Mobile responsive layouts

## License

MIT

## Credits

- Powered by [Anthropic Claude](https://anthropic.com/)
- Built with [React](https://react.dev/), [Vite](https://vitejs.dev/), and [Tailwind CSS](https://tailwindcss.com/)
- Charts by [Recharts](https://recharts.org/)
- Layout by [React Grid Layout](https://github.com/react-grid-layout/react-grid-layout)

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Enjoy transforming complex dashboards into beautiful simplified views!** 🎨📊
