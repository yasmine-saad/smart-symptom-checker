// =============================================================
// FILE: features/symptom-input/services/prompt-builder.service.ts
// PURPOSE: بيبني الـ AI Prompt بشكل منظم ومتحكم فيه
//
// ARCHITECTURAL DECISION — ليه Prompt Builder منفصل؟
//
// الـ Prompt هو أهم حاجة في المشروع — لو الـ prompt غلط،
// النتيجة هتبقى غلط مهما كان الكود ممتاز.
//
// بنفصله في service عشان:
// 1. Prompt Versioning — نعرف بالظبط إيه اللي اتغير
// 2. سهل نعمل A/B testing على prompts مختلفة
// 3. سهل نعمل unit test عليه
// =============================================================

import { Injectable } from '@angular/core';
import { SymptomInput } from '../../../core/models/symptom.model';

// ============================================================
// PROMPT VERSIONS
// ============================================================

/**
 * كل version من الـ prompt ليها ID خاص بيها.
 * بنحفظ الـ version مع كل نتيجة — كده لو حصل bug،
 * نعرف بالظبط إيه الـ prompt اللي سبّبه.
 */
export const PROMPT_VERSIONS = {
  V1_0: 'v1.0',   // Initial release
  V1_1: 'v1.1',   // Added age context
  V1_2: 'v1.2',   // Improved Arabic support (current)
} as const;

export type PromptVersion = typeof PROMPT_VERSIONS[keyof typeof PROMPT_VERSIONS];

export const CURRENT_PROMPT_VERSION: PromptVersion = PROMPT_VERSIONS.V1_2;

// ============================================================
// BUILT PROMPT
// ============================================================

export interface BuiltPrompt {
  systemPrompt: string;
  userPrompt:   string;
  version:      PromptVersion;
}

// ============================================================
// SERVICE
// ============================================================

@Injectable({ providedIn: 'root' })
export class PromptBuilderService {

  /**
   * بيبني الـ prompt الكامل من الـ SymptomInput.
   * هنا بيحصل كل الـ prompt engineering.
   */
  build(input: SymptomInput): BuiltPrompt {
    return {
      systemPrompt: this.buildSystemPrompt(input.language),
      userPrompt:   this.buildUserPrompt(input),
      version:      CURRENT_PROMPT_VERSION,
    };
  }

  // ──────────────────────────────────────────────────────────
  // SYSTEM PROMPT
  // بيعرّف للـ AI دوره وقواعد الـ response
  // ──────────────────────────────────────────────────────────

  private buildSystemPrompt(language: 'en' | 'ar'): string {
    // DESIGN DECISION: بنبعت الـ instructions بالإنجليزي دايماً
    // حتى لو المستخدم بيكتب بالعربي — الـ models بتفهم الـ instructions
    // أحسن بالإنجليزي، وبنطلب منها تكتب الـ explanation بالعربي.

    const responseLanguage = language === 'ar' ? 'Arabic' : 'English';

    return `You are a medical triage assistant for a HealthTech platform.

CRITICAL RULES (MUST FOLLOW):
1. You NEVER diagnose. You ONLY perform triage assessment.
2. Always recommend consulting a real doctor.
3. When in doubt, increase severity level.
4. For any chest pain or breathing difficulty: always set severity to "high" or "emergency".
5. Write the "explanation" and "recommendations" in ${responseLanguage}.

RESPONSE FORMAT:
You MUST respond with ONLY valid JSON matching this exact schema.
No markdown, no code blocks, no extra text — ONLY the JSON object.

{
  "severity": "low" | "medium" | "high" | "emergency",
  "specialty": "English specialty name",
  "specialtyAr": "اسم التخصص بالعربي",
  "explanation": "Clear explanation in ${responseLanguage} (max 120 words)",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
  "seekEmergencyCare": true | false,
  "confidence": 0.0 to 1.0
}

SEVERITY GUIDELINES:
- "low": Minor symptoms, manageable at home (cold, mild headache)
- "medium": Needs medical attention within 48 hours
- "high": Needs medical attention today
- "emergency": Call emergency services immediately (chest pain, stroke signs, severe breathing difficulty)

SPECIALTIES (use exact English names):
Cardiology, Neurology, Gastroenterology, Pulmonology, Orthopedics,
Dermatology, Psychiatry, Ophthalmology, ENT, General Medicine, Urology,
Endocrinology, Rheumatology, Nephrology, Emergency Medicine`;
  }

  // ──────────────────────────────────────────────────────────
  // USER PROMPT
  // بيحوّل الـ SymptomInput لنص واضح للـ AI
  // ──────────────────────────────────────────────────────────

  private buildUserPrompt(input: SymptomInput): string {
    const parts: string[] = [];

    // ── الأعراض الرئيسية ──────────────────────────────────
    parts.push(`Patient symptoms: ${input.textInput}`);

    // ── الـ Quick Chips لو في ─────────────────────────────
    if (input.selectedChips?.length) {
      parts.push(`Additional symptoms selected: ${input.selectedChips.join(', ')}`);
    }

    // ── الـ Body Part لو في ──────────────────────────────
    if (input.selectedBodyPart && input.selectedBodyPart !== 'general') {
      parts.push(`Location of pain/discomfort: ${input.selectedBodyPart.replace('_', ' ')}`);
    }

    // ── العمر لو في ──────────────────────────────────────
    if (input.patientAge) {
      parts.push(`Patient age: ${input.patientAge} years`);
    }

    // ── مدة الأعراض لو في ────────────────────────────────
    if (input.durationDays !== undefined && input.durationDays > 0) {
      const duration = input.durationDays === 1
        ? '1 day'
        : `${input.durationDays} days`;
      parts.push(`Duration: ${duration}`);
    }

    // ── reminder بنحطه في آخر الـ prompt ─────────────────
    parts.push('\nRespond with ONLY the JSON object. No other text.');

    return parts.join('\n');
  }

  /**
   * بيحسب hash للـ prompt — بنستخدمه في الـ CacheService.
   * نفس الأعراض = نفس الـ hash = نرجع الـ cache.
   */
  buildCacheKey(input: SymptomInput): string {
    const normalized = [
      input.textInput.toLowerCase().trim(),
      (input.selectedChips ?? []).sort().join(','),
      input.selectedBodyPart ?? '',
      input.patientAge?.toString() ?? '',
    ].join('|');

    // Simple hash — في production نستخدم crypto
    return btoa(encodeURIComponent(normalized)).substring(0, 32);
  }
}
