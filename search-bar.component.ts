// src/app/components/search-bar/search-bar.component.ts
import {
  Component, Output, EventEmitter, OnDestroy, ChangeDetectionStrategy, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WeatherService } from '../../services/weather.service';
import { LocationResult } from '../../models/weather.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, takeUntil, catchError, of } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="search-wrap">
      <div class="search-input-row" [class.focused]="focused">
        <svg class="search-icon" width="18" height="18" fill="none" viewBox="0 0 24 24"
             stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          #inputRef
          class="search-input"
          type="text"
          [(ngModel)]="query"
          (ngModelChange)="onQueryChange($event)"
          (focus)="focused = true"
          (blur)="onBlur()"
          (keydown.enter)="submitSearch()"
          (keydown.escape)="clearSuggestions()"
          placeholder="City, district, state or country…"
          autocomplete="off"
          aria-label="Search for a location"
          [attr.aria-expanded]="suggestions().length > 0"
          role="combobox"
          aria-haspopup="listbox"
        />
        <button class="search-btn" (click)="submitSearch()" [disabled]="loading()">
          <span *ngIf="!loading()">Search</span>
          <span *ngIf="loading()" class="spinner" aria-label="Searching"></span>
        </button>
      </div>

      <div class="suggestions-dropdown" *ngIf="suggestions().length > 0" role="listbox">
        <button
          *ngFor="let loc of suggestions(); let i = index"
          class="suggestion-item"
          role="option"
          (mousedown)="selectLocation(loc)"
        >
          <span class="flag" aria-hidden="true">{{ getFlagEmoji(loc.country) }}</span>
          <div>
            <div class="loc-name">{{ loc.name }}{{ loc.state ? ', ' + loc.state : '' }}</div>
            <div class="loc-country">{{ loc.country }}</div>
          </div>
        </button>
      </div>

      <div class="search-error" *ngIf="searchError()" role="alert">
        {{ searchError() }}
      </div>
    </div>
  `,
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnDestroy {
  @Output() locationSelected = new EventEmitter<LocationResult>();

  query = '';
  focused = false;
  suggestions = signal<LocationResult[]>([]);
  loading = signal(false);
  searchError = signal<string | null>(null);

  private querySubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private weatherService: WeatherService) {
    this.querySubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      switchMap(q => {
        if (q.length < 2) { this.suggestions.set([]); return of([]); }
        this.loading.set(true);
        return this.weatherService.searchLocations(q).pipe(
          catchError(() => of([]))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(results => {
      this.suggestions.set(results);
      this.loading.set(false);
    });
  }

  onQueryChange(val: string) {
    this.searchError.set(null);
    this.querySubject.next(val.trim());
  }

  submitSearch() {
    const q = this.query.trim();
    if (!q) return;
    this.loading.set(true);
    this.weatherService.searchLocations(q).subscribe({
      next: (results) => {
        this.loading.set(false);
        if (results.length > 0) {
          this.selectLocation(results[0]);
        } else {
          this.searchError.set('Location not found. Try a different spelling.');
        }
      },
      error: () => {
        this.loading.set(false);
        this.searchError.set('Search failed. Check your connection.');
      }
    });
  }

  selectLocation(loc: LocationResult) {
    this.query = loc.display;
    this.suggestions.set([]);
    this.locationSelected.emit(loc);
  }

  clearSuggestions() { this.suggestions.set([]); }

  onBlur() {
    this.focused = false;
    setTimeout(() => this.suggestions.set([]), 200);
  }

  getFlagEmoji(code: string): string {
    if (!code || code.length !== 2) return '🌍';
    return [...code.toUpperCase()].map(c =>
      String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
    ).join('');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
