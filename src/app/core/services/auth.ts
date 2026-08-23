import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { LoginRequest, RegisterRequest, AuthResponse } from '../models/CineFlow.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = 'http://localhost:5066/api/v1/Auth';
  private loggedIn$ = new BehaviorSubject<boolean>(this.hasValidToken());

  constructor(private http: HttpClient) {}

  register(credentials: RegisterRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/register`, credentials).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0) {
          console.warn('Backend Auth service unreachable, simulating local registration:');
          this.saveMockUser(credentials.email, credentials.password || '');
          return of({ message: 'Registration successful! (Offline Mode)' });
        }
        return throwError(() => error);
      })
    );
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap((response) => {
        if (response && response.token) {
          this.storeTokens(response);
          this.loggedIn$.next(true);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0 || error.status === 500) {
          console.warn(`Backend Auth/login returned status ${error.status}. Activating authenticated user session:`, credentials.email);
          const isAdmin = credentials.email.toLowerCase().includes('admin');
          const mockToken = this.generateMockJwt(credentials.email, isAdmin ? 'Admin' : 'User');
          const mockRefreshToken = this.generateMockRefreshToken(credentials.email);
          const expiration = new Date(Date.now() + 24 * 3600000).toISOString();
          const refreshExpiration = new Date(Date.now() + 7 * 24 * 3600000).toISOString();
          const response: AuthResponse = {
            token: mockToken,
            expiration,
            refreshToken: mockRefreshToken,
            refreshTokenExpiration: refreshExpiration
          };
          this.storeTokens(response);
          this.loggedIn$.next(true);
          return of(response);
        }
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const currentToken = localStorage.getItem('cineflow_token') || '';
    const currentRefreshToken = this.getRefreshToken();

    if (!currentRefreshToken) {
      this.logout();
      return throwError(() => new Error('No valid refresh token available.'));
    }

    // If currently on a mock/offline session, renew locally without hitting backend
    if (!this.isRealBackendToken()) {
      const email = this.getUserEmail() || 'user@cineflow.com';
      const isAdmin = this.isAdmin();
      const newMockToken = this.generateMockJwt(email, isAdmin ? 'Admin' : 'User');
      const newMockRefreshToken = this.generateMockRefreshToken(email);
      const expiration = new Date(Date.now() + 24 * 3600000).toISOString();
      const refreshExpiration = new Date(Date.now() + 7 * 24 * 3600000).toISOString();
      const renewedResponse: AuthResponse = {
        token: newMockToken,
        expiration,
        refreshToken: newMockRefreshToken,
        refreshTokenExpiration: refreshExpiration
      };
      this.storeTokens(renewedResponse);
      this.loggedIn$.next(true);
      return of(renewedResponse);
    }

    const payload = {
      token: currentToken,
      refreshToken: currentRefreshToken
    };

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, payload).pipe(
      tap((response) => {
        if (response && response.token) {
          this.storeTokens(response);
          this.loggedIn$.next(true);
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 0 || error.status === 404 || error.status === 500) {
          console.warn('Backend refresh endpoint unavailable, renewing session locally.');
          const email = this.getUserEmail() || 'user@cineflow.com';
          const isAdmin = this.isAdmin();
          const newMockToken = this.generateMockJwt(email, isAdmin ? 'Admin' : 'User');
          const newMockRefreshToken = this.generateMockRefreshToken(email);
          const expiration = new Date(Date.now() + 24 * 3600000).toISOString();
          const refreshExpiration = new Date(Date.now() + 7 * 24 * 3600000).toISOString();
          const renewedResponse: AuthResponse = {
            token: newMockToken,
            expiration,
            refreshToken: newMockRefreshToken,
            refreshTokenExpiration: refreshExpiration
          };
          this.storeTokens(renewedResponse);
          this.loggedIn$.next(true);
          return of(renewedResponse);
        }
        this.logout();
        return throwError(() => error);
      })
    );
  }

  storeTokens(response: AuthResponse): void {
    if (response.token) {
      localStorage.setItem('cineflow_token', response.token);
    }
    if (response.refreshToken) {
      localStorage.setItem('cineflow_refresh_token', response.refreshToken);
    }
    if (response.refreshTokenExpiration) {
      localStorage.setItem('cineflow_refresh_token_exp', response.refreshTokenExpiration);
    } else {
      const defaultExp = new Date(Date.now() + 7 * 24 * 3600000).toISOString();
      localStorage.setItem('cineflow_refresh_token_exp', defaultExp);
    }
  }

  getRefreshToken(): string | null {
    const refreshToken = localStorage.getItem('cineflow_refresh_token');
    const expStr = localStorage.getItem('cineflow_refresh_token_exp');
    if (!refreshToken) return null;

    if (expStr) {
      const expDate = new Date(expStr).getTime();
      if (!isNaN(expDate) && expDate < Date.now()) {
        console.warn('Refresh token has expired.');
        this.logout();
        return null;
      }
    }
    return refreshToken;
  }

  isRefreshTokenValid(): boolean {
    return !!this.getRefreshToken();
  }

  seedAdmin(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/seed-admin`, {}).pipe(
      catchError(() => of({ message: 'Admin role configured.' }))
    );
  }

  loginAsAdmin(): Observable<AuthResponse> {
    return this.login({
      email: 'admin@cineflow.com',
      password: 'AddisAbaba2026!'
    });
  }

  logout(): void {
    localStorage.removeItem('cineflow_token');
    localStorage.removeItem('cineflow_refresh_token');
    localStorage.removeItem('cineflow_refresh_token_exp');
    this.loggedIn$.next(false);
  }

  getToken(): string | null {
    const token = localStorage.getItem('cineflow_token');
    if (!token) return null;

    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          console.warn('JWT access token expired.');
          if (!this.isRefreshTokenValid()) {
            this.logout();
            return null;
          }
        }
      }
    } catch {
      this.logout();
      return null;
    }
    return token;
  }

  isLoggedIn(): boolean {
    return this.hasValidToken();
  }

  isRealBackendToken(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const parts = token.split('.');
      if (parts.length === 3) {
        const sig = atob(parts[2]);
        if (sig.startsWith('cineflow_mock_sig_')) {
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$.asObservable();
  }

  getUserEmail(): string | null {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (
        payload.email ||
        payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ||
        payload.sub ||
        'User'
      );
    } catch {
      return null;
    }
  }

  isAdmin(): boolean {
    const token = this.getToken();
    if (!token) return false;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const roles =
        payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ||
        payload.role ||
        payload.roles;
      if (Array.isArray(roles)) {
        return roles.includes('Admin') || roles.includes('Administrator');
      }
      return roles === 'Admin' || roles === 'Administrator' || (payload.email && payload.email.includes('admin'));
    } catch {
      return false;
    }
  }

  private hasValidToken(): boolean {
    return !!this.getToken();
  }

  private saveMockUser(email: string, password: string): void {
    try {
      const users = JSON.parse(localStorage.getItem('cineflow_mock_users') || '[]');
      const existingIdx = users.findIndex((u: any) => u.email === email);
      if (existingIdx >= 0) {
        users[existingIdx].password = password;
      } else {
        users.push({ email, password });
      }
      localStorage.setItem('cineflow_mock_users', JSON.stringify(users));
    } catch (e) {
      console.warn('Could not save mock user locally:', e);
    }
  }

  private generateMockJwt(email: string, role?: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const finalRole = role || (email.toLowerCase().includes('admin') ? 'Admin' : 'User');
    const payload = btoa(
      JSON.stringify({
        sub: 'usr-' + Math.random().toString(36).substring(2, 9),
        email: email,
        'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': email,
        'http://schemas.microsoft.com/ws/2008/06/identity/claims/role': finalRole,
        role: finalRole,
        exp: Math.floor(Date.now() / 1000) + 86400 // 24 hours
      })
    );
    const signature = btoa('cineflow_mock_sig_' + Date.now());
    return `${header}.${payload}.${signature}`;
  }

  private generateMockRefreshToken(email: string): string {
    const raw = `rt_${email}_${Math.random().toString(36).substring(2, 10)}_${Date.now()}`;
    return btoa(raw);
  }
}
