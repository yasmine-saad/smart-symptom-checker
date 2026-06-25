// =============================================================
// FILE: features/analysis-result/components/severity-card/
//       severity-card.component.ts
// TYPE: Dumb Component
// =============================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }      from '@angular/common';
import { MatIconModule }     from '@angular/material/icon';
import { SeverityLevel, SEVERITY_CONFIG } from '../../../../core/models/severity.enum';

@Component({
  selector:        'app-severity-card',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, MatIconModule],
  template: `
    <div class="severity-card" [style.border-color]="config.color">

      <div class="card-header" [style.background]="config.bgColor">
        <div class="severity-icon">
          <mat-icon [style.color]="config.color">{{ config.icon }}</mat-icon>
        </div>
        <div>
          <div class="severity-label" [style.color]="config.color">
            {{ config.label }} Severity
          </div>
          <div class="severity-label-ar">{{ config.labelAr }}</div>
        </div>
      </div>

      <div class="card-body">
        <!-- Confidence bar -->
        <div class="confidence-section">
          <div class="confidence-label">
            <span>Confidence</span>
            <span class="confidence-pct">{{ (confidence * 100) | number:'1.0-0' }}%</span>
          </div>
          <div class="confidence-bar">
            <div
              class="confidence-fill"
              [style.width.%]="confidence * 100"
              [style.background]="config.color">
            </div>
          </div>
        </div>

        <!-- Urgency text -->
        <div class="urgency-text" [style.color]="config.color">
          <mat-icon>schedule</mat-icon>
          {{ config.urgencyText }}
        </div>

        <!-- AI Explanation -->
        <p class="explanation">{{ explanation }}</p>
      </div>

    </div>
  `,
  styles: [`
    .severity-card {
      background: var(--color-surface);
      border: 2px solid;
      border-radius: 14px;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
    }

    .severity-icon {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: white;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);

      mat-icon { font-size: 1.2rem; }
    }

    .severity-label {
      font-size: 1.05rem;
      font-weight: 700;
      line-height: 1.2;
    }

    .severity-label-ar {
      font-size: 0.8rem;
      color: var(--color-text-muted);
    }

    .card-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }

    .confidence-section { display: flex; flex-direction: column; gap: 6px; }

    .confidence-label {
      display: flex;
      justify-content: space-between;
      font-size: 0.78rem;
      color: var(--color-text-muted);
    }

    .confidence-pct { font-weight: 700; color: var(--color-text); }

    .confidence-bar {
      height: 6px;
      background: var(--color-border);
      border-radius: 100px;
      overflow: hidden;
    }

    .confidence-fill {
      height: 100%;
      border-radius: 100px;
      transition: width 0.6s ease;
    }

    .urgency-text {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 0.82rem;
      font-weight: 600;

      mat-icon { font-size: 0.9rem; height: 0.9rem; width: 0.9rem; }
    }

    .explanation {
      font-size: 0.88rem;
      color: var(--color-text-muted);
      line-height: 1.7;
      margin: 0;
    }
  `],
})
export class SeverityCardComponent {
  @Input({ required: true }) severity!:    SeverityLevel;
  @Input({ required: true }) confidence!:  number;
  @Input({ required: true }) explanation!: string;

  get config() { return SEVERITY_CONFIG[this.severity]; }
}
