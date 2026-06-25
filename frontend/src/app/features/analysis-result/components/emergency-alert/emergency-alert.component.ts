// =============================================================
// FILE: features/analysis-result/components/emergency-alert/
//       emergency-alert.component.ts
// TYPE: Dumb Component — بيتعرض بس لو seekEmergencyCare = true
// =============================================================

import {
  Component, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector:        'app-emergency-alert',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, MatIconModule],
  template: `
    <div class="emergency-alert" role="alert" aria-live="assertive">
      <div class="alert-content">
        <div class="alert-icon">🚨</div>
        <div>
          <div class="alert-title">Emergency Medical Attention Required</div>
          <div class="alert-text">
            Based on your symptoms, you may need immediate medical care.
            Please call <strong>emergency services (123)</strong> or go to the nearest
            emergency room immediately.
          </div>
        </div>
      </div>
      <a class="call-btn" href="tel:123">
        <mat-icon>phone</mat-icon>
        Call 123
      </a>
    </div>
  `,
  styles: [`
    .emergency-alert {
      background: #7f1d1d;
      color: white;
      padding: 18px 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      animation: pulse-bg 2s infinite;
    }

    @keyframes pulse-bg {
      0%, 100% { background: #7f1d1d; }
      50% { background: #991b1b; }
    }

    .alert-content {
      display: flex;
      align-items: flex-start;
      gap: 14px;
    }

    .alert-icon { font-size: 1.5rem; line-height: 1; flex-shrink: 0; }

    .alert-title {
      font-weight: 700;
      font-size: 0.95rem;
      margin-bottom: 4px;
    }

    .alert-text {
      font-size: 0.82rem;
      opacity: 0.9;
      line-height: 1.5;
    }

    .call-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 10px 20px;
      background: white;
      color: #7f1d1d;
      border-radius: 8px;
      font-weight: 700;
      font-size: 0.9rem;
      text-decoration: none;
      white-space: nowrap;
      flex-shrink: 0;
      transition: opacity 0.2s;

      mat-icon { font-size: 1rem; height: 1rem; width: 1rem; }
      &:hover { opacity: 0.9; }
    }

    @media (max-width: 600px) {
      .emergency-alert { flex-direction: column; }
      .call-btn { width: 100%; justify-content: center; }
    }
  `],
})
export class EmergencyAlertComponent {}
