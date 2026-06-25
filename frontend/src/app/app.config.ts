// =============================================================
// FILE: app.config.ts
// PURPOSE: Application-level configuration
// =============================================================

import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withViewTransitions }             from '@angular/router';
import { provideHttpClient, withInterceptors }            from '@angular/common/http';
import { provideAnimationsAsync }                        from '@angular/platform-browser/animations/async';

import { APP_ROUTES }          from './app.routes';
import { errorInterceptor, loadingInterceptor } from './core/interceptors/interceptors';

export const appConfig: ApplicationConfig = {
  providers: [
    // ── Zone.js optimization ──────────────────────────────
    provideZoneChangeDetection({ eventCoalescing: true }),

    // ── Routing with view transitions ─────────────────────
    provideRouter(
      APP_ROUTES,
      withViewTransitions(),     // Smooth page transitions
    ),

    // ── HTTP with interceptors ────────────────────────────
    provideHttpClient(
      withInterceptors([
        loadingInterceptor,
        errorInterceptor,
      ])
    ),

    // ── Material animations (lazy) ────────────────────────
    provideAnimationsAsync(),
  ],
};
