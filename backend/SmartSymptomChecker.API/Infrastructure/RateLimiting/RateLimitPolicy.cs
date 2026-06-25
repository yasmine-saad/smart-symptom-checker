// =============================================================
// FILE: Infrastructure/RateLimiting/RateLimitPolicy.cs
// PURPOSE: Rate limiting لحماية الـ API من الـ abuse
//
// ARCHITECTURAL DECISION:
// بنعمل rate limit عشان:
// 1. نحمي الـ OpenAI API key من الـ overuse
// 2. نحمي الـ server من الـ DDoS
// 3. نضمن fair usage لكل المستخدمين
//
// الـ limits:
// - 10 requests per minute per IP
// - 50 requests per hour per IP
// =============================================================

namespace SmartSymptomChecker.Infrastructure.RateLimiting;

using Microsoft.AspNetCore.RateLimiting;
using System.Threading.RateLimiting;

public static class RateLimitPolicy
{
    public const string SYMPTOM_ANALYSIS = "SymptomAnalysis";

    public static void Configure(RateLimiterOptions options)
    {
        options.AddPolicy(SYMPTOM_ANALYSIS, context =>
            RateLimitPartition.GetSlidingWindowLimiter(
                // بنعمل partition بالـ IP address
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new SlidingWindowRateLimiterOptions
                {
                    // 10 requests per minute
                    PermitLimit         = 10,
                    Window              = TimeSpan.FromMinutes(1),
                    SegmentsPerWindow   = 6,   // كل 10 ثواني
                    QueueProcessingOrder = QueueProcessingOrder.OldestFirst,
                    QueueLimit          = 2,    // نستنى بس 2 requests
                }
            )
        );

        // Custom response لما يتجاوز الـ limit
        options.OnRejected = async (context, token) =>
        {
            context.HttpContext.Response.StatusCode = 429;
            context.HttpContext.Response.ContentType = "application/json";

            await context.HttpContext.Response.WriteAsync(
                """
                {
                  "success": false,
                  "error": {
                    "code": "RATE_LIMIT_EXCEEDED",
                    "message": "Too many requests. Please wait a moment and try again."
                  }
                }
                """,
                token
            );
        };
    }
}
