import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class BetService {

    private API = 'https://betlite-be.onrender.com/bets/place';

    constructor(private http: HttpClient) { }

    placeBet(userId: string, payload: any): Observable<any> {
        const headers = new HttpHeaders({
            'X-User-Id': userId
        });

        return this.http.post(this.API, payload, { headers });
    }
}
