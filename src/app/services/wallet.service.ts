import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WalletService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  async getMyProfile(): Promise<{ id: string; balance: number } | null> {
    const token = this.auth.getJwt();
    if (!token) return null;

    const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
    const resp$ = this.http.get<{ id: string; balance: number }>(`${environment.apiBase}/api/v2/me`, { headers });
    return firstValueFrom(resp$);
  }
}
