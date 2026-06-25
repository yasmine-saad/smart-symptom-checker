// =============================================================
// FILE: features/symptom-input/facade/analysis.facade.ts
// PURPOSE: الـ "مدير" — بيوحّد كل العمليات في مكان واحد
//
// ARCHITECTURAL DECISION — الـ Facade Pattern
//
// بدون Facade — الـ Smart Component بيعمل كل ده:
//   ❌ component.ts:
//      this.validator.validate(input)
//      this.promptBuilder.build(input)
//      this.cache.check(key)
//      this.apiService.post(request)
//      this.responseValidator.validate(response)
//      this.store.setResult(result)
//      this.history.save(record)
//
// مع Facade — الـ Smart Component بيعمل سطر واحد:
//   ✅ component.ts:
//      this.facade.analyze(input)
//
// الـ Facade بيحقق:
// - SRP: كل service مسؤول عن حاجة واحدة
// - الـ Components مش عارفة أي services موجودة
// - سهل نغير أي service من غير ما نلمس الـ components
// =============================================================

import {
  Injectable,
  inject,
  computed,
  DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed }    from '@angular/core/rxjs-interop';
import { Router }                from '@angular/router';
import { catchError, finalize, of, tap } from 'rxjs';

// ── Internal ──────────────────────────────────────────────────
import { AnalysisStore }           from '../store/analysis.store';
import { PromptBuilderService }    from '../services/prompt-builder.service';
import { SymptomValidatorService } from '../services/symptom-validator.service';

// ── Core Services ─────────────────────────────────────────────
import { AnalysisApiService }       from '../../../core/services/analysis-api.service';
import { CacheService }             from '../../../core/services/cache.service';
import { HistoryService }           from '../../../core/services/history.service';
import { ResponseValidatorService } from '../../../core/services/response-validator.service';

// ── Models ────────────────────────────────────────────────────
import { SymptomInput }     from '../../../core/models/symptom.model';
import { AnalysisRecord }   from '../../../core/models/analysis.model';

@Injectable({ providedIn: 'root' })
export class AnalysisFacade {

  // ============================================================
  // ── DEPENDENCIES (inject pattern) ────────────────────────────
  // ✅ inject() بدل constructor params
  // ============================================================

  private readonly store             = inject(AnalysisStore);
  private readonly promptBuilder     = inject(PromptBuilderService);
  private readonly validator         = inject(SymptomValidatorService);
  private readonly apiService        = inject(AnalysisApiService);
  private readonly cache             = inject(CacheService);
  private readonly history           = inject(HistoryService);
  private readonly responseValidator = inject(ResponseValidatorService);
  private readonly router            = inject(Router);
  private readonly destroyRef        = inject(DestroyRef);

  // ============================================================
  // ── PUBLIC STATE (delegated from Store) ───────────────────────
  // الـ Components بتقرأ من هنا — مش من الـ Store مباشرة.
  // كل حاجة من مكان واحد.
  // ============================================================

  readonly currentResult        = this.store.currentResult;
  readonly currentInput         = this.store.currentInput;
  readonly isLoading            = this.store.isLoading;
  readonly error                = this.store.error;
  readonly records              = this.store.records;
  readonly hasResult            = this.store.hasResult;
  readonly canAnalyze           = this.store.canAnalyze;
  readonly isEmergency          = this.store.isEmergency;
  readonly currentSeverityConfig = this.store.currentSeverityConfig;
  readonly recordsCount         = this.store.recordsCount;
  readonly recentRecords        = this.store.recentRecords;
  averageRating: any;

  // ============================================================
  // ── INITIALIZATION ────────────────────────────────────────────
  // ============================================================

  constructor() {
    // بنحمل الـ history من localStorage لما الـ Facade يتعمل
    this.loadHistory();
  }

  // ============================================================
  // ── MAIN ACTION: analyze() ────────────────────────────────────
  //
  // ده الـ method الوحيد اللي الـ Smart Component بيستدعيه.
  // بيحتوي على كل الـ flow:
  //   Validate → Cache check → Build prompt → API call
  //   → Validate response → Store → History → Navigate
  // ============================================================

