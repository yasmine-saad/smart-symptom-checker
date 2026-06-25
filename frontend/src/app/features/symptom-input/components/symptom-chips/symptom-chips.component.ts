// =============================================================
// FILE: features/symptom-input/components/symptom-chips/
//       symptom-chips.component.ts
//
// TYPE: Dumb Component (Presentational)
// =============================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { QUICK_SYMPTOMS, QuickSymptom } from '../../../../core/models/symptom.model';

@Component({
  selector:        'app-symptom-chips',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule],
  template: `
    <div class="chips-wrapper" role="group" aria-label="Quick symptom selection">
      @for (symptom of symptoms; track symptom.id) {
        <button
          class="chip"
          type="button"
          [class.selected]="isSelected(symptom.id)"
          [disabled]="disabled"
          [attr.aria-pressed]="isSelected(symptom.id)"
          [attr.aria-label]="symptom.labelEn"
          (click)="toggle(symptom.id)">
          <span class="chip-icon">{{ symptom.icon }}</span>
          <span class="chip-label">{{ symptom.labelEn }}</span>
          <span class="chip-label-ar">{{ symptom.labelAr }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .chips-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 7px 14px;
      border: 1.5px solid var(--color-border);
      border-radius: 100px;
      background: var(--color-bg);
      cursor: pointer;
      font-family: inherit;
      transition: all 0.18s;
      white-space: nowrap;

      &:hover:not(:disabled) {
        border-color: var(--color-primary);
        background: rgba(var(--color-primary-rgb), 0.06);
      }

      &.selected {
        border-color: var(--color-primary);
        background: rgba(var(--color-primary-rgb), 0.1);
        color: var(--color-primary);
      }

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .chip-icon { font-size: 0.9rem; }

    .chip-label {
      font-size: 0.8rem;
      font-weight: 500;
      color: var(--color-text);

      .selected & { color: var(--color-primary); }
    }

    .chip-label-ar {
      font-size: 0.72rem;
      color: var(--color-text-muted);
    }
  `],
})
export class SymptomChipsComponent {

  @Input() selected: string[] = [];
  @Input() disabled           = false;

  @Output() selectionChange = new EventEmitter<string[]>();

  readonly symptoms: QuickSymptom[] = QUICK_SYMPTOMS;

  isSelected(id: string): boolean {
    return this.selected.includes(id);
  }

  toggle(id: string): void {
    const updated = this.isSelected(id)
      ? this.selected.filter(s => s !== id)
      : [...this.selected, id];

    this.selectionChange.emit(updated);
  }
}
