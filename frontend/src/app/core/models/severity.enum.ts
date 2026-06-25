// =============================================================
// FILE: core/models/severity.enum.ts
// PURPOSE: تعريف مستويات الخطورة الطبية
//
// ARCHITECTURAL DECISION:
// بنفصل الـ enum في ملف منفصل لأن:
// 1. بيتستخدم في أكتر من model
// 2. سهل نعمل تغيير فيه من مكان واحد
// 3. بيمنع circular imports
// =============================================================

/**
 * مستويات الخطورة الطبية بالترتيب التصاعدي.
 * الترتيب مهم — بنستخدمه في المقارنة والـ sorting.
 */
export enum SeverityLevel {
  LOW       = 'low',        // أعراض خفيفة — رعاية منزلية كافية
  MEDIUM    = 'medium',     // أعراض متوسطة — زيارة دكتور خلال يومين
  HIGH      = 'high',       // أعراض شديدة — زيارة عاجلة خلال ساعات
  EMERGENCY = 'emergency',  // طوارئ — اتصل بالإسعاف فوراً
}

// =============================================================
// SEVERITY CONFIG
// بيحدد شكل كل مستوى في الـ UI من مكان واحد.
// لو حبينا نغير لون أو أيقونة — بنغيره هنا بس.
// =============================================================

export interface SeverityConfig {
  level:       SeverityLevel;
  label:       string;        // النص اللي بيتعرض للمستخدم
  labelAr:     string;        // النص بالعربي
  color:       string;        // CSS color
  bgColor:     string;        // Background color
  icon:        string;        // Material icon name
  emoji:       string;
  urgencyText: string;        // نص الإجراء المطلوب
}

export const SEVERITY_CONFIG: Record<SeverityLevel, SeverityConfig> = {
  [SeverityLevel.LOW]: {
    level:       SeverityLevel.LOW,
    label:       'Low',
    labelAr:     'منخفض',
    color:       '#059669',
    bgColor:     'rgba(5, 150, 105, 0.08)',
    icon:        'check_circle',
    emoji:       '🟢',
    urgencyText: 'Rest and monitor symptoms at home',
  },
  [SeverityLevel.MEDIUM]: {
    level:       SeverityLevel.MEDIUM,
    label:       'Medium',
    labelAr:     'متوسط',
    color:       '#d97706',
    bgColor:     'rgba(217, 119, 6, 0.08)',
    icon:        'warning',
    emoji:       '🟡',
    urgencyText: 'Schedule a doctor visit within 48 hours',
  },
  [SeverityLevel.HIGH]: {
    level:       SeverityLevel.HIGH,
    label:       'High',
    labelAr:     'مرتفع',
    color:       '#dc2626',
    bgColor:     'rgba(220, 38, 38, 0.08)',
    icon:        'error',
    emoji:       '🔴',
    urgencyText: 'See a doctor today — do not delay',
  },
  [SeverityLevel.EMERGENCY]: {
    level:       SeverityLevel.EMERGENCY,
    label:       'Emergency',
    labelAr:     'طوارئ',
    color:       '#7f1d1d',
    bgColor:     'rgba(127, 29, 29, 0.1)',
    icon:        'local_hospital',
    emoji:       '🚨',
    urgencyText: 'Call emergency services immediately — 123',
  },
};
