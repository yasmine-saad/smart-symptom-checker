// =============================================================
// FILE: INTEGRATION.md
// PURPOSE: خطوات ربط الـ Frontend بالـ Backend
// =============================================================

# Integration Guide

## Step 1 — Start the Backend

```bash
cd backend/SmartSymptomChecker.API

# Restore packages
dotnet restore

# Run (Mock AI mode)
dotnet run
# API: http://localhost:5000
# Swagger: http://localhost:5000/swagger
```

## Step 2 — Start the Frontend

```bash
cd frontend

# Install packages
npm install

# Run
ng serve
# App: http://localhost:4200
```

## Step 3 — Connect Frontend to Backend

في `frontend/src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl:     'http://localhost:5000/api',
  useMockAI:  false,  // ← بدّل لـ false لاستخدام الـ .NET API
};
```

## Step 4 — Switch to Real OpenAI

في `backend/appsettings.json`:

```json
{
  "AI": {
    "UseMock": false,
    "OpenAI": {
      "ApiKey": "sk-your-key-here"
    }
  }
}
```

## Step 5 — Test the Integration

```bash
# Test the API directly
curl -X POST http://localhost:5000/api/symptom-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "processedSymptoms": "severe headache and high fever for 2 days",
    "language": "en",
    "context": { "age": 35, "durationDays": 2 }
  }'
```

Expected response:
```json
{
  "success": true,
  "data": {
    "severity": "medium",
    "specialty": "General Medicine",
    "specialtyAr": "الطب العام",
    "explanation": "...",
    "recommendations": ["..."],
    "seekEmergencyCare": false,
    "confidence": 0.87
  },
  "meta": {
    "processingMs": 1240,
    "promptVersion": "v1.2",
    "fromCache": false
  }
}
```

## Step 6 — Run Tests

```bash
# Frontend unit tests
cd frontend
ng test

# Backend tests (if added)
cd backend/SmartSymptomChecker.API
dotnet test
```

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| CORS error | Check `Program.cs` CORS policy — add `http://localhost:4200` |
| 429 Too Many Requests | Rate limit hit — wait 1 minute |
| `null` AI response | Check `appsettings.json` — `UseMock: true` for development |
| Angular build fails | Run `npm install` then `ng build` |
