# 🌤️ Nimbus — 5-Day Weather Forecast App

A professional Angular 18 + Python (FastAPI) weather application with dynamic backgrounds, 5-day forecasts, and real-time search.

---

## ✨ Features

- 🔍 **Smart search** — city, district, state, or country with auto-suggestions
- 🎨 **Dynamic theming** — background changes based on weather conditions (clear, cloudy, rain, storm, snow, mist)
- 📅 **5-day tabbed forecast** — clickable day tabs with detailed stats per day
- 🌡️ **Metric / Imperial** toggle (°C / °F)
- 💧 Humidity, wind speed, visibility, pressure, feels-like temperature
- 🌅 Sunrise & sunset times
- 🌧️ Precipitation chance with visual bar
- 📱 Fully responsive — mobile to desktop

---

## 🏗️ Project Structure

```
weather-app/
├── backend/
│   ├── main.py              # FastAPI app with weather & geocoding endpoints
│   ├── requirements.txt     # Python dependencies
│   └── .env.example         # Environment variable template
├── frontend-src/            # Angular source files
│   ├── app.component.ts     # Root component
│   ├── weather.model.ts     # TypeScript interfaces & theme config
│   ├── weather.service.ts   # HTTP service (Angular)
│   ├── search-bar.component.ts
│   ├── forecast-tabs.component.ts
│   ├── environments.ts      # Environment config
│   └── index.html           # Standalone demo (works without Angular build)
├── package.json             # Angular project config
└── proxy.conf.json          # Angular dev proxy
```

---

## 🚀 Quick Start

### 1. Get an API Key

Sign up at [openweathermap.org](https://openweathermap.org/api) (free tier is sufficient).

---

### 2. Backend Setup (Python FastAPI)

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set your API key
cp .env.example .env
# Edit .env and set: OPENWEATHER_API_KEY=your_key_here

# Start the server
uvicorn main:app --reload --port 8000
```

API will be available at `http://localhost:8000`
Interactive docs at `http://localhost:8000/docs`

---

### 3. Frontend Setup (Angular 18)

**Option A — Angular CLI (recommended)**

```bash
# Install Angular CLI globally
npm install -g @angular/cli@18

# Create new Angular project
ng new nimbus-weather --routing=false --style=scss --standalone

# Copy the frontend-src files into src/app/
# Then install and run:
npm install
ng serve --proxy-config proxy.conf.json
```

**Option B — Standalone HTML (zero setup, instant demo)**

Simply open `frontend-src/index.html` in a browser.
The app will attempt to connect to the backend at `http://localhost:8000`.

---

### 4. Angular Project Layout

Place files under `src/app/` following this structure:

```
src/
├── app/
│   ├── app.component.ts / .html / .scss
│   ├── models/
│   │   └── weather.model.ts
│   ├── services/
│   │   └── weather.service.ts
│   └── components/
│       ├── search-bar/
│       ├── weather-card/
│       ├── forecast-tabs/
│       └── weather-details/
└── environments/
    ├── environment.ts
    └── environment.prod.ts
```

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/weather/search?q={query}` | Search locations (returns up to 5 matches) |
| `GET` | `/api/weather/forecast?lat=&lon=&units=` | Get 5-day forecast by coordinates |
| `GET` | `/api/weather/city?city=&units=` | Get forecast by city name |
| `GET` | `/docs` | Swagger interactive API docs |

**Units:** `metric` (°C, km/h) or `imperial` (°F, mph)

---

## 🎨 Weather Themes

| Condition | Background |
|-----------|-----------|
| ☀️ Clear | Bright sky blues |
| ☁️ Cloudy | Steel grey-blues |
| 🌧️ Rain | Deep navy-slate |
| ⛈️ Thunderstorm | Near-black indigo |
| ❄️ Snow | Soft ice whites |
| 🌫️ Mist | Muted blue-greys |

---

## 🔧 Configuration

### Backend environment variables (`.env`)

```env
OPENWEATHER_API_KEY=your_key_here
```

### Angular environments (`src/environments/environment.ts`)

```ts
export const environment = {
  production: false,
  apiUrl: '',  // empty string uses Angular proxy in development
};
```

For production, set `apiUrl` to your deployed backend URL.

---

## 🚢 Production Deployment

**Backend:** Deploy on Railway, Render, or Fly.io
```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

**Frontend:** Build and serve static files
```bash
ng build --configuration production
# Output in dist/nimbus-weather/ — deploy to Vercel, Netlify, or S3
```

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 18, TypeScript, SCSS |
| Backend | Python 3.12, FastAPI, Uvicorn |
| HTTP Client | httpx (async) |
| Weather Data | OpenWeatherMap API (free tier) |
| Geocoding | OpenWeatherMap Geo API |

---

## 📝 License

MIT
