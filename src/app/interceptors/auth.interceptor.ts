import type { HttpInterceptorFn } from '@angular/common/http';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, from, map, tap } from 'rxjs';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../services/user.service';
import { AuthStateService } from '../state/auth-state.service';
import type { ApiResponse as ApiResponseModel } from '../models/api-response.model';

interface JwtPayload {
  realm_access?: { roles?: string[] };
  [key: string]: any;
}

let isRefreshing = false;
let refreshQueue: Array<() => void> = [];

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const userService = inject(UserService);
  const authState = inject(AuthStateService);
  const router = inject(Router);

  const isAuthEndpoint =
    req.url.includes('/login') || req.url.includes('/register') || req.url.includes('/refresh');

  let newReq = req.clone({
    setHeaders: token && !isAuthEndpoint ? { Authorization: `Bearer ${token}` } : {},
    withCredentials: true,
  });

  return next(newReq).pipe(
    map((event: any) => {
      if (event instanceof HttpResponse && req.url.includes('/me') && event.body?.code === 1000) {
        const currentToken = localStorage.getItem('access_token');
        if (currentToken) {
          try {
            const decodedToken = jwtDecode<JwtPayload>(currentToken);
            if (decodedToken?.realm_access?.roles) {
              const modifiedBody = {
                ...event.body,
                result: { ...event.body.result, roles: decodedToken.realm_access.roles },
              };
              return event.clone({ body: modifiedBody });
            }
          } catch (e) {
            console.error('Token decode error', e);
          }
        }
      }
      return event;
    }),

    catchError((error: any) => {
      const isTokenExpired =
        (error instanceof HttpErrorResponse && error.status === 401) ||
        error?.code === 1012 ||
        error?.error?.code === 1012;

      if (isTokenExpired) {
        // --- TRƯỜNG HỢP 1: REFRESH THẤT BẠI ---
        if (req.url.includes('/refresh')) {
          isRefreshing = false;
          refreshQueue = [];

          authState.clear();

          router.navigate(['/auth/login']);
          return throwError(() => error);
        }

        // --- TRƯỜNG HỢP 2: ĐANG REFRESH ---
        if (isRefreshing) {
          return from(new Promise<void>((resolve) => refreshQueue.push(() => resolve()))).pipe(
            switchMap(() =>
              next(
                req.clone({
                  setHeaders: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                  withCredentials: true,
                })
              )
            )
          );
        }

        // --- TRƯỜNG HỢP 3: BẮT ĐẦU REFRESH ---
        isRefreshing = true;
        return userService.refresh().pipe(
          switchMap((response: ApiResponseModel<string>) => {
            localStorage.setItem('access_token', response.result);
            isRefreshing = false;
            refreshQueue.forEach((cb) => cb());
            refreshQueue = [];
            return next(
              req.clone({
                setHeaders: { Authorization: `Bearer ${response.result}` },
                withCredentials: true,
              })
            );
          }),
          catchError((refreshError) => {
            isRefreshing = false;
            refreshQueue = [];
            authState.clear();
            router.navigate(['/auth/login']);
            return throwError(() => refreshError);
          })
        );
      }
      return throwError(() => error);
    })
  );
};
