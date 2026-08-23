import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';
import { catchError, throwError, switchMap } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();
  let authReq = req;

  // Attach token if present and valid
  if (token && authService.isRealBackendToken()) {
    authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isAuthEndpoint = req.url.includes('/Auth/login') || req.url.includes('/Auth/refresh-token') || req.url.includes('/Auth/register');

      // If protected endpoint returns 401 Unauthorized and we have a REAL valid token, attempt silent renewal via refresh token
      if (error.status === 401 && !isAuthEndpoint && authService.isRealBackendToken() && authService.isRefreshTokenValid()) {
        console.warn('Access token expired or rejected. Attempting silent renewal via refresh token...');
        return authService.refreshToken().pipe(
          switchMap((newAuth) => {
            const retryReq = req.clone({
              setHeaders: {
                Authorization: `Bearer ${newAuth.token}`
              }
            });
            return next(retryReq);
          }),
          catchError((refreshErr) => {
            console.error('Refresh token renewal failed, ending session:', refreshErr);
            authService.logout();
            return throwError(() => refreshErr);
          })
        );
      }

      return throwError(() => error);
    })
  );
};
