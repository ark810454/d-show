namespace DShow.PosMobile.Core.Services.Realtime;

public interface IRealtimeSyncService
{
    Task ConnectAsync(CancellationToken cancellationToken = default);
    Task ScopeAsync(string? companyId, string? activityId, CancellationToken cancellationToken = default);
    Task DisconnectAsync(CancellationToken cancellationToken = default);
}
