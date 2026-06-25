// =============================================================
// FILE: app.component.ts
//
// PURPOSE: Root component — App Shell
//
// RESPONSIBILITIES:
//   ✅ يعرض الـ router outlet
//   ✅ يعرض الـ global loading bar
//   ✅ يتحكم في الـ app-level state فقط
//
// ARCHITECTURAL DECISION — Minimal App Component:
// الـ App component بيعمل أقل قدر ممكن.
// كل الـ business logic في الـ features.
// =============================================================

import {
  Component,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { RouterOutlet }   from '@angular/router';
import { CommonModule }   from '@angular/common';
import { LoadingService } from './core/services/loading.service';

@Component({
  selector:        'app-root',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [RouterOutlet, CommonModule],
  templateUrl:     './app.component.html',
  styleUrl:        './app.component.scss',
})
export class AppComponent {

  // ── Global loading state ──────────────────────────────────
  readonly isLoading = inject(LoadingService).isLoading;
}
