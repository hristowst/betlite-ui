import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FootballService {
  constructor(private readonly http: HttpClient, private readonly auth: AuthService) { }

  getUpcomingFixtures(sport: string = 'football'): Observable<any[]> {
    const url = `${environment.apiBase}/events/upcoming/${sport}`;
    const token = this.auth.getJwt();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any[]>(url, { headers });
    }
    return this.http.get<any[]>(url);
  }

  getEventMarkets(eventId: number): Observable<any> {
    const url = `${environment.apiBase}/api/v2/odds/events/${eventId}/markets`;
    const token = this.auth.getJwt();
    if (token) {
      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      return this.http.get<any>(url, { headers });
    }
    return this.http.get<any>(url);
  }

}
