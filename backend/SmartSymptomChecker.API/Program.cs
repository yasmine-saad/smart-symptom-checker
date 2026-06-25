// =============================================================
// FILE: Program.cs
// PURPOSE: Application setup و Dependency Injection configuration
//
// ARCHITECTURAL DECISION:
// كل الـ registrations في مكان واحد — سهل تشوف كل حاجة.
// بنستخدم sections منظمة عشان يبقى readable.
// =============================================================

using FluentValidation;
using FluentValidation.AspNetCore;
using SmartSymptomChecker.Application.Interfaces;
using SmartSymptomChecker.Application.Services;
using SmartSymptomChecker.Application.Validators;
using SmartSymptomChecker.Infrastructure.AI;
using SmartSymptomChecker.Infrastructure.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// ============================================================
// ── CONTROLLERS ───────────────────────────────────────────────
// ============================================================

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title       = "AI Symptom Checker API",
        Version     = "v1",
        Description = "Medical triage assistant — NOT a diagnostic tool"
    });
});

// ============================================================
// ── VALIDATION (FluentValidation) ────────────────────────────
// ============================================================

builder.Services
    .AddFluentValidationAutoValidation()
    .AddValidatorsFromAssemblyContaining<SymptomAnalysisRequestValidator>();

// ============================================================
// ── APPLICATION SERVICES ──────────────────────────────────────
// ============================================================

builder.Services.AddScoped<IAnalysisService,    AnalysisService>();
builder.Services.AddScoped<IPromptBuilderService, PromptBuilderService>();

// ============================================================
// ── AI PROVIDER ───────────────────────────────────────────────
//
// ⭐ هنا بنحدد إيه الـ AI provider.
// بدّل على MockAIProvider للتطوير.
// بدّل على OpenAIProvider للـ production.
// ============================================================

var useMockAI = builder.Configuration.GetValue<bool>("AI:UseMock", defaultValue: true);

if (useMockAI)
{
    builder.Services.AddScoped<IAIProvider, MockAIProvider>();
}
else
{
    // OpenAI Provider + HttpClient
    builder.Services.AddHttpClient<OpenAIProvider>();
    builder.Services.AddScoped<IAIProvider, OpenAIProvider>();
}

// ============================================================
// ── RATE LIMITING ─────────────────────────────────────────────
// ============================================================

builder.Services.AddRateLimiter(RateLimitPolicy.Configure);

// ============================================================
// ── CORS ──────────────────────────────────────────────────────
// ============================================================

builder.Services.AddCors(options =>
    options.AddPolicy("Angular", policy =>
        policy
            .WithOrigins(
                "http://localhost:4200",
                "https://yasmine-saad.github.io"    // production URL
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
    )
);

// ============================================================
// ── PIPELINE ──────────────────────────────────────────────────
// ============================================================

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Symptom Checker API v1");
        c.RoutePrefix = string.Empty; // Swagger at root
    });
}

app.UseCors("Angular");
app.UseRateLimiter();
app.MapControllers();

app.Run();
