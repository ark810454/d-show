using DShow.PosMobile.Core.Models;

namespace DShow.PosMobile.Core.Services.Api;

public sealed class AuthService
{
    private readonly ApiClient _apiClient;
    private readonly SessionStore _sessionStore;

    public AuthService(ApiClient apiClient, SessionStore sessionStore)
    {
        _apiClient = apiClient;
        _sessionStore = sessionStore;
    }

    public async Task<AuthSession> LoginAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var response = await _apiClient.PostAsync<AuthSession>("auth/login", new { email, password }, false, cancellationToken);
        if (response is null)
        {
            throw new InvalidOperationException("La session de connexion est vide.");
        }

        await _sessionStore.SetSessionAsync(response, cancellationToken);
        return response;
    }

    public async Task LogoutAsync(CancellationToken cancellationToken = default)
    {
        try
        {
            await _apiClient.PostAsync<object>("auth/logout", new { }, false, cancellationToken);
        }
        catch
        {
            // Ignore token expiry on logout.
        }

        await _sessionStore.ClearAsync(cancellationToken);
    }
}
