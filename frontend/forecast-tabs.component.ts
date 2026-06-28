// src/app/components/forecast-tabs/forecast-tabs.component.ts
import {
  Component, Input, Output, EventEmitter,
  ChangeDetectionStrategy, OnChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DailyForecast } from '../../models/weather.model';

@Component({
  selector: 'app-forecast-tabs',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="forecast-tabs-section">
      <p class="section-eyebrow">5-Day Forecast</p>

      <!-- Tab bar -->
      <div class="tabs-nav" role="tablist" aria-label="5-day weather forecast">
        <button
          *ngFor="let day of forecast; let i = index"
          class="tab-btn"
          [class.active]="i === selectedIndex"
          (click)="select(i)"
          role="tab"
          [attr.aria-selected]="i === selectedIndex"
          [attr.id]="'tab-' + i"
          [attr.aria-controls]="'tabpanel-' + i"
        >
          <span class="tab-today" *ngIf="i === 0">Today</span>
          <span class="tab-day" *ngIf="i !== 0">{{ day.short_day }}</span>
          <img [src]="day.icon_url" [alt]="day.description" class="tab-icon" loading="lazy"/>
          <div class="tab-temps">
            <span class="t-high">{{ day.temp_max | number:'1.0-0' }}°</span>
            <span class="t-low">{{ day.temp_min | number:'1.0-0' }}°</span>
          </div>
          <div class="tab-rain" *ngIf="day.precipitation_chance >= 20">
            <span class="rain-drop">💧</span>
            <span class="rain-pct">{{ day.precipitation_chance | number:'1.0-0' }}%</span>
          </div>
        </button>
      </div>

      <!-- Active day detail panel -->
      <div
        *ngIf="selectedForecast"
        class="forecast-detail-panel"
        [attr.id]="'tabpanel-' + selectedIndex"
        role="tabpanel"
        [attr.aria-labelledby]="'tab-' + selectedIndex"
      >
        <div class="detail-top">
          <div class="detail-left">
            <h2 class="detail-day">{{ selectedForecast.day_name }}</h2>
            <p class="detail-date">{{ selectedForecast.date | date:'MMMM d, y' }}</p>
            <div class="detail-icon-row">
              <img [src]="selectedForecast.icon_url" [alt]="selectedForecast.description" class="detail-big-icon" loading="lazy"/>
              <p class="detail-condition">{{ selectedForecast.description }}</p>
            </div>
          </div>
          <div class="detail-right">
            <div class="big-temp">
              {{ selectedForecast.temp_avg | number:'1.0-0' }}<span class="temp-sym">{{ unitSymbol }}</span>
            </div>
            <div class="temp-range-row">
              <span class="t-h">↑ {{ selectedForecast.temp_max | number:'1.0-0' }}{{ unitSymbol }}</span>
              <span class="t-l">↓ {{ selectedForecast.temp_min | number:'1.0-0' }}{{ unitSymbol }}</span>
            </div>
          </div>
        </div>

        <!-- Precip bar -->
        <div class="precip-section">
          <div class="precip-row">
            <span class="precip-lbl">Precipitation chance</span>
            <span class="precip-val">{{ selectedForecast.precipitation_chance | number:'1.0-0' }}%</span>
          </div>
          <div class="precip-track">
            <div class="precip-fill" [style.width.%]="selectedForecast.precipitation_chance"></div>
          </div>
        </div>

        <!-- Stat grid -->
        <div class="detail-stats">
          <div class="d-stat" *ngFor="let s of getStats()">
            <span class="d-stat-icon" aria-hidden="true">{{ s.icon }}</span>
            <div>
              <p class="d-stat-label">{{ s.label }}</p>
              <p class="d-stat-value">{{ s.value }}<span class="d-stat-unit">{{ s.unit }}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styleUrl: './forecast-tabs.component.scss',
})
export class ForecastTabsComponent implements OnChanges {
  @Input() forecast: DailyForecast[] = [];
  @Input() unitSymbol = '°C';
  @Input() windUnit = 'km/h';
  @Output() daySelected = new EventEmitter<number>();

  selectedIndex = 0;
  selectedForecast: DailyForecast | null = null;

  ngOnChanges() {
    this.selectedIndex = 0;
    this.selectedForecast = this.forecast[0] ?? null;
  }

  select(i: number) {
    this.selectedIndex = i;
    this.selectedForecast = this.forecast[i];
    this.daySelected.emit(i);
  }

  getStats() {
    if (!this.selectedForecast) return [];
    const f = this.selectedForecast;
    return [
      { icon: '💧', label: 'Humidity',    value: f.humidity,              unit: '%'         },
      { icon: '💨', label: 'Wind',         value: Math.round(f.wind_speed), unit: this.windUnit },
      { icon: '🌡️', label: 'Feels Like',  value: Math.round(f.feels_like), unit: this.unitSymbol },
      { icon: '📊', label: 'Pressure',    value: f.pressure,              unit: ' hPa'      },
      { icon: '👁️', label: 'Visibility',  value: f.visibility,            unit: ' km'       },
      { icon: '☁️', label: 'Cloud Cover', value: '—',                     unit: ''          },
    ];
  }
}
