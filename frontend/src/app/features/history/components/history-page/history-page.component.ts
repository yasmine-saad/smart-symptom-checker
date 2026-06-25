// =============================================================
// FILE: features/history/components/history-page/
//       history-page.component.ts
//
// TYPE: Smart Component
//
// RESPONSIBILITIES:
//   ✅ يعرض الـ history من الـ Facade
//   ✅ يدير الـ filter state
//   ✅ يتعامل مع الـ delete و re-analyze
//
// WHAT IT DOES NOT DO:
//   ❌ مش بيعمل localStorage مباشرة
//   ❌ مش بيعمل HTTP calls
// =============================================================

import {
  Component,
  inject,
  signal,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule }   from '@angular/common';
import { RouterModule }   from '@angular/router';
import { FormsModule }    from '@angular/forms';
import { MatIconModule }  from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule }   from '@angular/material/tooltip';

import { AnalysisFacade }   from '../../../symptom-input/facade/analysis.facade';
import { HistoryCardComponent } from '../history-card/history-card.component';
import { SkeletonComponent }    from '../../../../shared/components/skeleton/skeleton.component';
import { SeverityBadgeComponent } from '../../../../shared/components/severity-badge/severity-badge.component';

import { AnalysisRecord, HistoryFilter } from '../../../../core/models/analysis.model';
import { SeverityLevel }  from '../../../../core/models/severity.enum';

@Component({
  selector:        'app-history-page',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTooltipModule,
    HistoryCardComponent,
    SkeletonComponent,
    SeverityBadgeComponent,
  ],
  templateUrl: './history-page.component.html',
  styleUrl:    './history-page.component.scss',
})
export class HistoryPageComponent {

  // ============================================================
  // ── DEPENDENCIES ──────────────────────────────────────────────
  // ============================================================

  private readonly facade = inject(AnalysisFacade);

  // ============================================================
  // ── FILTER STATE (Local Signals) ──────────────────────────────
  // ============================================================

  /** فلتر الـ severity المختار */
  readonly filterSeverity = signal<SeverityLevel | 'all'>('all');

  /** فلتر البحث النصي */
  readonly searchText     = signal('');

  // ============================================================
  // ── DATA FROM FACADE ──────────────────────────────────────────
  // ============================================================

  readonly allRecords    = this.facade.records;
  readonly recordsCount  = this.facade.recordsCount;
  readonly averageRating = this.facade.averageRating;

  // ============================================================
  // ── COMPUTED ──────────────────────────────────────────────────
  // ============================================================

  /**
   * الـ records بعد تطبيق الـ filters.
   * بيتحسب أوتوماتيك لما أي signal يتغير.
   */
  readonly filteredRecords = computed(() => {
    let records = this.allRecords();

    // ── فلتر الـ severity ──────────────────────────────────
    const severity = this.filterSeverity();
    if (severity !== 'all') {
      records = records.filter(r => r.result.severity === severity);
    }

    // ── فلتر البحث النصي ──────────────────────────────────
    const search = this.searchText().toLowerCase().trim();
    if (search) {
      records = records.filter(r =>
        r.input.textInput.toLowerCase().includes(search) ||
        r.result.specialty.toLowerCase().includes(search) ||
        r.result.specialtyAr.includes(search)
      );
    }

    return records;
  });

  /** هل في فلتر مفعّل؟ */
  readonly hasActiveFilter = computed(() =>
    this.filterSeverity() !== 'all' || this.searchText().length > 0
  );

  /** إحصائيات سريعة */
  readonly stats = computed(() => {
    const records = this.allRecords();
    return {
      total:     records.length,
      emergency: records.filter(r => r.result.severity === SeverityLevel.EMERGENCY).length,
      high:      records.filter(r => r.result.severity === SeverityLevel.HIGH).length,
      medium:    records.filter(r => r.result.severity === SeverityLevel.MEDIUM).length,
      low:       records.filter(r => r.result.severity === SeverityLevel.LOW).length,
    };
  });

  // ============================================================
  // ── SEVERITY OPTIONS ──────────────────────────────────────────
  // ============================================================

  readonly severityOptions = [
    { value: 'all',                    label: 'All Severities' },
    { value: SeverityLevel.EMERGENCY,  label: '🚨 Emergency'   },
    { value: SeverityLevel.HIGH,       label: '🔴 High'         },
    { value: SeverityLevel.MEDIUM,     label: '🟡 Medium'       },
    { value: SeverityLevel.LOW,        label: '🟢 Low'          },
  ];

  // ============================================================
  // ── ACTIONS ───────────────────────────────────────────────────
  // ============================================================

  onReAnalyze(record: AnalysisRecord): void {
    this.facade.reAnalyzeFromRecord(record);
  }

  onDelete(id: string): void {
    this.facade.deleteRecord(id);
  }

  clearFilters(): void {
    this.filterSeverity.set('all');
    this.searchText.set('');
  }
}
