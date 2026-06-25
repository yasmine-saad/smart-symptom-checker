// =============================================================
// FILE: features/symptom-input/components/body-map/
//       body-map.component.ts
//
// TYPE: Dumb Component
// =============================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BodyPart }     from '../../../../core/models/symptom.model';

interface BodyMapOption {
  part:  BodyPart;
  label: string;
  icon:  string;
}

const BODY_MAP_OPTIONS: BodyMapOption[] = [
  { part: 'head',      label: 'Head',       icon: '🧠' },
  { part: 'neck',      label: 'Neck',       icon: '🔴' },
  { part: 'chest',     label: 'Chest',      icon: '❤️' },
  { part: 'abdomen',   label: 'Abdomen',    icon: '🫁' },
  { part: 'back',      label: 'Back',       icon: '🦴' },
  { part: 'left_arm',  label: 'Left Arm',   icon: '💪' },
  { part: 'right_arm', label: 'Right Arm',  icon: '💪' },
  { part: 'left_leg',  label: 'Left Leg',   icon: '🦵' },
  { part: 'right_leg', label: 'Right Leg',  icon: '🦵' },
  { part: 'general',   label: 'Whole Body', icon: '🧍' },
];

@Component({
  selector:        'app-body-map',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule],
  template: `
    <div class="body-map" role="group" aria-label="Select affected body area">
      @for (option of options; track option.part) {
        <button
          class="body-btn"
          type="button"
          [class.selected]="selected === option.part"
          [disabled]="disabled"
          [attr.aria-pressed]="selected === option.part"
          (click)="select(option.part)">
          <span class="body-icon">{{ option.icon }}</span>
          <span class="body-label">{{ option.label }}</span>
        </button>
      }
    </div>
  `,
  styles: [`
    .body-map {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .body-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
      padding: 10px 14px;
      border: 1.5px solid var(--color-border);
      border-radius: 10px;
      background: var(--color-bg);
      cursor: pointer;
      font-family: inherit;
      transition: all 0.18s;
      min-width: 72px;

      &:hover:not(:disabled) {
        border-color: var(--color-primary);
        background: rgba(var(--color-primary-rgb), 0.06);
        transform: translateY(-2px);
      }

      &.selected {
        border-color: var(--color-primary);
        background: rgba(var(--color-primary-rgb), 0.1);
        box-shadow: 0 0 0 2px rgba(var(--color-primary-rgb), 0.2);
      }

      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }

    .body-icon { font-size: 1.2rem; }
    .body-label { font-size: 0.72rem; font-weight: 500; color: var(--color-text-muted); }
  `],
})
export class BodyMapComponent {

  @Input() selected: BodyPart | null = null;
  @Input() disabled                  = false;

  @Output() selectionChange = new EventEmitter<BodyPart | null>();

  readonly options = BODY_MAP_OPTIONS;

  select(part: BodyPart): void {
    // تانية ضغطة على نفس الـ part = deselect
    const newValue = this.selected === part ? null : part;
    this.selectionChange.emit(newValue);
  }
}
