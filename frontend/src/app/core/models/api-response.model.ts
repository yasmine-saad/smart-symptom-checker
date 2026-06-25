// =============================================================
// FILE: core/models/api-response.model.ts
// PURPOSE: Generic wrapper لكل API responses
//
// ARCHITECTURAL DECISION:
// بدل ما كل service يتعامل مع شكل response مختلف —
// بنوحّد الـ contract بين الـ frontend والـ backend.
// الـ backend دايماً بيرجع ApiResponse<T>.
// =============================================================

/**
 * الـ Wrapper العام لكل responses.
 *
 * WHY GENERIC?
 * نفس الشكل بيتستخدم مع أي data type:
 *   ApiResponse<AnalysisResult>
 *   ApiResponse<AnalysisRecord[]>
 *
 * ده بيخلي الـ error handling والـ loading uniform.
 */
export interface ApiResponse<T> {
  success:   boolean;
  data:      T | null;
  error?:    ApiError;
  meta?:     ResponseMeta;
}

// =============================================================
// API ERROR
// =============================================================

export interface ApiError {
  code:    string;        // "RATE_LIMIT_EXCEEDED" | "INVALID_INPUT" ...
  message: string;        // Human-readable
  details?: string[];     // Validation details
}

// =============================================================
// RESPONSE META — معلومات إضافية عن الـ response
// =============================================================

export interface ResponseMeta {
  requestId:     string;    // للـ tracing
  processingMs:  number;    // وقت المعالجة
  promptVersion: string;    // نسخة الـ prompt
  fromCache:     boolean;
}

// =============================================================
// REQUEST DTOs — شكل الـ Request للـ backend
// =============================================================

/**
 * الـ DTO اللي بيتبعت للـ .NET API.
 *
 * DESIGN DECISION: بنبعت الـ processed text مش الـ raw input
 * عشان الـ frontend هو اللي بيعمل preprocessing.
 */
export interface SymptomAnalysisRequest {
  /** الأعراض المجمّعة — text + chips */
  processedSymptoms: string;

  /** اللغة المستخدمة */
  language: 'en' | 'ar';

  /** معلومات إضافية اختيارية */
  context?: {
    age?:          number;
    durationDays?: number;
    bodyPart?:     string;
  };
}

// =============================================================
// HELPER TYPE GUARDS
// بنستخدمهم في ResponseValidatorService
// =============================================================

/**
 * Type guard — بيتأكد إن الـ response valid.
 * بنستخدمه بعد ما الـ AI يرجع response.
 */
export function isValidApiResponse<T>(
  response: unknown,
  dataValidator: (data: unknown) => data is T
): response is ApiResponse<T> {
  if (typeof response !== 'object' || response === null) return false;
  const res = response as Record<string, unknown>;
  if (typeof res['success'] !== 'boolean') return false;
  if (res['success'] && !dataValidator(res['data'])) return false;
  return true;
}
