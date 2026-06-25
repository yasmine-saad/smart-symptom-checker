// =============================================================
// FILE: features/analysis-result/components/specialty-card/
//       specialty-card.component.ts
// TYPE: Dumb Component
// =============================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector:        'app-specialty-card',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, MatIconModule],
  template: `
    <div class="specialty-card">
      <div class="specialty-icon">🩺</div>
      <div class="specialty-content">
        <div class="specialty-label">Recommended Specialty</div>
        <div class="specialty-name">{{ specialty }}</div>
        <div class="specialty-name-ar">{{ specialtyAr }}</div>
      </div>
      <div class="specialty-action">
        <mat-icon>arrow_forward</mat-icon>
      </div>
    </div>
  `,
  styles: [`
    .specialty-card {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 14px;
      padding: 20px;
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .specialty-icon { font-size: 2rem; line-height: 1; }

    .specialty-content { flex: 1; }

    .specialty-label {
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--color-text-muted);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }

    .specialty-name {
      font-size: 1.15rem;
      font-weight: 700;
      color: var(--color-text);
      margin-bottom: 2px;
    }

    .specialty-name-ar {
      font-size: 0.85rem;
      color: var(--color-text-muted);
    }

    .specialty-action {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(var(--color-primary-rgb), 0.08);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-primary);

      mat-icon { font-size: 1.1rem; }
    }
  `],
})
export class SpecialtyCardComponent {
  @Input({ required: true }) specialty!:   string;
  @Input({ required: true }) specialtyAr!: string;
}
