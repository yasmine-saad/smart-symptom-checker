// =============================================================
// FILE: Infrastructure/AI/MockAIProvider.cs
// PURPOSE: Mock implementation للـ IAIProvider
//
// ARCHITECTURAL DECISION:
// الـ Mock بيرجع نفس الـ JSON format اللي هيرجعه OpenAI.
// كده لما نبدل على OpenAI — مش هيحتاج أي تغيير في الـ AnalysisService.
// =============================================================

namespace SmartSymptomChecker.Infrastructure.AI;

using SmartSymptomChecker.Application.Interfaces;

public class MockAIProvider : IAIProvider
{
    public string ProviderName => "MockAI";

    private readonly Random _random = new();

    public Task<string> CompleteAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken cancellationToken = default)
    {
        // محاكاة network delay
        var delayMs = _random.Next(800, 2000);
        Task.Delay(delayMs, cancellationToken);

        var scenario = SelectScenario(userPrompt.ToLower());
        return Task.FromResult(scenario);
    }

    // ──────────────────────────────────────────────────────────
    // SCENARIOS — نفس الـ structure بتاعة OpenAI response
    // ──────────────────────────────────────────────────────────

    private string SelectScenario(string symptoms)
    {
        return symptoms switch
        {
            // Emergency
            var s when ContainsAny(s, "chest pain", "ألم صدر", "can't breathe", "مش قادر أتنفس")
                => EmergencyScenario(),

            // High
            var s when ContainsAny(s, "severe headache", "صداع شديد", "stiff neck", "high fever", "حمى شديدة")
                => HighSeverityScenario(),

            // Medium - Respiratory
            var s when ContainsAny(s, "fever", "حمى", "cough", "سعال", "flu", "انفلونزا", "سخونة")
                => MediumRespiratoryScenario(),

            // Medium - Digestive
            var s when ContainsAny(s, "nausea", "غثيان", "vomiting", "قيء", "stomach", "معدة")
                => MediumDigestiveScenario(),

            // Low
            _ => LowSeverityScenario()
        };
    }

    private static bool ContainsAny(string text, params string[] keywords)
        => keywords.Any(text.Contains);

    // ── JSON Responses ────────────────────────────────────────

    private static string EmergencyScenario() => """
        {
          "severity": "emergency",
          "specialty": "Emergency Medicine",
          "specialtyAr": "طب الطوارئ",
          "explanation": "The symptoms you described may indicate a serious cardiac or pulmonary condition requiring immediate emergency care. Do not delay seeking help.",
          "recommendations": [
            "Call emergency services (123) immediately",
            "Sit upright and remain calm",
            "Do not eat or drink anything",
            "Have someone stay with you",
            "Do not drive yourself to the hospital"
          ],
          "seekEmergencyCare": true,
          "confidence": 0.92
        }
        """;

    private static string HighSeverityScenario() => """
        {
          "severity": "high",
          "specialty": "Neurology",
          "specialtyAr": "طب الأعصاب",
          "explanation": "Severe headache with fever may indicate a serious neurological condition. Immediate medical evaluation is required today. Do not delay.",
          "recommendations": [
            "Go to the nearest emergency room today",
            "Avoid bright lights and loud sounds",
            "Stay hydrated",
            "Do not take pain relievers without consultation",
            "Have someone accompany you"
          ],
          "seekEmergencyCare": false,
          "confidence": 0.85
        }
        """;

    private static string MediumRespiratoryScenario() => """
        {
          "severity": "medium",
          "specialty": "General Medicine",
          "specialtyAr": "الطب العام",
          "explanation": "Your symptoms suggest an upper respiratory tract infection. While manageable, you should see a doctor within 48 hours to rule out bacterial infection.",
          "recommendations": [
            "Rest for the next 2-3 days",
            "Drink plenty of fluids",
            "Take paracetamol for fever as directed",
            "Schedule a doctor visit within 48 hours",
            "Avoid contact with vulnerable people"
          ],
          "seekEmergencyCare": false,
          "confidence": 0.87
        }
        """;

    private static string MediumDigestiveScenario() => """
        {
          "severity": "medium",
          "specialty": "Gastroenterology",
          "specialtyAr": "أمراض الجهاز الهضمي",
          "explanation": "Digestive symptoms lasting more than 24 hours require medical evaluation. Monitor for dehydration signs carefully.",
          "recommendations": [
            "Sip water or electrolyte drinks frequently",
            "Avoid solid food until nausea subsides",
            "Monitor for dehydration signs",
            "See a gastroenterologist within 48 hours",
            "Avoid dairy and fatty foods"
          ],
          "seekEmergencyCare": false,
          "confidence": 0.81
        }
        """;

    private static string LowSeverityScenario() => """
        {
          "severity": "low",
          "specialty": "General Medicine",
          "specialtyAr": "الطب العام",
          "explanation": "Your symptoms appear mild and may be related to fatigue, stress, or dehydration. Rest and proper hydration should help. Monitor symptoms closely.",
          "recommendations": [
            "Get 7-9 hours of sleep",
            "Drink at least 8 glasses of water",
            "Take breaks from screens",
            "Eat balanced meals",
            "See a doctor if symptoms worsen after 3 days"
          ],
          "seekEmergencyCare": false,
          "confidence": 0.78
        }
        """;
}
