using DShow.PosMobile.Core.Models;

namespace DShow.PosMobile.Core.Services.Api;

public sealed class CompanyService
{
    private readonly ApiClient _apiClient;

    public CompanyService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<IReadOnlyList<CompanySummary>> GetAuthorizedAsync(CancellationToken cancellationToken = default)
        => await _apiClient.GetAsync<List<CompanySummary>>("companies/authorized", false, cancellationToken) ?? [];
}
