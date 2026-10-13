import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, RegisterRequest } from '../models/auth.model';

const TOKEN_KEY = 'ei_bookapp_token';

interface JwtPayload {
  roles?: string[];
  username?: string;
  exp?: number;
  iat?: number;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private tokenSignal = signal<string | null>(this.readTokenFromStorage());

  readonly isAuthenticated = computed(() => this.tokenSignal() !== null);
  readonly token = this.tokenSignal.asReadonly();

  // Rôles extraits du JWT courant (recalculés automatiquement quand le token change)
  readonly roles = computed<string[]>(() => {
    const token = this.tokenSignal();
    if (token === null) return [];
    const payload = this.decodeJwtPayload(token);
    return payload?.roles ?? [];
  });

  readonly isAdmin = computed(() => this.roles().includes('ROLE_ADMIN'));

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.storeToken(response.token))
    );
  }

  register(data: RegisterRequest): Observable<unknown> {
    return this.http.post(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.tokenSignal.set(null);
  }

  private storeToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.tokenSignal.set(token);
  }

  private readTokenFromStorage(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Décode le payload d'un JWT sans vérifier sa signature.
   * La vérification cryptographique reste la responsabilité du backend.
   * Ici on lit juste le contenu déjà validé côté serveur pour piloter l'UI.
   */
  private decodeJwtPayload(token: string): JwtPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const decoded = atob(base64);
      return JSON.parse(decoded) as JwtPayload;
    } catch {
      return null;
    }
  }
}