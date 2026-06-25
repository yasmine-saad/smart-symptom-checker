// =============================================================
// FILE: shared/components/skeleton/skeleton.component.ts
// =============================================================

import {
  Component, Input, ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector:        'app-skeleton',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="skeleton"
      [style.width]="width"
      [style.height]="height"
      [style.border-radius]="radius"
      role="status"
      aria-label="Loading...">
    </div>
  `,
  styles: [`
    .skeleton {
      display: block;
      background: linear-gradient(
        90deg,
        var(--color-border)   25%,
        rgba(255,255,255,.08) 50%,
        var(--color-border)   75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    @keyframes shimmer {
      0%   { background-position:  200% 0; }
      100% { background-position: -200% 0; }
    }
  `],
})
export class SkeletonComponent {
  @Input() width  = '100%';
  @Input() height = '20px';
  @Input() radius = '6px';
}
