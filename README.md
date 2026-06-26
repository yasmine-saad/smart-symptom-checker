# 🏥 SymptomAI — Medical Triage Assistant

> **Portfolio Project** — Full-Stack HealthTech Application  
> Angular 21 + ASP.NET Core 8 + AI Integration

[![Angular](https://img.shields.io/badge/Angular-19-red?logo=angular)](https://angular.dev)
[![.NET](https://img.shields.io/badge/.NET-8-purple?logo=dotnet)](https://dotnet.microsoft.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## ⚠️ Medical Disclaimer

> This application provides **triage guidance only** — it is NOT a diagnostic tool.  
> Always consult a qualified healthcare professional for medical decisions.

---

## 📸 Overview

SymptomAI is a production-grade HealthTech platform where users describe their symptoms (in Arabic or English) and receive AI-powered medical triage assessment including severity level, recommended specialty, and actionable guidance.

**Live Demo:** [symptom-ai-demo.github.io](#)

---

## ✨ Features

### Patient-Facing
- 🌐 **Bilingual input** — Arabic and English fully supported
- 🏥 **Severity triage** — Low / Medium / High / Emergency
- 🩺 **Specialty recommendation** — 15+ medical specialties
- 💡 **Personalized recommendations** — 3–5 actionable steps
- 🚨 **Emergency alert** — Immediate visual + call button
- 📋 **Analysis history** — Searchable, filterable, persistent
- ♻️ **Re-analysis** — Re-run any past analysis instantly
- 📍 **Body map selector** — 10 body regions
- ⚡ **Quick chips** — 12 common symptom shortcuts

### Technical
- ⚡ **Smart caching** — 30-min TTL, same symptoms = instant result
- 🛡️ **Rate limiting** — 10 req/min per IP
- 📱 **PWA ready** — Installable, offline-capable
- ♿ **Accessible** — ARIA labels, semantic HTML, keyboard navigation
- 🎨 **View transitions** — Smooth Angular page animations

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│  Angular 19 Frontend                                  │
│                                                       │
│  ┌──────────┐   ┌──────────┐   ┌──────────────────┐ │
│  │  Dumb    │   │  Smart   │   │  Signal Store    │ │
│  │Components│◄──│Components│◄──│  (State Layer)   │ │
│  └──────────┘   └──────────┘   └──────────────────┘ │
│                      │                                │
│               ┌──────────────┐                        │
│               │AnalysisFacade│  ← Orchestrator        │
│               └──────┬───────┘                        │
│                      │                                │
│         ┌────────────┼────────────┐                   │
│    Cache │       API  │      History                  │
│    Service     Service      Service                   │
└──────────────────────┼──────────────────────────────┘
                       │ HTTP POST
┌──────────────────────┼──────────────────────────────┐
│  ASP.NET Core 8 Backend                              │
│                                                       │
│  Controller → AnalysisService → IAIProvider          │
│                               ├── MockAIProvider     │
│                               └── OpenAIProvider     │
│                                                       │
│  [Rate Limiter] [FluentValidation] [PromptBuilder]   │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 Key Engineering Decisions

### Angular — Signals over BehaviorSubjects
```typescript
// ❌ Old pattern — manual subscriptions, memory leaks risk
private _result = new BehaviorSubject<AnalysisResult | null>(null);
result$ = this._result.asObservable();
// Every component: ngOnDestroy() { this.sub.unsubscribe(); }

// ✅ Signals — Angular manages everything
readonly result = signal<AnalysisResult | null>(null);
readonly hasResult = computed(() => !!this.result());
// No subscriptions. No unsubscribe. OnPush just works.
```

### Facade Pattern — One entry point per feature
```typescript
// ❌ Without Facade — Smart component knows too much
this.validator.validate(input);
this.promptBuilder.build(input);
this.cache.check(key);
this.apiService.post(request);
this.store.setResult(result);
this.history.save(record);

// ✅ With Facade — one method does everything
this.facade.analyze(input);
```

### Backend — IAIProvider for easy swapping
```csharp
// Program.cs — change ONE line to switch AI provider
builder.Services.AddScoped<IAIProvider, MockAIProvider>();   // Development
builder.Services.AddScoped<IAIProvider, OpenAIProvider>();   // Production
// Zero changes to Controller, AnalysisService, or tests
```

---

## 📁 Project Structure

```
symptom-ai/
├── frontend/                        # Angular 19 app
│   └── src/app/
│       ├── core/
│       │   ├── models/              # Domain models & interfaces
│       │   ├── services/            # API, Cache, History, Loading
│       │   └── interceptors/        # Error + Loading interceptors
│       ├── features/
│       │   ├── symptom-input/
│       │   │   ├── store/           # Signal Store
│       │   │   ├── facade/          # Analysis Facade
│       │   │   ├── services/        # Prompt Builder, Validator
│       │   │   └── components/      # Input Page + Dumb components
│       │   ├── analysis-result/
│       │   │   └── components/      # Result Page + Dumb components
│       │   └── history/
│       │       └── components/      # History Page + History Card
│       └── shared/
│           └── components/          # Skeleton, Badge, ErrorState
│
├── backend/SmartSymptomChecker.API/
│   ├── Controllers/                 # Thin HTTP layer
│   ├── Application/
│   │   ├── DTOs/                    # Request/Response models
│   │   ├── Interfaces/              # IAIProvider contract
│   │   ├── Services/                # AnalysisService, PromptBuilder
│   │   └── Validators/              # FluentValidation rules
│   ├── Domain/
│   │   └── Enums/                   # SeverityLevel
│   └── Infrastructure/
│       ├── AI/                      # MockAIProvider, OpenAIProvider
│       └── RateLimiting/            # Rate limit policy
│
├── demo/
│   └── index.html                   # Standalone interactive demo
└── INTEGRATION.md                   # Backend ↔ Frontend guide
```

---

## 🚀 Setup & Run

### Prerequisites
- Node.js 20+
- Angular CLI 21: `npm install -g @angular/cli`
- .NET 8 SDK
- (Optional) OpenAI API key

### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Run development server (Mock AI — no backend needed)
ng serve

# Run with real backend
# → Set environment.ts useMockAI: false first
ng serve
```

### Backend

```bash
cd backend/SmartSymptomChecker.API

# Install packages
dotnet restore

# Install NuGet packages
dotnet add package FluentValidation.AspNetCore
dotnet add package Microsoft.AspNetCore.RateLimiting

# Run (Mock AI by default)
dotnet run

# Swagger UI: http://localhost:5000
```

### Switch to OpenAI

```json
// appsettings.json
{
  "AI": {
    "UseMock": false,
    "OpenAI": { "ApiKey": "sk-your-key-here" }
  }
}
```

---

## 🧪 Running Tests

```bash
# Frontend unit tests
cd frontend
ng test

# Frontend with coverage report
ng test --code-coverage

# Backend tests
cd backend/SmartSymptomChecker.API
dotnet test
```

---

## 🌐 Deployment

### Frontend → GitHub Pages

```bash
cd frontend

# Build for production
ng build --configuration production

# Deploy to GitHub Pages
npx angular-cli-ghpages --dir=dist/browser
```

### Backend → Railway / Azure

```bash
# Railway (easiest)
railway login
railway init
railway up

# Azure App Service
az webapp up --name symptom-ai-api --runtime "DOTNET:8"
```

### Environment Variables (Production)

```bash
# Backend
AI__UseMock=false
AI__OpenAI__ApiKey=sk-your-key-here

# Frontend (environment.prod.ts)
apiUrl=https://your-api.azurewebsites.net/api
```

---

## 🔌 API Reference

### POST `/api/symptom-analysis`

**Request:**
```json
{
  "processedSymptoms": "severe headache and high fever for 2 days",
  "language": "en",
  "context": {
    "age": 35,
    "durationDays": 2,
    "bodyPart": "head"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "severity": "medium",
    "specialty": "General Medicine",
    "specialtyAr": "الطب العام",
    "explanation": "Your symptoms suggest...",
    "recommendations": [
      "Rest for 2-3 days",
      "Drink plenty of fluids",
      "See a doctor within 48 hours"
    ],
    "seekEmergencyCare": false,
    "confidence": 0.87,
    "analyzedAt": "2025-04-06T10:30:00Z",
    "promptVersion": "v1.2"
  },
  "meta": {
    "requestId": "abc-123",
    "processingMs": 1240,
    "promptVersion": "v1.2",
    "fromCache": false
  }
}
```

**Rate Limits:** 10 requests/minute per IP

---

## 🧠 Angular Patterns Used

| Pattern | Where | Why |
|---------|-------|-----|
| **Signals** | AnalysisStore | Reactive state without subscriptions |
| **computed()** | Store, Facade | Auto-derived state |
| **effect()** | ThemeService | Side effects from signal changes |
| **inject()** | All services | Modern DI, no constructor bloat |
| **DestroyRef** | DashboardService | Auto-cleanup without takeUntil |
| **OnPush** | All components | Performance — only re-render on input changes |
| **Facade Pattern** | AnalysisFacade | Hide complexity from Smart components |
| **Smart/Dumb** | All features | Reusability + testability |
| **Lazy Loading** | All routes | Smaller initial bundle |
| **View Transitions** | app.config.ts | Smooth navigation animations |

---

## 🏥 HealthTech Domain Knowledge

This project leverages the author's **BSc in Biotechnology & Genetics** background:

- Medically accurate severity classifications
- Real-world triage logic (not just text matching)
- Arabic medical terminology for bilingual users
- Understanding of clinical workflows that shaped the UX

---

## 👩‍💻 Built By

**Yasmine Saad Ahmed**  
Frontend Angular Developer → Full-Stack HealthTech Engineer

- 🔗 [Portfolio](https://yasmine-saad.github.io)
- 💼 [LinkedIn](https://www.linkedin.com/in/yasmine-saad-62197772/)
- 🐙 [GitHub](https://github.com/yasmine-saad)
- ✉️ yasmines.rahim@gmail.com

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

*Built with Angular 19 · ASP.NET Core 8 · ❤️ for HealthTech*
