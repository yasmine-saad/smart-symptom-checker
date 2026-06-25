// =============================================================
// FILE: Application/DTOs/SymptomAnalysisRequest.cs
// PURPOSE: الـ DTO اللي بييجي من الـ Angular frontend
// =============================================================

using System.ComponentModel.DataAnnotations;

namespace SmartSymptomChecker.Application.DTOs;

/// <summary>
/// الـ Request اللي بيبعته الـ Angular.
/// بنستخدم Data Annotations للـ basic validation
/// وFluentValidation للـ business rules.
/// </summary>
public class SymptomAnalysisRequest
{
    [Required(ErrorMessage = "Symptoms text is required")]
    [MinLength(10, ErrorMessage = "Please describe symptoms in more detail (min 10 characters)")]
    [MaxLength(500, ErrorMessage = "Description too long (max 500 characters)")]
    public string ProcessedSymptoms { get; set; } = string.Empty;

    [Required]
    [RegularExpression("^(en|ar)$", ErrorMessage = "Language must be 'en' or 'ar'")]
    public string Language { get; set; } = "en";

    // اختياري — بيساعد على تحسين دقة التحليل
    public SymptomContext? Context { get; set; }
}

public class SymptomContext
{
    [Range(1, 120, ErrorMessage = "Age must be between 1 and 120")]
    public int? Age { get; set; }

    [Range(0, 365, ErrorMessage = "Duration must be between 0 and 365 days")]
    public int? DurationDays { get; set; }

    public string? BodyPart { get; set; }
}

// =============================================================
// FILE: Application/DTOs/SymptomAnalysisResponse.cs
// PURPOSE: الـ Response اللي بيتبعت للـ Angular
//
// NOTE: نفس namespace بتاع الملف فوق (SmartSymptomChecker.Application.DTOs)
// — C# مش بيسمح بـ file-scoped namespace مرتين في نفس الملف،
// فكل الكلاسات هنا بتفضل تحت نفس namespace السطر 8 من غير ما نكررها.
// =============================================================

/// <summary>
/// الـ Wrapper العام لكل responses.
/// يطابق ApiResponse<T> في الـ Angular.
/// </summary>
public class ApiResponse<T>
{
    public bool Success { get; set; }
    public T? Data { get; set; }
    public ApiError? Error { get; set; }
    public ResponseMeta? Meta { get; set; }

    // ─── Factory Methods ──────────────────────────────────────
    public static ApiResponse<T> Ok(T data, ResponseMeta meta) => new()
    {
        Success = true,
        Data    = data,
        Meta    = meta,
    };

    public static ApiResponse<T> Fail(string code, string message) => new()
    {
        Success = false,
        Error   = new ApiError { Code = code, Message = message },
    };
}

public class ApiError
{
    public string Code    { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public List<string>? Details { get; set; }
}

public class ResponseMeta
{
    public string RequestId    { get; set; } = Guid.NewGuid().ToString();
    public int ProcessingMs    { get; set; }
    public string PromptVersion { get; set; } = string.Empty;
    public bool FromCache      { get; set; }
}

/// <summary>
/// النتيجة الفعلية للتحليل.
/// كل field هنا بيطابق AnalysisResult في الـ Angular.
/// </summary>
public class SymptomAnalysisResult
{
    public string Severity          { get; set; } = string.Empty; // "low"|"medium"|"high"|"emergency"
    public string Specialty         { get; set; } = string.Empty;
    public string SpecialtyAr       { get; set; } = string.Empty;
    public string Explanation       { get; set; } = string.Empty;
    public List<string> Recommendations { get; set; } = [];
    public bool SeekEmergencyCare   { get; set; }
    public double Confidence        { get; set; }
    public DateTime AnalyzedAt      { get; set; } = DateTime.UtcNow;
    public string PromptVersion     { get; set; } = string.Empty;
    public bool FromCache           { get; set; }
}
