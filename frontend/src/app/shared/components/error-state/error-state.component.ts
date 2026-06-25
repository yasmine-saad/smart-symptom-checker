// =============================================================
// FILE: shared/components/error-state/error-state.component.ts
// =============================================================

import {
  Component, Input, Output, EventEmitter, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule }  from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector:        'app-error-state',
  standalone:      true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports:         [CommonModule, MatIconModule],
  templateUrl:     './error-state.component.html',
  styleUrl:        './error-state.component.scss',
})
export class ErrorStateComponent {
  @Input({ required: true }) message!:  string;
  @Input() retryable = true;
  @Output() retry    = new EventEmitter<void>();
}
