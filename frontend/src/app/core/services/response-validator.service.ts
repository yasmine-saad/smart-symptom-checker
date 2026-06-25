// =============================================================
// FILE: core/services/response-validator.service.ts
// PURPOSE: بيتحقق إن الـ AI response schema صح
//
// ARCHITECTURAL DECISION:
// الـ AI مش دايماً بيرجع الـ JSON صح —
// ممكن يرجع text زيادة أو يغير أسماء الـ fields.
// الـ layer دي بتحمي التطبيق من الـ bad responses.
// =============================================================

import { Injectable } from '@angular/core';
import { SeverityLevel } from '../models/severity.enum';
import { ValidationResult } from '../models/symptom.model';

@Injectable({ providedIn: 'root' })
export class ResponseValidatorService {

  private readonly VALID_SEVERITIES = Object.values(SeverityLevel);

  /**
   * بيتحقق إن الـ object ده valid AnalysisResult.
   * بيرجع ValidationResult بالـ errors اللي لقاها.
   */
  validate(response: unknown): ValidationResult {
    const errors: string[] = [];

    if (!response || typeof response !== 'object') {
      return { isValid: false, errors: ['Response is not an object'] };
    }

    const r = response as Record<string, unknown>;

    // ── Required Fields ───────────────────────────────────
    this.checkSeverity(r['severity'], errors);
    this.checkString(r['specialty'],    'specialty',    errors);
    this.checkString(r['specialtyAr'],  'specialtyAr',  errors);
    this.checkString(r['explanation'],  'explanation',  errors);
    this.checkRecommendations(r['recommendations'], errors);
    this.checkBoolean(r['seekEmergencyCare'], 'seekEmergencyCare', errors);
    this.checkConfidence(r['confidence'], errors);

    return { isValid: errors.length === 0, errors };
  }

  // ──────────────────────────────────────────────────────────
  // FIELD VALIDATORS
  // ──────────────────────────────────────────────────────────

  private checkSeverity(value: unknown, errors: string[]): void {
    if (!value || !this.VALID_SEVERITIES.includes(value as SeverityLevel)) {
      errors.push(`Invalid severity: "${value}". Must be one of: ${this.VALID_SEVERITIES.join(', ')}`);
    }
  }

  private checkString(value: unknown, field: string, errors: string[]): void {
    if (!value || typeof value !== 'string' || value.trim().length === 0) {
      errors.push(`Missing or empty field: "${field}"`);
    }
  }

  private checkBoolean(value: unknown, field: string, errors: string[]): void {
    if (typeof value !== 'boolean') {
      errors.push(`Field "${field}" must be a boolean`);
    }
  }

  private checkConfidence(value: unknown, errors: string[]): void {
    if (typeof value !== 'number' || value < 0 || value > 1) {
      errors.push('Confidence must be a number between 0 and 1');
    }
  }

  private checkRecommendations(value: unknown, errors: string[]): void {
    if (!Array.isArray(value) || value.length === 0) {
      errors.push('Recommendations must be a non-empty array');
      return;
    }
    if (value.some(r => typeof r !== 'string')) {
      errors.push('All recommendations must be strings');
    }
  }
}
