// =============================================================
// FILE: core/models/index.ts
// PURPOSE: Barrel export — نستورد من مكان واحد
//
// USAGE:
//   import { AnalysisResult, SeverityLevel } from '@core/models';
//
// ARCHITECTURAL DECISION:
// بدل ما كل ملف يعمل import من path طويل —
// بنستورد كل حاجة من مكان واحد.
// بيسهّل التغيير — لو نقلنا ملف، بنعدّل هنا بس.
// =============================================================

export * from './severity.enum';
export * from './symptom.model';
export * from './analysis.model';
export * from './api-response.model';
