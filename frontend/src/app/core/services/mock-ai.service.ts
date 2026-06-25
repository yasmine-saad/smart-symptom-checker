// =============================================================
// FILE: core/services/mock-ai.service.ts
// PURPOSE: يحاكي الـ AI response في بيئة التطوير
//
// ARCHITECTURAL DECISION — ليه Mock Service؟
//
// في التطوير، مش دايماً عندنا:
//   - OpenAI API key
//   - إنترنت
//   - Backend شغال
//
// الـ Mock بيسمحلنا نطور الـ UI كاملة بدون أي dependency خارجية.
//
// DESIGN PATTERN — Strategy Pattern:
// الـ AnalysisApiService مش عارف هو بيكلم Mock أو Real API.
// بنغير السلوك من environment.ts بس.
//
// environment.ts:
//   useMockAI: true   → MockAIService
//   useMockAI: false  → Real .NET API
// =============================================================

import { Injectable } from '@angular/core';
import { Observable, of, delay, throwError } from 'rxjs';

import { AnalysisResult }        from '../models/analysis.model';
import { SeverityLevel }         from '../models/severity.enum';
import { ApiResponse }           from '../models/api-response.model';
import { SymptomAnalysisRequest } from '../models/api-response.model';
import { CURRENT_PROMPT_VERSION } from '../../features/symptom-input/services/prompt-builder.service';

// ============================================================
// MOCK DATABASE
// سيناريوهات طبية واقعية لكل مستوى خطورة.
// بنستخدمها عشان الـ UI يبان realistic أثناء التطوير.
// ============================================================

interface MockScenario {
  keywords:    string[];     // كلمات بنبحث عنها في الأعراض
  result:      Omit<AnalysisResult, 'analyzedAt' | 'promptVersion' | 'fromCache'>;
}

const MOCK_SCENARIOS: MockScenario[] = [

  // ── EMERGENCY ────────────────────────────────────────────
  {
    keywords: ['chest pain', 'ألم صدر', 'heart', 'قلب', 'can\'t breathe', 'مش قادر أتنفس'],
    result: {
      severity:          SeverityLevel.EMERGENCY,
      specialty:         'Emergency Medicine',
      specialtyAr:       'طب الطوارئ',
      explanation:       'The symptoms you described — particularly chest pain with breathing difficulty — may indicate a serious cardiac or pulmonary condition. Immediate emergency care is critical. Do not drive yourself to the hospital.',
      recommendations: [
        'Call emergency services (123) immediately',
        'Sit upright and stay calm',
        'Do not eat or drink anything',
        'If you have aspirin and are not allergic, chew one tablet (325mg)',
        'Have someone stay with you until help arrives',
      ],
      seekEmergencyCare: true,
      confidence:        0.91,
    },
  },

  // ── HIGH ─────────────────────────────────────────────────
  {
    keywords: ['high fever', 'حمى شديدة', 'stiff neck', 'تصلب رقبة', 'severe headache', 'صداع شديد'],
    result: {
      severity:          SeverityLevel.HIGH,
      specialty:         'Neurology',
      specialtyAr:       'طب الأعصاب',
      explanation:       'Severe headache combined with neck stiffness and high fever can be signs of meningitis or other serious neurological conditions. This requires urgent medical evaluation today — do not delay.',
      recommendations: [
        'Go to the nearest emergency room today',
        'Avoid bright lights and loud noises',
        'Do not take pain relievers without medical supervision',
        'Stay hydrated with small sips of water',
        'Have someone accompany you to the hospital',
      ],
      seekEmergencyCare: false,
      confidence:        0.84,
    },
  },

  // ── HIGH (Abdominal) ─────────────────────────────────────
  {
    keywords: ['sharp abdominal', 'ألم بطن حاد', 'appendix', 'زائدة', 'right side pain', 'ألم جانب أيمن'],
    result: {
      severity:          SeverityLevel.HIGH,
      specialty:         'General Surgery',
      specialtyAr:       'الجراحة العامة',
      explanation:       'Sharp pain in the lower right abdomen could indicate appendicitis, which is a medical emergency if left untreated. You need an immediate clinical examination and imaging.',
      recommendations: [
        'Go to emergency room immediately',
        'Do not eat or drink anything',
        'Avoid pain medications that might mask symptoms',
        'Note when the pain started and if it\'s getting worse',
      ],
      seekEmergencyCare: true,
      confidence:        0.78,
    },
  },

  // ── MEDIUM ───────────────────────────────────────────────
  {
    keywords: ['fever', 'حمى', 'cough', 'سعال', 'cold', 'زكام', 'flu', 'انفلونزا', 'سخونة'],
    result: {
      severity:          SeverityLevel.MEDIUM,
      specialty:         'General Medicine',
      specialtyAr:       'الطب العام',
      explanation:       'Your symptoms suggest an upper respiratory tract infection, possibly influenza or a severe cold. While this is manageable, you should see a doctor within 48 hours to rule out bacterial infection and get appropriate treatment.',
      recommendations: [
        'Rest as much as possible for the next 2-3 days',
        'Drink plenty of fluids (water, warm broth)',
        'Take paracetamol for fever (as directed on package)',
        'Schedule a doctor visit within 48 hours',
        'Monitor temperature every 4 hours',
        'Avoid contact with vulnerable people (elderly, children)',
      ],
      seekEmergencyCare: false,
      confidence:        0.88,
    },
  },

  // ── MEDIUM (Digestive) ───────────────────────────────────
  {
    keywords: ['stomach', 'معدة', 'nausea', 'غثيان', 'vomiting', 'قيء', 'diarrhea', 'إسهال'],
    result: {
      severity:          SeverityLevel.MEDIUM,
      specialty:         'Gastroenterology',
      specialtyAr:       'أمراض الجهاز الهضمي',
      explanation:       'Nausea, vomiting, or digestive distress lasting more than 24 hours should be evaluated by a gastroenterologist. Dehydration is a serious risk — monitor your fluid intake closely.',
      recommendations: [
        'Take small, frequent sips of water or electrolyte drinks',
        'Avoid solid food until nausea subsides',
        'Monitor for signs of dehydration (dark urine, dizziness)',
        'See a gastroenterologist within 48 hours',
        'Avoid dairy, fatty, and spicy foods',
      ],
      seekEmergencyCare: false,
      confidence:        0.82,
    },
  },

  // ── LOW ──────────────────────────────────────────────────
  {
    keywords: ['mild headache', 'صداع خفيف', 'tired', 'تعب', 'fatigue', 'إجهاد', 'stress', 'ضغط'],
    result: {
      severity:          SeverityLevel.LOW,
      specialty:         'General Medicine',
      specialtyAr:       'الطب العام',
      explanation:       'Your symptoms appear mild and are likely related to stress, fatigue, or dehydration. Rest and proper hydration should help. If symptoms persist for more than 3 days or worsen, consult a doctor.',
      recommendations: [
        'Get 7-9 hours of sleep tonight',
        'Drink at least 8 glasses of water today',
        'Take a 15-minute break from screens',
        'Eat a balanced meal if you haven\'t already',
        'Try light stretching or a short walk',
        'Monitor symptoms — see a doctor if they worsen after 3 days',
      ],
      seekEmergencyCare: false,
      confidence:        0.79,
    },
  },
];

