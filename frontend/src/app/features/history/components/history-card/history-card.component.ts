// =============================================================
// FILE: features/history/components/history-card/
//       history-card.component.ts
//
// TYPE: Dumb Component (Presentational)
//
// RESPONSIBILITIES:
//   ✅ يعرض record واحد من الـ history
//   ✅ يعمل emit للـ re-analyze والـ delete
//
// WHAT IT DOES NOT DO:
//   ❌ مش بيعرف HistoryService
//   ❌ مش بيعمل أي state changes
// =============================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule }   from '@angular/common';
import { MatIconModule }  from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AnalysisRecord }       from '../../../../core/models/analysis.model';
import { SEVERITY_CONFIG }      from '../../../../core/models/severity.enum';
import { SeverityBadgeComponent } from '../../../../shared/components/severity-badge/severity-badge.component';

@Component({
  selector:        'app-history-card',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    MatIconModule,
    MatTooltipModule,
    SeverityBadgeComponent,
  ],
  templateUrl: './history-card.component.html',
  styleUrl:    './history-card.component.scss',
})
export class HistoryCardComponent {

  @Input({ required: true }) record!: AnalysisRecord;

  @Output() reAnalyze = new EventEmitter<AnalysisRecord>();
  @Output() delete    = new EventEmitter<string>();

  // ── Helpers ───────────────────────────────────────────────────

  get severityConfig() {
    return SEVERITY_CONFIG[this.record.result.severity];
  }

  get truncatedText(): string {
    const text = this.record.input.textInput;
    return text.length > 120 ? text.slice(0, 120) + '...' : text;
  }

  onReAnalyze(): void {
    this.reAnalyze.emit(this.record);
  }

  onDelete(): void {
    // بنتأكد من المستخدم قبل الحذف
    if (confirm('Delete this analysis record?')) {
      this.delete.emit(this.record.id);
    }
  }
}
