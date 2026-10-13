import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth';

// Endpoints publics : un 401 ici est une réponse métier légitime
// (mauvais mot de passe, mauvais email), pas une session expirée.
const PUBLIC_ENDPOINTS = ['/login', '/register'];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = authService.token();

  const request = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(request).pipe(
    catchError((err: HttpErrorResponse) => {
      const isPublicEndpoint = PUBLIC_ENDPOINTS.some(path => req.url.endsWith(path));

      if (err.status === 401 && !isPublicEndpoint) {
        authService.logout();
        router.navigate(['/login'], { queryParams: { sessionExpired: 'true' } });
      }

      return throwError(() => err);
    })
  );
};