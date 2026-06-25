// =============================================================
// FILE: core/services/loading.service.ts
// =============================================================

import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private _count = 0;

  /** Signal — true لو في أي request جاري */
  readonly isLoading = signal(false);

  show(): void {
    this._count++;
    this.isLoading.set(true);
  }

  hide(): void {
    this._count = Math.max(0, this._count - 1);
    if (this._count === 0) this.isLoading.set(false);
  }
}
