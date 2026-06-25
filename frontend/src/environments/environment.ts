// =============================================================
// FILE: environments/environment.ts  (Development)
// =============================================================

export const environment = {
  production: false,

  // ── API Config ────────────────────────────────────────────
  apiUrl: 'http://localhost:5000/api',

  // ── AI Config ─────────────────────────────────────────────
  // true  → بيستخدم MockAIService (في الـ frontend)
  // false → بيبعت للـ .NET backend
  useMockAI: false,
};