// ── DEFAULT (لو مش لقينا match) ──────────────────────────────
const DEFAULT_SCENARIO: MockScenario['result'] = {
  severity:          SeverityLevel.MEDIUM,
  specialty:         'General Medicine',
  specialtyAr:       'الطب العام',
  explanation:       'Based on your described symptoms, we recommend consulting a general practitioner for a thorough evaluation. A proper physical examination is needed to provide accurate guidance.',
  recommendations: [
    'Schedule an appointment with a general practitioner',
    'Keep track of when symptoms started and their progression',
    'Note any factors that make symptoms better or worse',
    'Bring a list of any current medications',
    'Stay hydrated and get adequate rest',
  ],
  seekEmergencyCare: false,
  confidence:        0.65,
};

// ============================================================
// SERVICE
// ============================================================

@Injectable({ providedIn: 'root' })
export class MockAIService {

  // ── Configurable delays لمحاكاة الـ network ──────────────
  private readonly MIN_DELAY_MS = 1200;
  private readonly MAX_DELAY_MS = 2800;

  /**
   * يحاكي الـ API call ويرجع response واقعي.
   * الـ delay العشوائي بيجعل الـ UX يشبه الـ real API.
   */
  analyze(request: SymptomAnalysisRequest): Observable<ApiResponse<AnalysisResult>> {
    const delayMs = this.randomDelay();

    // محاكاة network error (5% من الوقت) — لاختبار الـ error handling
    if (Math.random() < 0.05) {
      return throwError(() => new Error('network error')).pipe(
        delay(delayMs)
      );
    }

    const result = this.buildResult(request);
    const response: ApiResponse<AnalysisResult> = {
      success: true,
      data:    result,
      meta: {
        requestId:     `mock-${Date.now()}`,
        processingMs:  delayMs,
        promptVersion: CURRENT_PROMPT_VERSION,
        fromCache:     false,
      },
    };

    return of(response).pipe(delay(delayMs));
  }

  // ──────────────────────────────────────────────────────────
  // PRIVATE HELPERS
  // ──────────────────────────────────────────────────────────

  private buildResult(request: SymptomAnalysisRequest): AnalysisResult {
    const scenario = this.findMatchingScenario(request.processedSymptoms);

    return {
      ...scenario,
      analyzedAt:    new Date(),
      promptVersion: CURRENT_PROMPT_VERSION,
      fromCache:     false,
    };
  }

  private findMatchingScenario(
    symptoms: string
  ): Omit<AnalysisResult, 'analyzedAt' | 'promptVersion' | 'fromCache'> {
    const lowerSymptoms = symptoms.toLowerCase();

    // بندور على أول scenario بيطابق الأعراض
    const match = MOCK_SCENARIOS.find(scenario =>
      scenario.keywords.some(keyword =>
        lowerSymptoms.includes(keyword.toLowerCase())
      )
    );

    return match?.result ?? DEFAULT_SCENARIO;
  }

  private randomDelay(): number {
    return Math.floor(
      Math.random() * (this.MAX_DELAY_MS - this.MIN_DELAY_MS) + this.MIN_DELAY_MS
    );
  }
}
