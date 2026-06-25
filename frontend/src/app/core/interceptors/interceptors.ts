// =============================================================
// FILE: core/interceptors/interceptors.ts
// PURPOSE: Error + Loading interceptors في ملف واحد
//
// DESIGN DECISION:
// دمجناهم في ملف واحد عشان نتجنب الـ duplicate imports error.
// TypeScript بيشتكي لو نفس الـ identifier اتستورد مرتين في scope واحد.
// =============================================================

import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject }    from '@angular/core';
import { catchError, throwError, finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

// ── Error Interceptor ─────────────────────────────────────────
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'An unexpected error occurred';

      switch (error.status) {
        case 0:   message = 'network error';       break;
        case 400: message = 'invalid request';      break;
        case 429: message = 'rate limit exceeded';  break;
        case 500: message = 'server error';         break;
        case 503: message = 'service unavailable';  break;
        default:  message = error.message || message; break;
      }

      console.error(`[HTTP Error] ${error.status}: ${message}`);
      return throwError(() => new Error(message));
    })
  );
};

// ── Loading Interceptor ───────────────────────────────────────
export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loading = inject(LoadingService);

  const skipUrls = ['/api/health'];
  if (skipUrls.some(url => req.url.includes(url))) {
    return next(req);
  }

  loading.show();
  return next(req).pipe(
    finalize(() => loading.hide())
  );
};