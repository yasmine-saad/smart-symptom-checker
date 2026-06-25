// =============================================================
// FILE: core/models/symptom.model.ts
// PURPOSE: تعريف شكل الـ Input اللي بيدخله المستخدم
//
// ARCHITECTURAL DECISION:
// بنفصل الـ Input عن الـ Result عشان:
// 1. Single Responsibility — كل model مسؤول عن حاجة واحدة
// 2. ممكن Input يتغير بدون ما يأثر على الـ Result
// 3. سهل نعمل validation منفصل على كل واحد
// =============================================================

/**
 * أجزاء الجسم المتاحة في الـ Body Map.
 * بنستخدم union type مش enum عشان:
 * - أخف في الـ bundle
 * - أسهل في الـ comparison
 */
export type BodyPart =
  | 'head'
  | 'chest'
  | 'abdomen'
  | 'back'
  | 'left_arm'
  | 'right_arm'
  | 'left_leg'
  | 'right_leg'
  | 'neck'
  | 'general';

// =============================================================
// QUICK SYMPTOMS
// اقتراحات جاهزة تسهّل على المستخدم الإدخال.
// بنعرفها هنا جنب الـ model لأنها جزء من domain الـ input.
// =============================================================

export interface QuickSymptom {
  id:      string;
  labelEn: string;
  labelAr: string;
  icon:    string;
  bodyPart?: BodyPart;  // اختياري — بعض الأعراض عامة
}

export const QUICK_SYMPTOMS: QuickSymptom[] = [
  { id: 'fever',       labelEn: 'Fever',        labelAr: 'حمى',          icon: '🌡️', bodyPart: 'general' },
  { id: 'headache',    labelEn: 'Headache',     labelAr: 'صداع',         icon: '🤕', bodyPart: 'head'    },
  { id: 'cough',       labelEn: 'Cough',        labelAr: 'سعال',         icon: '😷', bodyPart: 'chest'   },
  { id: 'chest_pain',  labelEn: 'Chest Pain',   labelAr: 'ألم صدر',      icon: '💔', bodyPart: 'chest'   },
  { id: 'fatigue',     labelEn: 'Fatigue',      labelAr: 'إجهاد',        icon: '😴', bodyPart: 'general' },
  { id: 'nausea',      labelEn: 'Nausea',       labelAr: 'غثيان',        icon: '🤢', bodyPart: 'abdomen' },
  { id: 'stomach',     labelEn: 'Stomach Pain', labelAr: 'ألم معدة',     icon: '🤮', bodyPart: 'abdomen' },
  { id: 'back_pain',   labelEn: 'Back Pain',    labelAr: 'ألم ظهر',      icon: '🦴', bodyPart: 'back'    },
  { id: 'dizziness',   labelEn: 'Dizziness',    labelAr: 'دوخة',         icon: '💫', bodyPart: 'head'    },
  { id: 'sore_throat', labelEn: 'Sore Throat',  labelAr: 'التهاب حلق',   icon: '🤧', bodyPart: 'neck'    },
  { id: 'shortness',   labelEn: 'Shortness of Breath', labelAr: 'ضيق تنفس', icon: '😮‍💨', bodyPart: 'chest' },
  { id: 'joint_pain',  labelEn: 'Joint Pain',   labelAr: 'ألم مفاصل',    icon: '🦵', bodyPart: 'general' },
];

// =============================================================
// MAIN INPUT MODEL
// =============================================================

/**
 * الـ Input الكامل اللي بيرسله المستخدم.
 *
 * DESIGN DECISION: كل fields اختيارية ما عدا واحدة —
 * نضمن إن في أعراض بأي طريقة (نص أو chips أو body map).
 * الـ validation بيتعمل في SymptomValidatorService.
 */
export interface SymptomInput {
  // ─── Required ────────────────────────────────────────────
  /** النص الحر — عربي أو إنجليزي */
  textInput: string;

  // ─── Optional Enrichment ─────────────────────────────────
  /** الأعراض المختارة من الـ chips */
  selectedChips?: string[];           // array of QuickSymptom.id

  /** الجزء المختار من الـ body map */
  selectedBodyPart?: BodyPart;

  /** عمر المريض — بيأثر على التحليل */
  patientAge?: number;

  /** مدة الأعراض */
  durationDays?: number;

  // ─── Metadata ────────────────────────────────────────────
  /** اللغة المستخدمة — بتأثر على الـ prompt */
  language: 'en' | 'ar';

  /** وقت الإدخال — بنستخدمه في الـ history */
  timestamp: Date;
}

// =============================================================
// VALIDATION RESULT
// شكل نتيجة الـ validation — بيتستخدم في SymptomValidatorService
// =============================================================

export interface ValidationResult {
  isValid:  boolean;
  errors:   string[];
}

// =============================================================
// CONSTANTS
// =============================================================

export const SYMPTOM_INPUT_CONSTRAINTS = {
  MIN_TEXT_LENGTH:  10,    // أقل عدد حروف مقبول
  MAX_TEXT_LENGTH:  500,   // أقصى عدد حروف مقبول
  MIN_AGE:          1,
  MAX_AGE:          120,
  MAX_DURATION:     365,   // يوم كأقصى مدة
} as const;
