// =============================================================
// FILE: Infrastructure/AI/OpenAIProvider.cs
// PURPOSE: Real OpenAI implementation — جاهز للـ production
//
// ARCHITECTURAL DECISION:
// بنكتبه دلوقتي وان كان هنستخدم Mock.
// لما يبقى عندنا API key — بنغير سطر واحد في Program.cs:
//
//   ❌ builder.Services.AddScoped<IAIProvider, MockAIProvider>();
//   ✅ builder.Services.AddScoped<IAIProvider, OpenAIProvider>();
//
// مفيش تغيير في أي حاجة تانية.
//
// install: dotnet add package OpenAI
// =============================================================

namespace SmartSymptomChecker.Infrastructure.AI;

using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SmartSymptomChecker.Application.Interfaces;

public class OpenAIProvider : IAIProvider
{
    public string ProviderName => "OpenAI";

    private readonly IConfiguration _config;
    private readonly ILogger<OpenAIProvider> _logger;
    private readonly HttpClient _httpClient;

    // ── Model Configuration ───────────────────────────────────
    // GPT-4o-mini: أسرع وأرخص — كافي لـ triage
    // لو عايزين دقة أعلى: نستخدم gpt-4o
    private const string MODEL      = "gpt-4o-mini";
    private const int    MAX_TOKENS = 800;
    private const double TEMPERATURE = 0.1; // منخفض = أكثر consistency

    public OpenAIProvider(
        IConfiguration config,
        ILogger<OpenAIProvider> logger,
        HttpClient httpClient)
    {
        _config     = config;
        _logger     = logger;
        _httpClient = httpClient;
    }

    public async Task<string> CompleteAsync(
        string systemPrompt,
        string userPrompt,
        CancellationToken cancellationToken = default)
    {
        var apiKey = _config["OpenAI:ApiKey"]
            ?? throw new InvalidOperationException("OpenAI API key not configured");

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

        var requestBody = new
        {
            model       = MODEL,
            max_tokens  = MAX_TOKENS,
            temperature = TEMPERATURE,
            messages    = new[]
            {
                new { role = "system", content = systemPrompt },
                new { role = "user",   content = userPrompt   },
            }
        };

        var json     = System.Text.Json.JsonSerializer.Serialize(requestBody);
        var content  = new StringContent(json, System.Text.Encoding.UTF8, "application/json");
        var response = await _httpClient.PostAsync(
            "https://api.openai.com/v1/chat/completions",
            content,
            cancellationToken
        );

        response.EnsureSuccessStatusCode();

        var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
        var parsed       = System.Text.Json.JsonDocument.Parse(responseJson);

        // نستخرج الـ content من الـ OpenAI response structure
        var messageContent = parsed
            .RootElement
            .GetProperty("choices")[0]
            .GetProperty("message")
            .GetProperty("content")
            .GetString()
            ?? throw new InvalidOperationException("Empty response from OpenAI");

        _logger.LogDebug("OpenAI raw response: {Response}", messageContent);

        return messageContent;
    }
}
