import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BetService {

    private readonly API = `${environment.apiBase}/api/v2/bets/place`;

    constructor(private readonly http: HttpClient, private readonly auth: AuthService) { }

    placeBet(userId: string, payload: any): Observable<any> {
        let headers = new HttpHeaders({
            'X-User-Id': userId
        });
        const token = this.auth.getJwt();
        if (token) {
            headers = headers.set('Authorization', `Bearer ${token}`);
        }

        return this.http.post(this.API, payload, { headers });
    }
}
