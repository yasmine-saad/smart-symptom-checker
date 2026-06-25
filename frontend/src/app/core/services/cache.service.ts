// =============================================================
// FILE: core/services/cache.service.ts
// PURPOSE: Caching للـ AI responses بـ TTL
//
// ARCHITECTURAL DECISION:
// الـ AI API calls مكلفة (وقت + cost).
// نفس الأعراض في نفس الـ session = نرجع الـ cache.
// TTL = 30 دقيقة — بعدها الـ cache بيتمسح.
// =============================================================

import { Injectable } from '@angular/core';
import { AnalysisResult } from '../models/analysis.model';

interface CacheEntry {
  result:    AnalysisResult;
  storedAt:  number;  // timestamp
}

@Injectable({ providedIn: 'root' })
export class CacheService {

  private readonly cache = new Map<string, CacheEntry>();

  /** 30 دقيقة بالـ milliseconds */
  private readonly TTL_MS = 30 * 60 * 1000;

  get(key: string): AnalysisResult | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // ✅ تحقق من الـ TTL
    if (Date.now() - entry.storedAt > this.TTL_MS) {
      this.cache.delete(key);
      return null;
    }

    return entry.result;
  }

  set(key: string, result: AnalysisResult): void {
    this.cache.set(key, { result, storedAt: Date.now() });
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  clear(): void {
    this.cache.clear();
  }

  /** بيمسح الـ entries اللي انتهى TTL بتاعهم */
  cleanup(): void {
    const now = Date.now();
    this.cache.forEach((entry, key) => {
      if (now - entry.storedAt > this.TTL_MS) {
        this.cache.delete(key);
      }
    });
  }
}
