// =============================================================
// FILE: features/symptom-input/components/symptom-input-page/
//       symptom-input-page.component.ts
//
// TYPE: Smart Component
//
// RESPONSIBILITIES:
//   ✅ يتواصل مع الـ Facade
//   ✅ يجمع الـ data من الـ Dumb components
//   ✅ يبني الـ SymptomInput object
//   ✅ يمرر الـ state signals للـ Dumb components
//
// WHAT IT DOES NOT DO:
//   ❌ لا يعمل HTTP calls مباشرة
//   ❌ لا يعمل validation بنفسه
//   ❌ لا يعمل UI logic
//
// DESIGN PATTERN: Container/Presenter
// =============================================================

import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule }    from '@angular/common';
import { FormsModule }     from '@angular/forms';
import { RouterModule }    from '@angular/router';

// ── Angular Material ──────────────────────────────────────────
import { MatButtonModule }   from '@angular/material/button';
import { MatIconModule }     from '@angular/material/icon';
import { MatTooltipModule }  from '@angular/material/tooltip';

// ── Feature ───────────────────────────────────────────────────
import { AnalysisFacade }   from '../../facade/analysis.facade';

// ── Dumb Components ───────────────────────────────────────────
import { SymptomTextInputComponent } from '../symptom-text-input/symptom-text-input.component';
import { SymptomChipsComponent }     from '../symptom-chips/symptom-chips.component';
import { BodyMapComponent }          from '../body-map/body-map.component';

// ── Shared ────────────────────────────────────────────────────
import { ErrorStateComponent }  from '../../../../shared/components/error-state/error-state.component';

// ── Models ────────────────────────────────────────────────────
import { SymptomInput }  from '../../../../core/models/symptom.model';
import { BodyPart }      from '../../../../core/models/symptom.model';

@Component({
  selector:        'app-symptom-input-page',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    SymptomTextInputComponent,
    SymptomChipsComponent,
    BodyMapComponent,
    ErrorStateComponent,
  ],
  templateUrl: './symptom-input-page.component.html',
  styleUrl:    './symptom-input-page.component.scss',
})
export class SymptomInputPageComponent implements OnInit {

  // ============================================================
  // ── DEPENDENCY ────────────────────────────────────────────────
  // الـ Smart Component بيعرف الـ Facade فقط
  // ============================================================
      readonly facade = inject(AnalysisFacade);

  // ============================================================
  // ── LOCAL UI STATE (Signals) ──────────────────────────────────
  // State بتخص الـ UI فقط — مش بتروح للـ Store
  // ============================================================

  /** النص اللي بيكتبه المستخدم */
  readonly textInput        = signal('');

  /** الـ chips المختارة */
  readonly selectedChips    = signal<string[]>([]);

  /** الجزء المختار من الـ body map */
  readonly selectedBodyPart = signal<BodyPart | null>(null);

  /** عمر المريض */
  readonly patientAge       = signal<number | null>(null);

  /** مدة الأعراض */
  readonly durationDays     = signal<number | null>(null);

  /** هل الـ advanced options ظاهرة؟ */
  readonly showAdvanced     = signal(false);

  // ============================================================
  // ── STATE FROM FACADE (Delegated) ────────────────────────────
  // ============================================================

  /** حالة الـ loading */
  readonly isLoading = this.facade.isLoading;

  /** الخطأ الحالي */
  readonly error     = this.facade.error;

  // ============================================================
  // ── COMPUTED ──────────────────────────────────────────────────
  // ============================================================

  /**
   * هل الـ form جاهزة؟
   * لازم في نص أو chips على الأقل.
   */
  readonly canSubmit = computed(() => {
    const hasText  = this.textInput().trim().length >= 10;
    const hasChips = this.selectedChips().length > 0;
    return (hasText || hasChips) && !this.isLoading();
  });

  /** عدد الحروف المتبقية */
  readonly charsRemaining = computed(() =>
    500 - this.textInput().length
  );

  /** هل اقترب من الـ limit؟ */
  readonly nearLimit = computed(() =>
    this.charsRemaining() < 50
  );

  // ============================================================
  // ── LIFECYCLE ─────────────────────────────────────────────────
  // ============================================================

  ngOnInit(): void {
    // لو في input قديم في الـ store، بنملأ الـ form بيه
    const existing = this.facade.currentInput();
    if (existing) {
      this.textInput.set(existing.textInput);
      this.selectedChips.set(existing.selectedChips ?? []);
      this.selectedBodyPart.set(existing.selectedBodyPart ?? null);
      this.patientAge.set(existing.patientAge ?? null);
      this.durationDays.set(existing.durationDays ?? null);
    }
  }

  // ============================================================
  // ── EVENT HANDLERS ────────────────────────────────────────────
  // بتستقبل الـ events من الـ Dumb components
  // ============================================================

  /** من SymptomTextInputComponent */
  onTextChange(text: string): void {
    this.textInput.set(text);
  }

  /** من SymptomChipsComponent */
  onChipsChange(chips: string[]): void {
    this.selectedChips.set(chips);
  }

  /** من BodyMapComponent */
  onBodyPartChange(part: BodyPart | null): void {
    this.selectedBodyPart.set(part);
  }

  /** تحديد اللغة تلقائياً من الـ text */
  private detectLanguage(): 'en' | 'ar' {
    const arabicPattern = /[\u0600-\u06FF]/;
    return arabicPattern.test(this.textInput()) ? 'ar' : 'en';
  }

  // ============================================================
  // ── SUBMIT ────────────────────────────────────────────────────
  // ============================================================

  /**
   * بيجمع كل الـ data ويبعتها للـ Facade.
   * الـ Facade هو اللي بيعمل validation والـ API call.
   */
  onSubmit(): void {
    if (!this.canSubmit()) return;

    const input: SymptomInput = {
      textInput:         this.textInput().trim(),
      selectedChips:     this.selectedChips(),
      selectedBodyPart:  this.selectedBodyPart() ?? undefined,
      patientAge:        this.patientAge() ?? undefined,
      durationDays:      this.durationDays() ?? undefined,
      language:          this.detectLanguage(),
      timestamp:         new Date(),
    };

    this.facade.analyze(input);
  }

  /** إعادة المحاولة بعد error */
  onRetry(): void {
    this.facade.reAnalyze();
  }
}
