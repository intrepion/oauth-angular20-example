import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface LoginResponse {
  token: string;
  user?: any;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly apiUrl = 'https://your-api-url.com/api';
  private readonly tokenKey = 'access_token';

  private authState = new BehaviorSubject<boolean>(this.hasValidToken());
  public readonly isAuthenticated$ = this.authState.asObservable();

  constructor() {
    this.authState.next(this.hasValidToken());
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, { 
      username, 
      password 
    }).pipe(
      tap(response => {
        if (response.token) {
          this.setToken(response.token);
        }
      })
    );
  }

  setToken(token: string): void {
    localStorage.setItem(this.tokenKey, token);
    this.authState.next(true);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.authState.next(false);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return this.hasValidToken();
  }

  private hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }
}
