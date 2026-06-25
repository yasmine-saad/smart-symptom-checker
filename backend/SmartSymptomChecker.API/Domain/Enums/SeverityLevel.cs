// =============================================================
// FILE: Domain/Enums/SeverityLevel.cs
// PURPOSE: نفس الـ SeverityLevel بس في الـ .NET backend
// =============================================================

namespace SmartSymptomChecker.Domain.Enums;

/// <summary>
/// مستويات الخطورة الطبية.
/// لازم يطابق بالظبط الـ SeverityLevel في الـ Angular frontend.
/// </summary>
public enum SeverityLevel
{
    Low       = 0,
    Medium    = 1,
    High      = 2,
    Emergency = 3,
}
