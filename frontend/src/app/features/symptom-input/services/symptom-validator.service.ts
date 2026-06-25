// =============================================================
// FILE: features/symptom-input/services/symptom-validator.service.ts
// PURPOSE: بيتحقق من صحة الـ SymptomInput قبل إرساله
//
// ARCHITECTURAL DECISION — ليه Validator منفصل؟
//
// الـ validation ليها منطق معقد —
// بنفصلها عن الـ Facade عشان:
// 1. سهل نعمل unit test عليها
// 2. سهل نضيف rules جديدة
// 3. الـ Facade يفضل نظيف
// =============================================================

import { Injectable } from '@angular/core';

import {
  SymptomInput,
  ValidationResult,
  SYMPTOM_INPUT_CONSTRAINTS,
} from '../../../core/models/symptom.model';

@Injectable({ providedIn: 'root' })
export class SymptomValidatorService {

  /**
   * بيتحقق من الـ SymptomInput ويرجع ValidationResult.
   *
   * DESIGN DECISION: بنرجع كل الـ errors مرة واحدة —
   * مش بنوقف عند أول error (fail-fast).
   * ده بيخلي الـ UX أحسن — المستخدم بيشوف كل المشاكل دفعة واحدة.
   */
  validate(input: Partial<SymptomInput>): ValidationResult {
    const errors: string[] = [];

    // ── Text Input ────────────────────────────────────────
    this.validateTextInput(input.textInput, errors);

    // ── Age (optional) ────────────────────────────────────
    if (input.patientAge !== undefined) {
      this.validateAge(input.patientAge, errors);
    }

    // ── Duration (optional) ───────────────────────────────
    if (input.durationDays !== undefined) {
      this.validateDuration(input.durationDays, errors);
    }

    // ── Language ──────────────────────────────────────────
    if (input.language && !['en', 'ar'].includes(input.language)) {
      errors.push('Language must be English or Arabic');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * بيتحقق من الـ text input فقط — للـ real-time validation.
   */
  validateText(text: string): ValidationResult {
    const errors: string[] = [];
    this.validateTextInput(text, errors);
    return { isValid: errors.length === 0, errors };
  }

  // ──────────────────────────────────────────────────────────
  // PRIVATE VALIDATORS
  // ──────────────────────────────────────────────────────────

  private validateTextInput(text: string | undefined, errors: string[]): void {
    if (!text || text.trim().length === 0) {
      errors.push('Please describe your symptoms');
      return;
    }

    const trimmed = text.trim();

    if (trimmed.length < SYMPTOM_INPUT_CONSTRAINTS.MIN_TEXT_LENGTH) {
      errors.push(
        `Please provide more detail (at least ${SYMPTOM_INPUT_CONSTRAINTS.MIN_TEXT_LENGTH} characters)`
      );
    }

    if (trimmed.length > SYMPTOM_INPUT_CONSTRAINTS.MAX_TEXT_LENGTH) {
      errors.push(
        `Description is too long (maximum ${SYMPTOM_INPUT_CONSTRAINTS.MAX_TEXT_LENGTH} characters)`
      );
    }

    // بنتحقق إن النص مش أرقام بس
    if (/^\d+$/.test(trimmed)) {
      errors.push('Please describe symptoms in words, not numbers');
    }
  }

  private validateAge(age: number, errors: string[]): void {
    if (!Number.isInteger(age)) {
      errors.push('Age must be a whole number');
      return;
    }

    if (age < SYMPTOM_INPUT_CONSTRAINTS.MIN_AGE ||
        age > SYMPTOM_INPUT_CONSTRAINTS.MAX_AGE) {
      errors.push(
        `Age must be between ${SYMPTOM_INPUT_CONSTRAINTS.MIN_AGE} and ${SYMPTOM_INPUT_CONSTRAINTS.MAX_AGE}`
      );
    }
  }

  private validateDuration(days: number, errors: string[]): void {
    if (days < 0) {
      errors.push('Duration cannot be negative');
    }

    if (days > SYMPTOM_INPUT_CONSTRAINTS.MAX_DURATION) {
      errors.push(
        `Duration seems too long (max ${SYMPTOM_INPUT_CONSTRAINTS.MAX_DURATION} days)`
      );
    }
  }

  /**
   * بيتحقق هل الـ input عنده محتوى كافي للتحليل.
   * (text أو chips أو body part)
   */
  hasEnoughContext(input: Partial<SymptomInput>): boolean {
    const hasText  = (input.textInput?.trim().length ?? 0) >= SYMPTOM_INPUT_CONSTRAINTS.MIN_TEXT_LENGTH;
    const hasChips = (input.selectedChips?.length ?? 0) > 0;
    return hasText || hasChips;
  }
}
