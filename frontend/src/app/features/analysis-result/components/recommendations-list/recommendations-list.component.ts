// =============================================================
// FILE: features/analysis-result/components/recommendations-list/
//       recommendations-list.component.ts
// TYPE: Dumb Component
// =============================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeverityLevel } from '../../../../core/models/severity.enum';

@Component({
  selector:        'app-recommendations-list',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule],
  template: `
    <div class="recommendations">
      <h3 class="rec-title">
        💡 Recommended Actions
      </h3>
      <div class="rec-list">
        @for (rec of recommendations; track rec; let i = $index) {
          <div class="rec-item">
            <span class="rec-num">{{ i + 1 }}</span>
            <span class="rec-text">{{ rec }}</span>
          </div>
        }
      </div>
    </div>
  `,
  styles: [`
    .recommendations {
      background: var(--color-surface);
      border: 1px solid var(--color-border);
      border-radius: 14px;
      padding: 24px;
    }

    .rec-title {
      font-size: 0.95rem;
      font-weight: 600;
      color: var(--color-text);
      margin: 0 0 16px;
    }

    .rec-list { display: flex; flex-direction: column; gap: 10px; }

    .rec-item {
      display: flex;
      align-items: flex-start;
      gap: 12px;
    }

    .rec-num {
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(var(--color-primary-rgb), 0.1);
      color: var(--color-primary);
      font-size: 0.75rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .rec-text {
      font-size: 0.88rem;
      color: var(--color-text);
      line-height: 1.6;
      padding-top: 3px;
    }
  `],
})
export class RecommendationsListComponent {
  @Input({ required: true }) recommendations!: string[];
  @Input({ required: true }) severity!:        SeverityLevel;
}
