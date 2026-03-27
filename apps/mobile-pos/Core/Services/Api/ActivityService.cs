using DShow.PosMobile.Core.Models;

namespace DShow.PosMobile.Core.Services.Api;

public sealed class ActivityService
{
    private readonly ApiClient _apiClient;

    public ActivityService(ApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    public async Task<IReadOnlyList<ActivitySummary>> ListByCompanyAsync(string companyId, CancellationToken cancellationToken = default)
        => await _apiClient.GetAsync<List<ActivitySummary>>($"activities/company/{companyId}", false, cancellationToken) ?? [];
}
