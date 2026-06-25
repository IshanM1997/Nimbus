import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { WeatherData, LocationResult } from '../models/weather.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class WeatherService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  searchLocations(query: string): Observable<LocationResult[]> {
    return this.http
      .get<LocationResult[]>(`${this.apiUrl}/api/weather/search`, {
        params: new HttpParams().set('q', query),
      })
      .pipe(catchError(this.handleError));
  }

  getForecast(
    lat: number,
    lon: number,
    units: 'metric' | 'imperial' = 'metric'
  ): Observable<WeatherData> {
    return this.http
      .get<WeatherData>(`${this.apiUrl}/api/weather/forecast`, {
        params: new HttpParams()
          .set('lat', lat.toString())
          .set('lon', lon.toString())
          .set('units', units),
      })
      .pipe(catchError(this.handleError));
  }

  private handleError(error: any): Observable<never> {
    let message = 'An unexpected error occurred';
    if (error.status === 404) message = 'Location not found';
    else if (error.status === 429) message = 'Too many requests. Please wait a moment.';
    else if (error.status === 504) message = 'Request timed out. Check your connection.';
    else if (error.error?.detail) message = error.error.detail;
    return throwError(() => new Error(message));
  }
}
