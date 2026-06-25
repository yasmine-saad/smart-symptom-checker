// =============================================================
// FILE: app.routes.ts
// PURPOSE: Root routing — كل routes lazy-loaded
//
// ARCHITECTURAL DECISION — Lazy Loading:
// بدل ما نحمّل كل الـ components من أول لحظة —
// بنحمّل كل feature لما المستخدم يروحها.
// النتيجة: Initial bundle أصغر = التطبيق بيفتح أسرع.
// =============================================================

import { Routes } from '@angular/router';

export const APP_ROUTES: Routes = [

  // ── Default: Symptom Input ────────────────────────────────
  {
    path: '',
    loadComponent: () =>
      import('./features/symptom-input/components/symptom-input-page/symptom-input-page.component')
        .then(m => m.SymptomInputPageComponent),
    title: 'SymptomAI — Check Your Symptoms',
  },

  // ── Analysis Result ───────────────────────────────────────
  {
    path: 'result',
    loadComponent: () =>
      import('./features/analysis-result/components/result-page/result-page.component')
        .then(m => m.ResultPageComponent),
    title: 'SymptomAI — Analysis Result',
  },

  // ── History ───────────────────────────────────────────────
  {
    path: 'history',
    loadComponent: () =>
      import('./features/history/components/history-page/history-page.component')
        .then(m => m.HistoryPageComponent),
    title: 'SymptomAI — Analysis History',
  },

  // ── Fallback ──────────────────────────────────────────────
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];