  analyze(input: SymptomInput): void {

    // ── Step 1: Validate Input ────────────────────────────
    const validation = this.validator.validate(input);
    if (!validation.isValid) {
      this.store.setError(
        'VALIDATION_ERROR',
        validation.errors[0],        // بنعرض أول error للـ user
        `Validation failed: ${validation.errors.join(', ')}`,
        false                         // مش هيفيد يعيد المحاولة
      );
      return;
    }

    // ── Step 2: Save Input to Store ───────────────────────
    this.store.setInput(input);

    // ── Step 3: Check Cache ───────────────────────────────
    const cacheKey = this.promptBuilder.buildCacheKey(input);
    const cached   = this.cache.get(cacheKey);

    if (cached) {
      // ✅ Cache hit — رجّعنا النتيجة من الـ cache
      this.store.setResult({ ...cached, fromCache: true });
      this.router.navigate(['/result']);
      return;
    }

    // ── Step 4: Build Prompt ──────────────────────────────
    const prompt = this.promptBuilder.build(input);

    // ── Step 5: Call API ──────────────────────────────────
    this.store.setLoading(true);

    this.apiService
      .analyze({
        processedSymptoms: input.textInput,
        language:          input.language,
        context: {
          age:          input.patientAge,
          durationDays: input.durationDays,
          bodyPart:     input.selectedBodyPart,
        },
      })
      .pipe(
        // ── Step 6: Validate Response ──────────────────────
        tap(response => {
          if (!response.success || !response.data) {
            throw new Error(response.error?.message ?? 'API returned unsuccessful response');
          }
        }),

        // ── Step 7: Store Result ───────────────────────────
        tap(response => {
          const result = {
            ...response.data!,
            promptVersion: prompt.version,
            fromCache:     false,
            analyzedAt:    new Date(),
          };

          // Validate الـ response schema قبل ما نحفظه
          const responseValidation = this.responseValidator.validate(result);
          if (!responseValidation.isValid) {
            throw new Error(`Invalid AI response: ${responseValidation.errors.join(', ')}`);
          }

          // ✅ كل حاجة تمام — احفظ النتيجة
          this.store.setResult(result);

          // ── Step 8: Cache ────────────────────────────────
          this.cache.set(cacheKey, result);

          // ── Step 9: Save to History ───────────────────────
          const record: AnalysisRecord = {
            id:        `rec-${Date.now()}`,
            input,
            result,
            createdAt: new Date(),
          };
          this.store.addRecord(record);
          this.history.save(record);

          // ── Step 10: Navigate ─────────────────────────────
          this.router.navigate(['/result']);
        }),

        // ── Error Handling ─────────────────────────────────
        catchError(err => {
          this.handleError(err);
          return of(null);
        }),

        // ── Always stop loading ────────────────────────────
        finalize(() => this.store.setLoading(false)),

        // ✅ DestroyRef بدل takeUntil + Subject
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  // ============================================================
  // ── OTHER ACTIONS ─────────────────────────────────────────────
  // ============================================================

  /** بيبدأ من الأول — من صفحة الـ Input */
  startOver(): void {
    this.store.reset();
    this.router.navigate(['/']);
  }

  /** بيعيد التحليل بنفس الـ input */
  reAnalyze(): void {
    const input = this.store.currentInput();
    if (!input) return;
    this.store.resetResult();
    this.analyze(input);
  }

  /** بيعيد التحليل من record في الـ history */
  reAnalyzeFromRecord(record: AnalysisRecord): void {
    this.analyze(record.input);
  }

  /** بيمسح record من الـ history */
  deleteRecord(id: string): void {
    this.store.removeRecord(id);
    this.history.delete(id);
  }

  // ============================================================
  // ── PRIVATE HELPERS ───────────────────────────────────────────
  // ============================================================

  private handleError(err: unknown): void {
    const message = err instanceof Error ? err.message : 'Unknown error';

    if (message.includes('network') || message.includes('Http')) {
      this.store.setError(
        'NETWORK_ERROR',
        'Connection failed. Please check your internet and try again.',
        message,
        true
      );
    } else if (message.includes('rate') || message.includes('429')) {
      this.store.setError(
        'RATE_LIMIT_ERROR',
        'Too many requests. Please wait a moment and try again.',
        message,
        true
      );
    } else if (message.includes('Invalid AI response')) {
      this.store.setError(
        'PARSE_ERROR',
        'Analysis failed. Please try rephrasing your symptoms.',
        message,
        true
      );
    } else {
      this.store.setError(
        'API_ERROR',
        'Something went wrong. Please try again.',
        message,
        true
      );
    }
  }

  private loadHistory(): void {
    const records = this.history.load();
    this.store.loadRecords(records);
  }
}
