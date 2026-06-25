export interface LocationResult {
  name: string;
  country: string;
  state: string;
  lat: number;
  lon: number;
  display: string;
}

export interface CurrentWeather {
  temp: number;
  feels_like: number;
  temp_min: number;
  temp_max: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  wind_deg: number;
  visibility: number;
  description: string;
  icon: string;
  icon_url: string;
  weather_category: WeatherCategory;
  sunrise: number;
  sunset: number;
  uv_index: number;
  clouds: number;
}

export interface DailyForecast {
  date: string;
  day_name: string;
  short_day: string;
  temp_max: number;
  temp_min: number;
  temp_avg: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  icon_url: string;
  feels_like: number;
  pressure: number;
  visibility: number;
  precipitation_chance: number;
  weather_category: WeatherCategory;
}

export interface WeatherLocation {
  name: string;
  country: string;
  lat: number;
  lon: number;
  timezone_offset: number;
}

export interface WeatherData {
  location: WeatherLocation;
  current: CurrentWeather;
  forecast: DailyForecast[];
  units: string;
  unit_symbol: string;
  updated_at: string;
}

export type WeatherCategory =
  | 'clear'
  | 'clouds'
  | 'rain'
  | 'thunderstorm'
  | 'snow'
  | 'mist';

export interface WeatherTheme {
  category: WeatherCategory;
  gradient: string;
  overlay: string;
  textColor: string;
  accentColor: string;
  label: string;
}

export const WEATHER_THEMES: Record<WeatherCategory, WeatherTheme> = {
  clear: {
    category: 'clear',
    gradient: 'linear-gradient(135deg, #1e90ff 0%, #00bfff 40%, #87ceeb 100%)',
    overlay: 'rgba(30, 144, 255, 0.15)',
    textColor: '#ffffff',
    accentColor: '#FFD700',
    label: 'Clear Sky',
  },
  clouds: {
    category: 'clouds',
    gradient: 'linear-gradient(135deg, #4a6fa5 0%, #6b8cba 40%, #8fa8c8 100%)',
    overlay: 'rgba(74, 111, 165, 0.2)',
    textColor: '#ffffff',
    accentColor: '#c8ddf0',
    label: 'Cloudy',
  },
  rain: {
    category: 'rain',
    gradient: 'linear-gradient(135deg, #1a2a4a 0%, #2c4a6e 40%, #3d6b8c 100%)',
    overlay: 'rgba(26, 42, 74, 0.3)',
    textColor: '#e0f0ff',
    accentColor: '#7ab8d4',
    label: 'Rainy',
  },
  thunderstorm: {
    category: 'thunderstorm',
    gradient: 'linear-gradient(135deg, #0d0d1a 0%, #1a1a2e 40%, #16213e 100%)',
    overlay: 'rgba(13, 13, 26, 0.4)',
    textColor: '#d0d8e8',
    accentColor: '#7b68ee',
    label: 'Thunderstorm',
  },
  snow: {
    category: 'snow',
    gradient: 'linear-gradient(135deg, #b0c8e8 0%, #ccddf0 40%, #e8f0f8 100%)',
    overlay: 'rgba(176, 200, 232, 0.2)',
    textColor: '#1a2a4a',
    accentColor: '#4a90d9',
    label: 'Snowy',
  },
  mist: {
    category: 'mist',
    gradient: 'linear-gradient(135deg, #6b7c8f 0%, #8a9ab0 40%, #a8b8c8 100%)',
    overlay: 'rgba(107, 124, 143, 0.25)',
    textColor: '#f0f4f8',
    accentColor: '#c8d8e8',
    label: 'Misty',
  },
};
