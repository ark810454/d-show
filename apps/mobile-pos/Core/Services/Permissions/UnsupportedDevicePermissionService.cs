namespace DShow.PosMobile.Core.Services.Permissions;

public sealed class UnsupportedDevicePermissionService : IDevicePermissionService
{
    public Task<bool> EnsureBluetoothPrinterAccessAsync(CancellationToken cancellationToken = default)
        => Task.FromResult(false);

    public Task<bool> IsBluetoothAvailableAsync(CancellationToken cancellationToken = default)
        => Task.FromResult(false);
}
