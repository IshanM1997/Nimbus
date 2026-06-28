from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
import os
from datetime import datetime, timedelta
from typing import Optional
import math

app = FastAPI(title="Weather Forecast API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENWEATHER_API_KEY = os.getenv("OPENWEATHER_API_KEY", "YOUR_API_KEY_HERE")
BASE_URL = "https://api.openweathermap.org/data/2.5"
GEO_URL = "https://api.openweathermap.org/geo/1.0"


def get_weather_category(condition: str, icon: str) -> str:
    condition_lower = condition.lower()
    if any(w in condition_lower for w in ["thunder", "storm"]):
        return "thunderstorm"
    elif any(w in condition_lower for w in ["drizzle", "rain"]):
        return "rain"
    elif "snow" in condition_lower:
        return "snow"
    elif any(w in condition_lower for w in ["mist", "fog", "haze", "smoke", "dust"]):
        return "mist"
    elif any(w in condition_lower for w in ["clear", "sunny"]):
        return "clear"
    elif "cloud" in condition_lower:
        return "clouds"
    return "clear"


def format_daily_forecast(forecast_list: list) -> list:
    daily = {}
    for item in forecast_list:
        date = datetime.fromtimestamp(item["dt"]).strftime("%Y-%m-%d")
        if date not in daily:
            daily[date] = {
                "date": date,
                "day_name": datetime.fromtimestamp(item["dt"]).strftime("%A"),
                "short_day": datetime.fromtimestamp(item["dt"]).strftime("%a"),
                "temps": [],
                "humidity": [],
                "wind": [],
                "descriptions": [],
                "icons": [],
                "feels_like": [],
                "pressure": [],
                "visibility": [],
                "pop": [],
            }
        daily[date]["temps"].append(item["main"]["temp"])
        daily[date]["humidity"].append(item["main"]["humidity"])
        daily[date]["wind"].append(item["wind"]["speed"])
        daily[date]["descriptions"].append(item["weather"][0]["description"])
        daily[date]["icons"].append(item["weather"][0]["icon"])
        daily[date]["feels_like"].append(item["main"]["feels_like"])
        daily[date]["pressure"].append(item["main"]["pressure"])
        daily[date]["visibility"].append(item.get("visibility", 10000))
        daily[date]["pop"].append(item.get("pop", 0) * 100)

    result = []
    for date, data in daily.items():
        most_common_desc = max(set(data["descriptions"]), key=data["descriptions"].count)
        most_common_icon = max(set(data["icons"]), key=data["icons"].count)
        icon_base = most_common_icon.replace("n", "d")

        result.append({
            "date": data["date"],
            "day_name": data["day_name"],
            "short_day": data["short_day"],
            "temp_max": round(max(data["temps"]), 1),
            "temp_min": round(min(data["temps"]), 1),
            "temp_avg": round(sum(data["temps"]) / len(data["temps"]), 1),
            "humidity": round(sum(data["humidity"]) / len(data["humidity"])),
            "wind_speed": round(sum(data["wind"]) / len(data["wind"]), 1),
            "description": most_common_desc.title(),
            "icon": most_common_icon,
            "icon_url": f"https://openweathermap.org/img/wn/{icon_base}@2x.png",
            "feels_like": round(sum(data["feels_like"]) / len(data["feels_like"]), 1),
            "pressure": round(sum(data["pressure"]) / len(data["pressure"])),
            "visibility": round(sum(data["visibility"]) / len(data["visibility"]) / 1000, 1),
            "precipitation_chance": round(max(data["pop"])),
            "weather_category": get_weather_category(most_common_desc, most_common_icon),
        })

    return result[:5]


@app.get("/")
async def root():
    return {"message": "Weather Forecast API is running", "version": "1.0.0"}


@app.get("/api/weather/search")
async def search_location(q: str = Query(..., min_length=1)):
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{GEO_URL}/direct",
                params={"q": q, "limit": 5, "appid": OPENWEATHER_API_KEY},
                timeout=10.0
            )
            if response.status_code != 200:
                raise HTTPException(status_code=response.status_code, detail="Geocoding API error")

            locations = response.json()
            return [
                {
                    "name": loc.get("name"),
                    "country": loc.get("country"),
                    "state": loc.get("state", ""),
                    "lat": loc.get("lat"),
                    "lon": loc.get("lon"),
                    "display": f"{loc.get('name')}{', ' + loc.get('state', '') if loc.get('state') else ''}, {loc.get('country')}",
                }
                for loc in locations
            ]
        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Request timed out")


@app.get("/api/weather/forecast")
async def get_forecast(
    lat: float = Query(...),
    lon: float = Query(...),
    units: str = Query("metric", regex="^(metric|imperial)$")
):
    async with httpx.AsyncClient() as client:
        try:
            current_res = await client.get(
                f"{BASE_URL}/weather",
                params={"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY, "units": units},
                timeout=10.0
            )
            forecast_res = await client.get(
                f"{BASE_URL}/forecast",
                params={"lat": lat, "lon": lon, "appid": OPENWEATHER_API_KEY, "units": units, "cnt": 40},
                timeout=10.0
            )

            if current_res.status_code != 200:
                raise HTTPException(status_code=current_res.status_code, detail="Weather API error")

            current = current_res.json()
            forecast_data = forecast_res.json()

            daily_forecasts = format_daily_forecast(forecast_data["list"])

            weather_desc = current["weather"][0]["description"]
            weather_icon = current["weather"][0]["icon"]
            icon_base = weather_icon.replace("n", "d")

            return {
                "location": {
                    "name": current["name"],
                    "country": current["sys"]["country"],
                    "lat": lat,
                    "lon": lon,
                    "timezone_offset": current.get("timezone", 0),
                },
                "current": {
                    "temp": round(current["main"]["temp"], 1),
                    "feels_like": round(current["main"]["feels_like"], 1),
                    "temp_min": round(current["main"]["temp_min"], 1),
                    "temp_max": round(current["main"]["temp_max"], 1),
                    "humidity": current["main"]["humidity"],
                    "pressure": current["main"]["pressure"],
                    "wind_speed": round(current["wind"]["speed"], 1),
                    "wind_deg": current["wind"].get("deg", 0),
                    "visibility": round(current.get("visibility", 10000) / 1000, 1),
                    "description": weather_desc.title(),
                    "icon": weather_icon,
                    "icon_url": f"https://openweathermap.org/img/wn/{icon_base}@4x.png",
                    "weather_category": get_weather_category(weather_desc, weather_icon),
                    "sunrise": current["sys"]["sunrise"],
                    "sunset": current["sys"]["sunset"],
                    "uv_index": 0,
                    "clouds": current["clouds"]["all"],
                },
                "forecast": daily_forecasts,
                "units": units,
                "unit_symbol": "°C" if units == "metric" else "°F",
                "updated_at": datetime.utcnow().isoformat(),
            }

        except httpx.TimeoutException:
            raise HTTPException(status_code=504, detail="Request timed out")


@app.get("/api/weather/city")
async def get_weather_by_city(
    city: str = Query(..., min_length=1),
    units: str = Query("metric", regex="^(metric|imperial)^")
):
    async with httpx.AsyncClient() as client:
        geo_res = await client.get(
            f"{GEO_URL}/direct",
            params={"q": city, "limit": 1, "appid": OPENWEATHER_API_KEY},
            timeout=10.0
        )
        locations = geo_res.json()
        if not locations:
            raise HTTPException(status_code=404, detail=f"City '{city}' not found")

        loc = locations[0]
        return await get_forecast(lat=loc["lat"], lon=loc["lon"], units=units)
