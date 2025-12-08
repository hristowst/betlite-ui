import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BetService {

    private readonly API = `${environment.apiBase}/api/v2/bets/place`;

    constructor(private readonly http: HttpClient) { }

    placeBet(userId: string, payload: any): Observable<any> {
        const headers = new HttpHeaders({
            'X-User-Id': userId
        });

        return this.http.post(this.API, payload, { headers });
    }
}
