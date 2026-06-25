// =============================================================
// FILE: shared/components/severity-badge/severity-badge.component.ts
// =============================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { SeverityLevel, SEVERITY_CONFIG } from '../../../core/models/severity.enum';

@Component({
  selector:        'app-severity-badge',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule],
  template: `
    <div
      class="badge"
      [class]="'size-' + size"
      [style.background]="config.bgColor"
      [style.border-color]="config.color"
      [attr.aria-label]="'Severity: ' + config.label">
      <span>{{ config.emoji }}</span>
      <span [style.color]="config.color">{{ config.label }}</span>
    </div>
  `,
  styles: [`
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      border: 1.5px solid;
      border-radius: 100px;
      font-weight: 600;
      white-space: nowrap;
    }

    .size-small  { padding: 3px 10px;  font-size: 0.72rem; }
    .size-medium { padding: 5px 14px;  font-size: 0.80rem; }
    .size-large  { padding: 8px 18px;  font-size: 0.95rem; }
  `],
})
export class SeverityBadgeComponent {
  @Input({ required: true }) severity!: SeverityLevel;
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  get config() { return SEVERITY_CONFIG[this.severity]; }
}
