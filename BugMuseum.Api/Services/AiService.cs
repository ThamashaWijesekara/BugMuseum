using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BugMuseum.Api.Services;

public interface IAiService
{
    Task<string> GenerateSummaryAsync(string prompt);
}

public class AiService : IAiService
{
    private readonly HttpClient _httpClient;
    private readonly string _apiKey;
    private readonly string _model;

    public AiService(HttpClient httpClient, IConfiguration config)
    {
        _httpClient = httpClient;
        _apiKey = config["GeminiSettings:ApiKey"] ?? string.Empty;
        _model = config["GeminiSettings:Model"] ?? "gemini-1.5-flash";
    }

    public async Task<string> GenerateSummaryAsync(string prompt)
    {
        if (string.IsNullOrWhiteSpace(_apiKey))
        {
            return "AI diagnostic hint unavailable: Missing Gemini API key in backend configuration.";
        }

        var requestUrl = $"https://generativelanguage.googleapis.com/v1beta/models/{_model}:generateContent?key={_apiKey}";

        var requestBody = new
        {
            contents = new[]
            {
                new
                {
                    parts = new[]
                    {
                        new { text = prompt }
                    }
                }
            }
        };

        var jsonPayload = JsonSerializer.Serialize(requestBody);
        var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

        try
        {
            var response = await _httpClient.PostAsync(requestUrl, content);
            if (!response.IsSuccessStatusCode)
            {
                return "AI Curator is currently taking a break. Community suggestions welcome below!";
            }

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);

            var text = doc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString();

            return text ?? "No diagnostic response generated.";
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[AiService Error]: {ex.Message}");
            return "Failed to contact AI service. Please check community responses below.";
        }
    }
}