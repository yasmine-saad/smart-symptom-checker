// =============================================================
// FILE: Application/Interfaces/IAIProvider.cs
// PURPOSE: Abstraction layer للـ AI provider
//
// ARCHITECTURAL DECISION — Dependency Inversion Principle:
//
// الـ AnalysisService مش بيعرف إيه الـ AI provider.
// هو بيعمل inject لـ IAIProvider فقط.
//
// النتيجة:
// - بدّل من Mock لـ OpenAI؟ → غيّر سطر واحد في Program.cs
// - عايز تضيف Gemini؟ → اعمل class جديد implement IAIProvider
// - عايز تعمل unit test؟ → inject Mock في الـ test بسهولة
//
// ده بالظبط الـ Open/Closed Principle:
// "Open for extension, Closed for modification"
// =============================================================

namespace SmartSymptomChecker.Application.Interfaces;

using SmartSymptomChecker.Application.DTOs;

/// <summary>
/// Contract لأي AI provider بيتستخدم في التطبيق.
/// سواء Mock أو OpenAI أو Gemini — كلهم بينفذوا الـ interface ده.
/// </summary>
public interface IAIProvider
{
    /// <summary>
    /// بيبعت الـ prompt للـ AI ويرجع النتيجة.
    /// </summary>
    /// <param name="systemPrompt">System instructions للـ AI</param>
    /// <param name="userPrompt">الأعراض والـ context</param>
    /// <param name="cancellationToken">للـ cancellation</param>
    /// <returns>Raw JSON string من الـ AI</returns>
    Task<string> CompleteAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken cancellationToken = default
    );

    /// <summary>
    /// اسم الـ provider — للـ logging والـ debugging.
    /// </summary>
    string ProviderName { get; }
}
