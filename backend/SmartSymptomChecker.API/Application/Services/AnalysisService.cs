// =============================================================
// FILE: Application/Services/AnalysisService.cs
// PURPOSE: Orchestrates the full analysis flow
//
// ARCHITECTURAL DECISION — Application Service:
//
// الـ Controller بيستقبل الـ HTTP request بس.
// الـ AnalysisService هو اللي بيعمل كل الـ business logic.
//
// الـ flow:
// Controller → AnalysisService → IAIProvider
//                              → PromptBuilder
//                              → ResponseParser
// =============================================================

namespace SmartSymptomChecker.Application.Services;

using System.Text.Json;
using System.Diagnostics;
using Microsoft.Extensions.Logging;
using SmartSymptomChecker.Application.DTOs;
using SmartSymptomChecker.Application.Interfaces;

public interface IAnalysisService
{
    Task<ApiResponse<SymptomAnalysisResult>> AnalyzeAsync(
        SymptomAnalysisRequest request,
        CancellationToken cancellationToken = default
    );
}

public class AnalysisService : IAnalysisService
{
    private readonly IAIProvider          _aiProvider;
    private readonly IPromptBuilderService _promptBuilder;
    private readonly ILogger<AnalysisService> _logger;

    // ✅ Constructor injection — standard .NET pattern
    public AnalysisService(
        IAIProvider           aiProvider,
        IPromptBuilderService promptBuilder,
        ILogger<AnalysisService> logger)
    {
        _aiProvider    = aiProvider;
        _promptBuilder = promptBuilder;
        _logger        = logger;
    }

    public async Task<ApiResponse<SymptomAnalysisResult>> AnalyzeAsync(
        SymptomAnalysisRequest request,
        CancellationToken cancellationToken = default)
    {
        var stopwatch = Stopwatch.StartNew();

        try
        {
            // ── Step 1: Build Prompt ──────────────────────────
            var prompt = _promptBuilder.Build(request);

            _logger.LogInformation(
                "Analyzing symptoms. Provider: {Provider}, Version: {Version}",
                _aiProvider.ProviderName,
                prompt.Version
            );

            // ── Step 2: Call AI Provider ──────────────────────
            var rawJson = await _aiProvider.CompleteAsync(
                prompt.SystemPrompt,
                prompt.UserPrompt,
                cancellationToken
            );

            // ── Step 3: Parse Response ────────────────────────
            var result = ParseResponse(rawJson, prompt.Version);

            stopwatch.Stop();
            _logger.LogInformation(
                "Analysis completed in {Ms}ms. Severity: {Severity}",
                stopwatch.ElapsedMilliseconds,
                result.Severity
            );

            return ApiResponse<SymptomAnalysisResult>.Ok(
                result,
                new ResponseMeta
                {
                    ProcessingMs  = (int)stopwatch.ElapsedMilliseconds,
                    PromptVersion = prompt.Version,
                    FromCache     = false,
                }
            );
        }
        catch (JsonException ex)
        {
            _logger.LogError(ex, "Failed to parse AI response");
            return ApiResponse<SymptomAnalysisResult>.Fail(
                "PARSE_ERROR",
                "Failed to process AI response. Please try again."
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Analysis failed");
            return ApiResponse<SymptomAnalysisResult>.Fail(
                "ANALYSIS_ERROR",
                "Analysis failed. Please try again."
            );
        }
    }

    // ──────────────────────────────────────────────────────────
    // PRIVATE: Response Parser
    // ──────────────────────────────────────────────────────────

    private static SymptomAnalysisResult ParseResponse(string rawJson, string promptVersion)
    {
        // بنعمل trim للـ JSON لو الـ AI حط markdown حواليه
        var cleanJson = rawJson.Trim();
        if (cleanJson.StartsWith("```"))
        {
            // إزالة ```json ... ```
            cleanJson = cleanJson
                .Replace("```json", "")
                .Replace("```", "")
                .Trim();
        }

        var options = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
        };

        var parsed = JsonSerializer.Deserialize<SymptomAnalysisResult>(cleanJson, options)
            ?? throw new JsonException("Deserialized result was null");

        // ✅ Validation
        ValidateParsedResult(parsed);

        parsed.PromptVersion = promptVersion;
        parsed.AnalyzedAt    = DateTime.UtcNow;

        return parsed;
    }

    private static void ValidateParsedResult(SymptomAnalysisResult result)
    {
        var validSeverities = new[] { "low", "medium", "high", "emergency" };

        if (!validSeverities.Contains(result.Severity))
            throw new JsonException($"Invalid severity value: {result.Severity}");

        if (string.IsNullOrWhiteSpace(result.Specialty))
            throw new JsonException("Missing specialty field");

        if (result.Recommendations is null || result.Recommendations.Count == 0)
            throw new JsonException("Missing recommendations");

        if (result.Confidence is < 0 or > 1)
            throw new JsonException($"Invalid confidence value: {result.Confidence}");
    }
}
