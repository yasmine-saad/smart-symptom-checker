// =============================================================
// FILE: core/services/analysis-api.service.spec.ts
// PURPOSE: Unit tests للـ AnalysisApiService
//
// TESTING STRATEGY:
// - نعمل mock للـ HttpClient — مش بنبعت HTTP requests حقيقية
// - بنتحقق من الـ happy path والـ error cases
// - كل test مستقل — مش بيأثر على اللي بعده
// =============================================================

import { TestBed }                from '@angular/core/testing';
import { provideHttpClient }      from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AnalysisApiService }     from './analysis-api.service';
import { SeverityLevel }          from '../models/severity.enum';

describe('AnalysisApiService', () => {
  let service:     AnalysisApiService;
  let httpMock:    HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AnalysisApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service  = TestBed.inject(AnalysisApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST to correct endpoint', () => {
    const request = { processedSymptoms: 'headache and fever', language: 'en' as const };

    service.analyze(request).subscribe();

    const req = httpMock.expectOne(r => r.method === 'POST' && r.url.includes('/symptom-analysis'));
    expect(req.request.body).toEqual(request);
    req.flush({ success: true, data: mockResult() });
  });

  it('should return successful response', (done) => {
    const request  = { processedSymptoms: 'cough and cold', language: 'en' as const };
    const mockData = mockResult();

    service.analyze(request).subscribe(response => {
      expect(response.success).toBeTrue();
      expect(response.data?.severity).toBe(SeverityLevel.MEDIUM);
      done();
    });

    httpMock.expectOne(r => r.url.includes('/symptom-analysis'))
            .flush({ success: true, data: mockData });
  });

  it('should handle network error gracefully', (done) => {
    service.analyze({ processedSymptoms: 'test', language: 'en' }).subscribe({
      error: (err: Error) => {
        expect(err.message).toContain('network error');
        done();
      }
    });

    httpMock.expectOne(r => r.url.includes('/symptom-analysis'))
            .error(new ProgressEvent('error'));
  });

  it('should handle 429 rate limit error', (done) => {
    service.analyze({ processedSymptoms: 'test', language: 'en' }).subscribe({
      error: (err: Error) => {
        expect(err.message).toContain('rate limit');
        done();
      }
    });

    httpMock.expectOne(r => r.url.includes('/symptom-analysis'))
            .flush({}, { status: 429, statusText: 'Too Many Requests' });
  });

  function mockResult() {
    return {
      severity:          SeverityLevel.MEDIUM,
      specialty:         'General Medicine',
      specialtyAr:       'الطب العام',
      explanation:       'Test explanation',
      recommendations:   ['Rest', 'Hydrate'],
      seekEmergencyCare: false,
      confidence:        0.85,
      analyzedAt:        new Date(),
      promptVersion:     'v1.2',
      fromCache:         false,
    };
  }
});
