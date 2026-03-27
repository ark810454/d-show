namespace DShow.PosMobile.Core.Services.Realtime;

public sealed class PlaceholderRealtimeSyncService : IRealtimeSyncService
{
    public Task ConnectAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
    public Task ScopeAsync(string? companyId, string? activityId, CancellationToken cancellationToken = default) => Task.CompletedTask;
    public Task DisconnectAsync(CancellationToken cancellationToken = default) => Task.CompletedTask;
}
