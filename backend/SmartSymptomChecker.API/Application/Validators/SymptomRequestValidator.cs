// =============================================================
// FILE: Application/Validators/SymptomRequestValidator.cs
// PURPOSE: Business rules validation بـ FluentValidation
//
// ARCHITECTURAL DECISION — ليه FluentValidation؟
//
// Data Annotations (الـ [Required], [MaxLength]) كويسة للـ basic rules.
// لكن FluentValidation أقوى لـ:
// 1. Complex business rules
// 2. Conditional validation
// 3. Custom error messages
// 4. سهل نعمل unit test عليها
//
// install: dotnet add package FluentValidation.AspNetCore
// =============================================================

namespace SmartSymptomChecker.Application.Validators;

using FluentValidation;
using SmartSymptomChecker.Application.DTOs;

public class SymptomAnalysisRequestValidator : AbstractValidator<SymptomAnalysisRequest>
{
    // الـ Valid body parts المسموح بيها
    private static readonly string[] ValidBodyParts =
    [
        "head", "chest", "abdomen", "back",
        "left_arm", "right_arm", "left_leg", "right_leg",
        "neck", "general"
    ];

    public SymptomAnalysisRequestValidator()
    {
        // ── ProcessedSymptoms ─────────────────────────────────
        RuleFor(x => x.ProcessedSymptoms)
            .NotEmpty()
            .WithMessage("Symptoms description is required")

            .MinimumLength(10)
            .WithMessage("Please describe your symptoms in more detail (minimum 10 characters)")

            .MaximumLength(500)
            .WithMessage("Description is too long (maximum 500 characters)")

            // بنتحقق إن النص مش أرقام فقط
            .Must(text => !System.Text.RegularExpressions.Regex.IsMatch(text.Trim(), @"^\d+$"))
            .WithMessage("Please describe symptoms in words, not numbers");

        // ── Language ──────────────────────────────────────────
        RuleFor(x => x.Language)
            .NotEmpty()
            .WithMessage("Language is required")

            .Must(lang => lang is "en" or "ar")
            .WithMessage("Language must be 'en' (English) or 'ar' (Arabic)");

        // ── Context (optional) ────────────────────────────────
        When(x => x.Context is not null, () =>
        {
            RuleFor(x => x.Context!.Age)
                .InclusiveBetween(1, 120)
                .When(x => x.Context!.Age.HasValue)
                .WithMessage("Age must be between 1 and 120");

            RuleFor(x => x.Context!.DurationDays)
                .InclusiveBetween(0, 365)
                .When(x => x.Context!.DurationDays.HasValue)
                .WithMessage("Duration must be between 0 and 365 days");

            RuleFor(x => x.Context!.BodyPart)
                .Must(part => part is null || ValidBodyParts.Contains(part))
                .WithMessage($"Invalid body part. Valid values: {string.Join(", ", ValidBodyParts)}");
        });
    }
}
