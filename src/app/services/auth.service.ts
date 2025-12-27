import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private session$ = new BehaviorSubject<any>(null);

  constructor(private supabase: SupabaseService, private router: Router) {
    this.init();
  }

  private async init() {
    const { data } = await this.supabase.client.auth.getSession();
    this.session$.next(data.session ?? null);
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.session$.next(session ?? null);
      if (session) localStorage.setItem('sbSession', JSON.stringify(session));
      else localStorage.removeItem('sbSession');
    });
    if (data.session) localStorage.setItem('sbSession', JSON.stringify(data.session));
  }

  isAuthenticated(): boolean {
    const s = this.session$.value ?? this.loadSessionFromStorage();
    if (!s) return false;
    return !this.isTokenExpired(s.access_token);
  }

  private loadSessionFromStorage() {
    try {
      const raw = localStorage.getItem('sbSession');
      if (!raw) return null;
      const session = JSON.parse(raw);
      this.session$.next(session);
      return session;
    } catch {
      return null;
    }
  }

  getJwt(): string | null {
    const s = this.session$.value ?? this.loadSessionFromStorage();
    return s?.access_token ?? null;
  }

  async signIn(email: string, password: string) {
    const res = await this.supabase.client.auth.signInWithPassword({ email, password });
    if (res.error) throw res.error;
    if (res.data.session) {
      localStorage.setItem('sbSession', JSON.stringify(res.data.session));
      this.session$.next(res.data.session);
    }
    return res.data;
  }

  async signOut() {
    await this.supabase.client.auth.signOut();
    localStorage.removeItem('sbSession');
    this.session$.next(null);
    this.router.navigate(['/login']);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp;
      if (!exp) return true;
      return Date.now() > exp * 1000;
    } catch {
      return true;
    }
  }
}
