import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FootballService {
  private apiUrl = 'https://v3.football.api-sports.io/fixtures';
  private apiKey = '181069c8d59588ffea8d4f0d820761b2';

  constructor(private http: HttpClient) {}

  getFixturesForMonth(): Observable<any[]> {
    const today = new Date();
    const startDate = today.toISOString().split('T')[0];
    const end = new Date(today);
    end.setMonth(end.getMonth() + 1);
    const endDate = end.toISOString().split('T')[0];

    const leagues = [2, 39, 140, 135, 78, 61, 218]; // world + popular

    const requests = leagues.map(id =>
      this.http.get(`${this.apiUrl}?league=${id}&from=${startDate}&to=${endDate}`, {
        headers: { 'x-apisports-key': this.apiKey }
      })
    );

    return forkJoin(requests); // ✅ all calls in parallel
  }
}
