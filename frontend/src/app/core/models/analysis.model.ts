// =============================================================
// FILE: core/models/analysis.model.ts
// PURPOSE: تعريف شكل الـ AI Response والـ History
//
// ARCHITECTURAL DECISION:
// الـ AnalysisResult هو الـ "Source of Truth" للنتيجة.
// أي component بيعرض نتيجة — بياخد من النوع ده بالظبط.
// =============================================================

import { SeverityLevel }  from './severity.enum';
import { SymptomInput }   from './symptom.model';

// =============================================================
// CORE RESULT — شكل الـ Response اللي بييجي من الـ AI
// =============================================================

/**
 * النتيجة الكاملة للتحليل.
 *
 * IMPORTANT: الـ confidence موجود عشان نبين للمستخدم
 * إن النتيجة دي تقريبية — مش diagnosis.
 */
export interface AnalysisResult {
  // ─── Core AI Response ────────────────────────────────────
  severity:          SeverityLevel;
  specialty:         string;          // ex: "Cardiology", "Neurology"
  specialtyAr:       string;          // التخصص بالعربي
  explanation:       string;          // شرح الـ AI (max 150 words)
  recommendations:   string[];        // قائمة النصايح (3-5 items)
  seekEmergencyCare: boolean;         // flag للطوارئ
  confidence:        number;          // 0.0 → 1.0

  // ─── Metadata ────────────────────────────────────────────
  /** وقت التحليل — بيتستخدم في الـ history */
  analyzedAt:    Date;

  /** نسخة الـ prompt اللي اتستخدمت — للـ debugging */
  promptVersion: string;

  /** هل النتيجة جت من الـ cache؟ */
  fromCache:     boolean;
}

// =============================================================
// HISTORY RECORD — بيتحفظ في LocalStorage
// =============================================================

/**
 * بنحفظ الـ Input مع الـ Result مع بعض في الـ history.
 *
 * DESIGN DECISION: بنحفظ الـ input كمان عشان:
 * - نقدر نعيد التحليل بنفس الـ input
 * - نعرض للمستخدم إيه اللي كتبه
 */
export interface AnalysisRecord {
  id:        string;          // unique ID (timestamp-based)
  input:     SymptomInput;
  result:    AnalysisResult;
  createdAt: Date;
}

// =============================================================
// ANALYSIS STATE — شكل الـ State في الـ Signal Store
// =============================================================

/**
 * الـ State الكاملة للـ feature.
 * كل الـ Signals في الـ Store بتعكس النوع ده.
 */
export interface AnalysisState {
  // الـ input الحالي
  currentInput:  SymptomInput | null;

  // نتيجة آخر تحليل
  currentResult: AnalysisResult | null;

  // حالة التحميل
  isLoading:     boolean;

  // الخطأ الحالي (لو في)
  error:         AnalysisError | null;

  // الـ history
  records:       AnalysisRecord[];
}

// =============================================================
// ERROR MODEL — تعريف أنواع الأخطاء
// =============================================================

export type AnalysisErrorType =
  | 'NETWORK_ERROR'       // مفيش إنترنت
  | 'API_ERROR'           // الـ backend رجع error
  | 'PARSE_ERROR'         // الـ AI رجع response مش valid
  | 'VALIDATION_ERROR'    // الـ input مش صح
  | 'RATE_LIMIT_ERROR'    // تجاوز الـ rate limit
  | 'UNKNOWN_ERROR';

export interface AnalysisError {
  type:      AnalysisErrorType;
  message:   string;          // رسالة للـ user
  technical: string;          // رسالة للـ developer (for logging)
  retryable: boolean;         // هل ينفع يحاول تاني؟
}

// =============================================================
// HISTORY FILTER — لـ History Feature
// =============================================================

export interface HistoryFilter {
  severity?:  SeverityLevel;
  dateFrom?:  Date;
  dateTo?:    Date;
  searchText?: string;
}

// =============================================================
// INITIAL STATE — القيمة الافتراضية للـ Store
// =============================================================

export const INITIAL_ANALYSIS_STATE: AnalysisState = {
  currentInput:  null,
  currentResult: null,
  isLoading:     false,
  error:         null,
  records:       [],
};
