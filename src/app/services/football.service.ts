import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FootballService {
  constructor(private http: HttpClient) { }

  /**
   * Get upcoming fixtures from backend. Backend is responsible for contacting
   * third-party providers and keeping API keys secret.
   *
   * sport: e.g. 'football', 'basketball' — simple extensibility for other sports.
   */
  getUpcomingFixtures(sport: string = 'football'): Observable<any[]> {
    const url = `${environment.apiBase}/events/upcoming/${sport}`;
    return this.http.get<any[]>(url);
  }

}
