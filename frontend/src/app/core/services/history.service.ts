// =============================================================
// FILE: core/services/history.service.ts
// PURPOSE: حفظ وجلب الـ history من LocalStorage
// =============================================================

import { Injectable } from '@angular/core';
import { AnalysisRecord } from '../models/analysis.model';

@Injectable({ providedIn: 'root' })
export class HistoryService {

  private readonly STORAGE_KEY = 'symptom_checker_history';
  private readonly MAX_RECORDS = 50;

  load(): AnalysisRecord[] {
    try {
      const raw = localStorage.getItem(this.STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as AnalysisRecord[];
      // بنحول الـ date strings لـ Date objects
      return parsed.map(r => ({
        ...r,
        createdAt:    new Date(r.createdAt),
        result: {
          ...r.result,
          analyzedAt: new Date(r.result.analyzedAt),
        },
        input: {
          ...r.input,
          timestamp: new Date(r.input.timestamp),
        },
      }));
    } catch {
      return [];
    }
  }

  save(record: AnalysisRecord): void {
    try {
      const existing = this.load();
      const updated  = [record, ...existing].slice(0, this.MAX_RECORDS);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch {
      console.warn('Failed to save to history');
    }
  }

  delete(id: string): void {
    try {
      const updated = this.load().filter(r => r.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch {
      console.warn('Failed to delete from history');
    }
  }

  clear(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}
