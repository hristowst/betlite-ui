import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BetService {

    constructor(private readonly http: HttpClient, private readonly auth: AuthService) { }

    placeBet(payload: any): Observable<any> {
        let headers = new HttpHeaders({});
        const token = this.auth.getJwt();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return this.http.post(`${environment.apiBase}/api/v2/bets/place`, payload, { headers });
    }

    getPendingBets(): Observable<any[]> {
        let headers = new HttpHeaders({});
        const token = this.auth.getJwt();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.get<any[]>(`${environment.apiBase}/api/v2/bets/my/pending`, { headers: headers });
    }

    getSettledBets(): Observable<any[]> {
        let headers = new HttpHeaders({});
        const token = this.auth.getJwt();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }
        return this.http.get<any[]>(`${environment.apiBase}/api/v2/bets/my/settled`, { headers: headers });
    }
}
