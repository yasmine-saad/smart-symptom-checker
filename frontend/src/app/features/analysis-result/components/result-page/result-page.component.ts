// =============================================================
// FILE: features/analysis-result/components/result-page/
//       result-page.component.ts
//
// TYPE: Smart Component
// =============================================================

import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Router }       from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

// ── Facade ────────────────────────────────────────────────────
import { AnalysisFacade } from '../../../symptom-input/facade/analysis.facade';

// ── Dumb Components ───────────────────────────────────────────
import { SeverityCardComponent }       from '../severity-card/severity-card.component';
import { SpecialtyCardComponent }      from '../specialty-card/specialty-card.component';
import { RecommendationsListComponent } from '../recommendations-list/recommendations-list.component';
import { EmergencyAlertComponent }     from '../emergency-alert/emergency-alert.component';
import { SeverityBadgeComponent }      from '../../../../shared/components/severity-badge/severity-badge.component';

@Component({
  selector:        'app-result-page',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    SeverityCardComponent,
    SpecialtyCardComponent,
    RecommendationsListComponent,
    EmergencyAlertComponent,
    SeverityBadgeComponent,
  ],
  templateUrl: './result-page.component.html',
  styleUrl:    './result-page.component.scss',
})
export class ResultPageComponent implements OnInit {

  private readonly facade = inject(AnalysisFacade);
  private readonly router = inject(Router);

  // State from Facade
  readonly result            = this.facade.currentResult;
  readonly input             = this.facade.currentInput;
  readonly isEmergency       = this.facade.isEmergency;
  readonly severityConfig    = this.facade.currentSeverityConfig;
  readonly isLoading         = this.facade.isLoading;

  ngOnInit(): void {
    // Guard: لو مفيش نتيجة، ارجع لصفحة الـ input
    if (!this.result()) {
      this.router.navigate(['/']);
    }
  }

  onStartOver(): void {
    this.facade.startOver();
  }

  onReAnalyze(): void {
    this.facade.reAnalyze();
  }
}
