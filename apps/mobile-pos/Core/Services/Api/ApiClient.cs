using System.Net;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace DShow.PosMobile.Core.Services.Api;

public sealed class ApiClient
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
    };

    private readonly HttpClient _httpClient;
    private readonly SessionStore _sessionStore;

    public ApiClient(SessionStore sessionStore)
    {
        _httpClient = new HttpClient
        {
            Timeout = TimeSpan.FromSeconds(20),
        };
        _sessionStore = sessionStore;
    }

    public async Task<T?> GetAsync<T>(string relativeUrl, bool includeActivityScope = true, CancellationToken cancellationToken = default)
    {
        using var request = await CreateRequestAsync(HttpMethod.Get, relativeUrl, includeActivityScope, cancellationToken);
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await ReadAsync<T>(response, cancellationToken);
    }

    public async Task<T?> PostAsync<T>(string relativeUrl, object payload, bool includeActivityScope = true, CancellationToken cancellationToken = default)
    {
        var json = JsonSerializer.Serialize(payload, JsonOptions);
        using var request = await CreateRequestAsync(HttpMethod.Post, relativeUrl, includeActivityScope, cancellationToken);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");
        using var response = await _httpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
        return await ReadAsync<T>(response, cancellationToken);
    }

    public async Task<HttpResponseMessage> PostRawAsync(string relativeUrl, string payloadJson, bool includeActivityScope = true, CancellationToken cancellationToken = default)
    {
        var request = await CreateRequestAsync(HttpMethod.Post, relativeUrl, includeActivityScope, cancellationToken);
        request.Content = new StringContent(payloadJson, Encoding.UTF8, "application/json");
        return await _httpClient.SendAsync(request, cancellationToken);
    }

    private async Task<HttpRequestMessage> CreateRequestAsync(HttpMethod method, string relativeUrl, bool includeActivityScope, CancellationToken cancellationToken)
    {
        var state = await _sessionStore.GetStateAsync(cancellationToken);
        var baseUrl = state.ApiBaseUrl.TrimEnd('/');
        var request = new HttpRequestMessage(method, $"{baseUrl}/{relativeUrl.TrimStart('/')}");

        if (!string.IsNullOrWhiteSpace(state.Session?.AccessToken))
        {
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", state.Session.AccessToken);
        }

        if (!string.IsNullOrWhiteSpace(state.ActiveCompany?.Id))
        {
            request.Headers.Add("x-company-id", state.ActiveCompany.Id);
        }

        if (includeActivityScope && !string.IsNullOrWhiteSpace(state.ActiveActivity?.Id))
        {
            request.Headers.Add("x-activity-id", state.ActiveActivity.Id);
        }

        request.Headers.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        return request;
    }

    private static async Task EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var body = await response.Content.ReadAsStringAsync(cancellationToken);
        throw new ApiException(response.StatusCode, string.IsNullOrWhiteSpace(body) ? response.ReasonPhrase ?? "Erreur API" : body);
    }

    private static async Task<T?> ReadAsync<T>(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.Content is null)
        {
            return default;
        }

        await using var stream = await response.Content.ReadAsStreamAsync(cancellationToken);
        if (!stream.CanRead)
        {
            return default;
        }

        return await JsonSerializer.DeserializeAsync<T>(stream, JsonOptions, cancellationToken);
    }
}

public sealed class ApiException : Exception
{
    public HttpStatusCode StatusCode { get; }

    public ApiException(HttpStatusCode statusCode, string message) : base(message)
    {
        StatusCode = statusCode;
    }
}
