// =============================================================
// FILE: Application/Services/PromptBuilderService.cs
// PURPOSE: بيبني الـ AI Prompt في الـ backend
//
// ARCHITECTURAL DECISION:
// بنبني الـ prompt في الـ backend مش الـ frontend عشان:
// 1. أمان — المستخدم مش بيشوف الـ system prompt
// 2. سهل نعدّل الـ prompt من غير ما نعمل deploy للـ frontend
// 3. الـ prompt versioning بيتتحكم فيه من مكان واحد
// =============================================================

namespace SmartSymptomChecker.Application.Services;

using SmartSymptomChecker.Application.DTOs;

public interface IPromptBuilderService
{
    BuiltPrompt Build(SymptomAnalysisRequest request);
}

public record BuiltPrompt(
    string SystemPrompt,
    string UserPrompt,
    string Version
);

public class PromptBuilderService : IPromptBuilderService
{
    // ── Prompt Versioning ─────────────────────────────────────
    private const string CURRENT_VERSION = "v1.2";

    public BuiltPrompt Build(SymptomAnalysisRequest request)
    {
        return new BuiltPrompt(
            SystemPrompt: BuildSystemPrompt(request.Language),
            UserPrompt:   BuildUserPrompt(request),
            Version:      CURRENT_VERSION
        );
    }

    // ──────────────────────────────────────────────────────────
    // SYSTEM PROMPT
    // ──────────────────────────────────────────────────────────

    private static string BuildSystemPrompt(string language)
    {
        var responseLanguage = language == "ar" ? "Arabic" : "English";

        // ملحوظة: مش بنستخدم $""" (interpolated raw string) هنا لأن
        // الـ JSON schema تحت فيه { } كتير، ولو الـ string interpolated
        // C# هيحاول يفسر كل { } كـ expression ويوقع الـ build.
        // الحل: raw string عادي + Replace() للـ placeholder بس.
        const string template = """
            You are a medical triage assistant for a HealthTech platform.

            CRITICAL RULES (MUST FOLLOW):
            1. You NEVER diagnose. You ONLY perform triage assessment.
            2. Always recommend consulting a real doctor.
            3. When in doubt, increase severity level.
            4. For any chest pain or breathing difficulty: always set severity to "high" or "emergency".
            5. Write the "explanation" and "recommendations" in {{RESPONSE_LANGUAGE}}.

            RESPONSE FORMAT:
            You MUST respond with ONLY valid JSON matching this exact schema.
            No markdown, no code blocks, no extra text — ONLY the JSON object.

            {
              "severity": "low" | "medium" | "high" | "emergency",
              "specialty": "English specialty name",
              "specialtyAr": "اسم التخصص بالعربي",
              "explanation": "Clear explanation in {{RESPONSE_LANGUAGE}} (max 120 words)",
              "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
              "seekEmergencyCare": true | false,
              "confidence": 0.0 to 1.0
            }

            SEVERITY GUIDELINES:
            - "low": Minor symptoms, manageable at home
            - "medium": Needs medical attention within 48 hours
            - "high": Needs medical attention today
            - "emergency": Call emergency services immediately

            SPECIALTIES (use exact English names):
            Cardiology, Neurology, Gastroenterology, Pulmonology, Orthopedics,
            Dermatology, Psychiatry, Ophthalmology, ENT, General Medicine,
            Urology, Endocrinology, Rheumatology, Nephrology, Emergency Medicine
            """;

        return template.Replace("{{RESPONSE_LANGUAGE}}", responseLanguage);
    }

    // ──────────────────────────────────────────────────────────
    // USER PROMPT
    // ──────────────────────────────────────────────────────────

    private static string BuildUserPrompt(SymptomAnalysisRequest request)
    {
        var parts = new List<string>
        {
            $"Patient symptoms: {request.ProcessedSymptoms}"
        };

        if (request.Context is not null)
        {
            if (request.Context.Age.HasValue)
                parts.Add($"Patient age: {request.Context.Age} years");

            if (request.Context.DurationDays.HasValue && request.Context.DurationDays > 0)
            {
                var duration = request.Context.DurationDays == 1
                    ? "1 day"
                    : $"{request.Context.DurationDays} days";
                parts.Add($"Duration: {duration}");
            }

            if (!string.IsNullOrWhiteSpace(request.Context.BodyPart))
                parts.Add($"Location: {request.Context.BodyPart.Replace("_", " ")}");
        }

        parts.Add("\nRespond with ONLY the JSON object. No other text.");

        return string.Join("\n", parts);
    }
}
