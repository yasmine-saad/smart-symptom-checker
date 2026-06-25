// =============================================================
// FILE: features/symptom-input/store/analysis.store.ts
// PURPOSE: الـ Single Source of Truth للـ Analysis State
//
// ARCHITECTURAL DECISION — ليه Signal Store؟
//
// ❌ البديل القديم (BehaviorSubject):
//    private _result = new BehaviorSubject<AnalysisResult | null>(null);
//    result$ = this._result.asObservable();
//    // كل component لازم يعمل subscribe + unsubscribe
//
// ✅ الـ Signals:
//    readonly result = signal<AnalysisResult | null>(null);
//    // Angular بيتحكم في التحديثات تلقائياً
//    // OnPush components بتتحدث أوتوماتيك
//    // مفيش memory leaks
//
// PATTERN: بنفصل الـ Store عن الـ Facade عشان:
// - Store = بيتحفظ وبيقرأ فقط
// - Facade = بيعمل العمليات والـ business logic
// =============================================================

import {
  Injectable,
  signal,
  computed,
  inject,
} from '@angular/core';

import {
  AnalysisState,
  AnalysisResult,
  AnalysisError,
  AnalysisRecord,
  AnalysisErrorType,
  INITIAL_ANALYSIS_STATE,
} from '../../../core/models/analysis.model';

import {
  SymptomInput,
} from '../../../core/models/symptom.model';

import {
  SeverityLevel,
  SEVERITY_CONFIG,
} from '../../../core/models/severity.enum';

@Injectable({ providedIn: 'root' })
export class AnalysisStore {

  // ============================================================
  // ── PRIVATE SIGNALS (State) ──────────────────────────────────
  // بالظبط زي private variables — بس reactive.
  // بس الـ Facade هو اللي يكتب فيهم.
  // ============================================================

  private readonly _currentInput  = signal<SymptomInput | null>(
    INITIAL_ANALYSIS_STATE.currentInput
  );

  private readonly _currentResult = signal<AnalysisResult | null>(
    INITIAL_ANALYSIS_STATE.currentResult
  );

  private readonly _isLoading     = signal<boolean>(
    INITIAL_ANALYSIS_STATE.isLoading
  );

  private readonly _error         = signal<AnalysisError | null>(
    INITIAL_ANALYSIS_STATE.error
  );

  private readonly _records       = signal<AnalysisRecord[]>(
    INITIAL_ANALYSIS_STATE.records
  );

  // ============================================================
  // ── PUBLIC READONLY SIGNALS ───────────────────────────────────
  // الـ Components بتقرأ من هنا فقط — مش بتكتب.
  // ============================================================

  /** الـ input الحالي */
  readonly currentInput  = this._currentInput.asReadonly();

  /** نتيجة آخر تحليل */
  readonly currentResult = this._currentResult.asReadonly();

  /** هل في طلب جاري؟ */
  readonly isLoading     = this._isLoading.asReadonly();

  /** الخطأ الحالي */
  readonly error         = this._error.asReadonly();

  /** كل التحليلات السابقة */
  readonly records       = this._records.asReadonly();

  // ============================================================
  // ── COMPUTED SIGNALS ──────────────────────────────────────────
  // بيتحسبوا أوتوماتيك لما الـ signals اللي بيعتمدوا عليها تتغير.
  // مفيش حاجة يعملها الـ component — Angular بيعمل كل حاجة.
  // ============================================================

  /**
   * هل في نتيجة موجودة دلوقتي؟
   */
  readonly hasResult = computed(
    () => this._currentResult() !== null
  );

  /**
   * هل الـ form جاهزة للـ submit؟
   * (مفيش loading ومفيش نتيجة قديمة بتـ block)
   */
  readonly canAnalyze = computed(
    () => !this._isLoading() && this._currentInput() !== null
  );

  /**
   * الـ Config الكامل للـ severity الحالية.
   * بيشمل اللون والأيقونة والنص — الـ component مش محتاج يعمل حاجة.
   */
  readonly currentSeverityConfig = computed(() => {
    const result = this._currentResult();
    if (!result) return null;
    return SEVERITY_CONFIG[result.severity];
  });

  /**
   * هل الحالة دي طوارئ؟
   * بنستخدمه لإظهار الـ Emergency Alert component.
   */
  readonly isEmergency = computed(
    () => this._currentResult()?.seekEmergencyCare === true
  );

  /**
   * عدد التحليلات في الـ history.
   */
  readonly recordsCount = computed(
    () => this._records().length
  );

  /**
   * آخر 5 تحليلات — للـ history preview.
   */
  readonly recentRecords = computed(
    () => this._records().slice(0, 5)
  );

  /**
   * التحليلات مرتبة حسب الخطورة (الأعلى أولاً).
   */
  readonly recordsBySeverity = computed(() => {
    const order: Record<SeverityLevel, number> = {
      [SeverityLevel.EMERGENCY]: 0,
      [SeverityLevel.HIGH]:      1,
      [SeverityLevel.MEDIUM]:    2,
      [SeverityLevel.LOW]:       3,
    };
    return [...this._records()].sort(
      (a, b) => order[a.result.severity] - order[b.result.severity]
    );
  });

  // ============================================================
  // ── WRITE METHODS (Mutations) ─────────────────────────────────
  // بس الـ Facade هو اللي بيستدعيهم — مش الـ Components مباشرة.
  // هنا بنحط فقط العمليات الـ pure اللي بتغير الـ state.
  // ============================================================

  /** بيبدأ حالة الـ loading */
  setLoading(value: boolean): void {
    this._isLoading.set(value);
    if (value) {
      // لما يبدأ loading — امسح الـ error القديم
      this._error.set(null);
    }
  }

  /** بيحفظ الـ input الحالي */
  setInput(input: SymptomInput): void {
    this._currentInput.set(input);
  }

  /** بيحفظ النتيجة وبيوقف الـ loading */
  setResult(result: AnalysisResult): void {
    this._currentResult.set(result);
    this._isLoading.set(false);
    this._error.set(null);
  }

  /** بيحفظ الـ error وبيوقف الـ loading */
  setError(type: AnalysisErrorType, message: string, technical: string, retryable = true): void {
    this._error.set({ type, message, technical, retryable });
    this._isLoading.set(false);
  }

  /** بيضيف record للـ history */
  addRecord(record: AnalysisRecord): void {
    // ✅ update() بدل set() — بيضمن مفيش race condition
    this._records.update(records => [record, ...records]);
  }

  /** بيمسح record من الـ history */
  removeRecord(id: string): void {
    this._records.update(records =>
      records.filter(r => r.id !== id)
    );
  }

  /** بيـ reset الـ state كلها */
  reset(): void {
    this._currentInput.set(null);
    this._currentResult.set(null);
    this._isLoading.set(false);
    this._error.set(null);
    // ✅ مش بنمسح الـ records — المستخدم عايز يشوف الـ history
  }

  /** بيـ reset النتيجة بس — للتحليل من جديد */
  resetResult(): void {
    this._currentResult.set(null);
    this._error.set(null);
  }

  /** بيحمّل الـ history من localStorage */
  loadRecords(records: AnalysisRecord[]): void {
    this._records.set(records);
  }
}
