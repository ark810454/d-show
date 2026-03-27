namespace DShow.PosMobile.Core.Services.Permissions;

public interface IDevicePermissionService
{
    Task<bool> EnsureBluetoothPrinterAccessAsync(CancellationToken cancellationToken = default);
    Task<bool> IsBluetoothAvailableAsync(CancellationToken cancellationToken = default);
}
