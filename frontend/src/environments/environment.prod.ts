// =============================================================
// FILE: environments/environment.prod.ts  (Production)
// =============================================================

export const environment = {
  production: true,
  apiUrl:     'https://your-api.azurewebsites.net/api',  // ← هتغيريه لما تـ deploy
  useMockAI:  false,   // في الـ production → بنستخدم الـ real API
};
