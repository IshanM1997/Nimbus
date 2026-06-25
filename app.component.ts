import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WeatherService } from './services/weather.service';
import { WeatherData, LocationResult } from './models/weather.model';
import { Subject, debounceTime, distinctUntilChanged, takeUntil, switchMap, catchError, of } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { WeatherCardComponent } from './components/weather-card/weather-card.component';
import { ForecastTabsComponent } from './components/forecast-tabs/forecast-tabs.component';
import { WeatherDetailsComponent } from './components/weather-details/weather-details.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterOutlet,
    WeatherCardComponent,
    ForecastTabsComponent,
    WeatherDetailsComponent,
    SearchBarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  weatherData: WeatherData | null = null;
  loading = false;
  error: string | null = null;
  selectedUnit: 'metric' | 'imperial' = 'metric';
  private destroy$ = new Subject<void>();

  get backgroundClass(): string {
    if (!this.weatherData) return 'bg-default';
    return `bg-${this.weatherData.current.weather_category}`;
  }

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.loadDefaultCity();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDefaultCity(): void {
    this.fetchWeather(28.6139, 77.2090);
  }

  onLocationSelected(location: LocationResult): void {
    this.fetchWeather(location.lat, location.lon);
  }

  toggleUnit(): void {
    this.selectedUnit = this.selectedUnit === 'metric' ? 'imperial' : 'metric';
    if (this.weatherData) {
      this.fetchWeather(
        this.weatherData.location.lat,
        this.weatherData.location.lon
      );
    }
  }

  private fetchWeather(lat: number, lon: number): void {
    this.loading = true;
    this.error = null;

    this.weatherService.getForecast(lat, lon, this.selectedUnit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.weatherData = data;
          this.loading = false;
        },
        error: (err) => {
          this.error = err.message || 'Failed to fetch weather data';
          this.loading = false;
        }
      });
  }
}
