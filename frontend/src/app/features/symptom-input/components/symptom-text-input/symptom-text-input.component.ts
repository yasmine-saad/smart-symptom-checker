// =============================================================
// FILE: features/symptom-input/components/symptom-text-input/
//       symptom-text-input.component.ts
//
// TYPE: Dumb Component (Presentational)
//
// RESPONSIBILITIES:
//   ✅ يعرض الـ textarea
//   ✅ يعمل emit لأي تغيير
//   ✅ يعرض عداد الحروف
//
// WHAT IT DOES NOT DO:
//   ❌ مش بيعرف الـ Facade
//   ❌ مش بيعمل validation
//   ❌ مش بيعرف إيه اللي بيحصل برا
//
// WHY DUMB?
// لو بكره عايزين نستخدم نفس الـ textarea في أكتر من صفحة،
// بنعمل ده بسهولة لأنه مش مرتبط بأي service.
// =============================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector:        'app-symptom-text-input',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule],
  template: `
    <div class="text-input-wrapper">

      <textarea
        class="symptom-textarea"
        [class.near-limit]="nearLimit"
        [value]="value"
        [disabled]="isLoading"
        [attr.aria-label]="'Describe your symptoms'"
        [attr.aria-describedby]="'chars-remaining'"
        placeholder="Example: I have been experiencing severe headache and fever for the past 2 days, along with fatigue and loss of appetite..."
        rows="5"
        maxlength="500"
        (input)="onInput($event)">
      </textarea>

      <!-- Character Counter -->
      <div class="textarea-footer">
        <span class="lang-hint">
          🌐 Arabic and English supported
        </span>
        <span
          id="chars-remaining"
          class="char-count"
          [class.warning]="nearLimit"
          [attr.aria-live]="'polite'">
          {{ charsRemaining }} characters remaining
        </span>
      </div>

    </div>
  `,
  styles: [`
    .text-input-wrapper { display: flex; flex-direction: column; gap: 8px; }

    .symptom-textarea {
      width: 100%;
      padding: 14px 16px;
      border: 1.5px solid var(--color-border);
      border-radius: 10px;
      font-size: 0.95rem;
      font-family: inherit;
      line-height: 1.6;
      resize: vertical;
      min-height: 120px;
      background: var(--color-bg);
      color: var(--color-text);
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;

      &::placeholder { color: var(--color-text-muted); opacity: 0.7; }

      &:focus {
        border-color: var(--color-primary);
        box-shadow: 0 0 0 3px rgba(var(--color-primary-rgb), 0.12);
      }

      &.near-limit { border-color: var(--color-warning); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .textarea-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .lang-hint {
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    .char-count {
      font-size: 0.75rem;
      color: var(--color-text-muted);
      font-family: var(--font-mono);
      transition: color 0.2s;

      &.warning { color: var(--color-warning); font-weight: 600; }
    }
  `],
})
export class SymptomTextInputComponent {

  /** القيمة الحالية */
  @Input() value         = '';

  /** هل في loading؟ */
  @Input() isLoading     = false;

  /** عدد الحروف المتبقية */
  @Input() charsRemaining = 500;

  /** هل اقترب من الـ limit؟ */
  @Input() nearLimit     = false;

  /** بيـ emit لما يتغير النص */
  @Output() valueChange = new EventEmitter<string>();

  onInput(event: Event): void {
    const value = (event.target as HTMLTextAreaElement).value;
    this.valueChange.emit(value);
  }
}
