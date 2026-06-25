// =============================================================
// FILE: features/symptom-input/store/analysis.store.spec.ts
// PURPOSE: Unit tests للـ Signal Store
// =============================================================

import { TestBed }       from '@angular/core/testing';
import { AnalysisStore } from './analysis.store';
import { SeverityLevel } from '../../../core/models/severity.enum';

describe('AnalysisStore', () => {
  let store: AnalysisStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    store = TestBed.inject(AnalysisStore);
  });

  it('should initialize with default state', () => {
    expect(store.currentInput()).toBeNull();
    expect(store.currentResult()).toBeNull();
    expect(store.isLoading()).toBeFalse();
    expect(store.error()).toBeNull();
    expect(store.records()).toEqual([]);
  });

  it('should set loading state', () => {
    store.setLoading(true);
    expect(store.isLoading()).toBeTrue();

    store.setLoading(false);
    expect(store.isLoading()).toBeFalse();
  });

  it('should clear error when loading starts', () => {
    store.setError('API_ERROR', 'Test error', 'technical', true);
    expect(store.error()).not.toBeNull();

    store.setLoading(true);
    expect(store.error()).toBeNull();
  });

  it('should update computed hasResult when result is set', () => {
    expect(store.hasResult()).toBeFalse();

    store.setResult(mockResult());
    expect(store.hasResult()).toBeTrue();
  });

  it('should detect emergency correctly', () => {
    store.setResult({ ...mockResult(), seekEmergencyCare: true });
    expect(store.isEmergency()).toBeTrue();

    store.setResult({ ...mockResult(), seekEmergencyCare: false });
    expect(store.isEmergency()).toBeFalse();
  });

  it('should add records to history', () => {
    expect(store.recordsCount()).toBe(0);

    store.addRecord(mockRecord());
    expect(store.recordsCount()).toBe(1);

    store.addRecord(mockRecord());
    expect(store.recordsCount()).toBe(2);
  });

  it('should remove record by id', () => {
    const record = { ...mockRecord(), id: 'test-id' };
    store.addRecord(record);
    expect(store.recordsCount()).toBe(1);

    store.removeRecord('test-id');
    expect(store.recordsCount()).toBe(0);
  });

  it('should reset state without clearing records', () => {
    store.addRecord(mockRecord());
    store.setResult(mockResult());
    store.reset();

    expect(store.currentResult()).toBeNull();
    expect(store.isLoading()).toBeFalse();
    expect(store.recordsCount()).toBe(1); // records مش بتتمسح
  });

  function mockResult() {
    return {
      severity:          SeverityLevel.LOW,
      specialty:         'General Medicine',
      specialtyAr:       'الطب العام',
      explanation:       'Test',
      recommendations:   ['Rest'],
      seekEmergencyCare: false,
      confidence:        0.8,
      analyzedAt:        new Date(),
      promptVersion:     'v1.2',
      fromCache:         false,
    };
  }

  function mockRecord() {
    return {
      id:        'rec-' + Math.random(),
      input:     { textInput: 'test', language: 'en' as const, timestamp: new Date() },
      result:    mockResult(),
      createdAt: new Date(),
    };
  }
});
