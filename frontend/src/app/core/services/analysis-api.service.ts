// =============================================================
// FILE: core/services/analysis-api.service.ts
// PURPOSE: HTTP communication مع الـ .NET backend
// =============================================================

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  ApiResponse,
  SymptomAnalysisRequest,
} from '../models/api-response.model';
import { AnalysisResult } from '../models/analysis.model';

@Injectable({ providedIn: 'root' })
export class AnalysisApiService {

  private readonly http    = inject(HttpClient);
  private readonly baseUrl = environment.apiUrl;

  analyze(request: SymptomAnalysisRequest): Observable<ApiResponse<AnalysisResult>> {
    return this.http
      .post<ApiResponse<AnalysisResult>>(
        `${this.baseUrl}/symptom-analysis`,
        request
      )
      .pipe(
        catchError(this.handleHttpError)
      );
  }

  private handleHttpError(error: HttpErrorResponse): Observable<never> {
    let message = 'An unexpected error occurred';

    if (error.status === 0) {
      message = 'network error';
    } else if (error.status === 429) {
      message = 'rate limit exceeded';
    } else if (error.status >= 500) {
      message = `server error: ${error.status}`;
    } else if (error.error?.error?.message) {
      message = error.error.error.message;
    }

    return throwError(() => new Error(message));
  }
}
