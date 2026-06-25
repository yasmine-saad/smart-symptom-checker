// =============================================================
// FILE: features/symptom-input/services/symptom-validator.service.spec.ts
// PURPOSE: Unit tests للـ Validator
// =============================================================

import { TestBed }                 from '@angular/core/testing';
import { SymptomValidatorService } from './symptom-validator.service';

describe('SymptomValidatorService', () => {
  let service: SymptomValidatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SymptomValidatorService);
  });

  it('should pass valid input', () => {
    const result = service.validate({
      textInput: 'I have a headache and fever since yesterday',
      language:  'en',
      timestamp: new Date(),
    });
    expect(result.isValid).toBeTrue();
    expect(result.errors).toHaveSize(0);
  });

  it('should fail on empty text', () => {
    const result = service.validate({ textInput: '', language: 'en', timestamp: new Date() });
    expect(result.isValid).toBeFalse();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('should fail when text is too short', () => {
    const result = service.validate({ textInput: 'headache', language: 'en', timestamp: new Date() });
    expect(result.isValid).toBeFalse();
    expect(result.errors.some(e => e.includes('detail'))).toBeTrue();
  });

  it('should fail when text is too long', () => {
    const result = service.validate({
      textInput: 'a'.repeat(501),
      language:  'en',
      timestamp: new Date(),
    });
    expect(result.isValid).toBeFalse();
  });

  it('should fail when text is only numbers', () => {
    const result = service.validate({ textInput: '12345678901', language: 'en', timestamp: new Date() });
    expect(result.isValid).toBeFalse();
  });

  it('should fail with invalid age', () => {
    const result = service.validate({
      textInput:  'I have a headache and feel very tired',
      language:   'en',
      patientAge: 150,
      timestamp:  new Date(),
    });
    expect(result.isValid).toBeFalse();
    expect(result.errors.some(e => e.includes('Age'))).toBeTrue();
  });

  it('should pass with valid Arabic text', () => {
    const result = service.validate({
      textInput: 'أعاني من صداع شديد وحمى منذ يومين',
      language:  'ar',
      timestamp: new Date(),
    });
    expect(result.isValid).toBeTrue();
  });
});
