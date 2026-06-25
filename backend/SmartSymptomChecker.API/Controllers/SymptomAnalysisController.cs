// =============================================================
// FILE: Controllers/SymptomAnalysisController.cs
// PURPOSE: HTTP endpoint — بس بيستقبل ويبعت
//
// ARCHITECTURAL DECISION — Thin Controller:
//
// الـ Controller مسؤوليته الوحيدة:
// 1. استقبال الـ HTTP request
// 2. تحويله لـ DTO
// 3. تمريره للـ Service
// 4. إرجاع الـ response
//
// أي business logic في الـ Controller = WRONG.
// =============================================================

namespace SmartSymptomChecker.API.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using SmartSymptomChecker.Application.DTOs;
using SmartSymptomChecker.Application.Services;
using SmartSymptomChecker.Infrastructure.RateLimiting;

// ✅ بدّل [controller] بالاسم صريح
[ApiController]
[Route("api/symptom-analysis")]  // ← explicit route
[Produces("application/json")]
public class SymptomAnalysisController : ControllerBase
{
    private readonly IAnalysisService _analysisService;
    private readonly ILogger<SymptomAnalysisController> _logger;

    public SymptomAnalysisController(
        IAnalysisService analysisService,
        ILogger<SymptomAnalysisController> logger)
    {
        _analysisService = analysisService;
        _logger          = logger;
    }

    /// <summary>
    /// Analyzes symptoms and returns medical triage assessment.
    /// </summary>
    /// <param name="request">Symptom description and context</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Triage result with severity, specialty, and recommendations</returns>
    [HttpPost]
    [EnableRateLimiting(RateLimitPolicy.SYMPTOM_ANALYSIS)]
    [ProducesResponseType(typeof(ApiResponse<SymptomAnalysisResult>), 200)]
    [ProducesResponseType(typeof(ApiResponse<object>),               400)]
    [ProducesResponseType(typeof(ApiResponse<object>),               429)]
    [ProducesResponseType(typeof(ApiResponse<object>),               500)]
    public async Task<IActionResult> Analyze(
        [FromBody] SymptomAnalysisRequest request,
        CancellationToken cancellationToken)
    {
        // ModelState validation (Data Annotations + FluentValidation)
        if (!ModelState.IsValid)
        {
            var errors = ModelState.Values
                .SelectMany(v => v.Errors)
                .Select(e => e.ErrorMessage)
                .ToList();

            return BadRequest(ApiResponse<object>.Fail("VALIDATION_ERROR", errors.First()));
        }

        _logger.LogInformation(
            "Symptom analysis request received. Language: {Lang}",
            request.Language
        );

        var result = await _analysisService.AnalyzeAsync(request, cancellationToken);

        return result.Success ? Ok(result) : StatusCode(500, result);
    }
}
