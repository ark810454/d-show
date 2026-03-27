#if ANDROID
using Android.Bluetooth;
using Android.OS;
using DShow.PosMobile.Core.Services.Permissions;
using Microsoft.Maui.ApplicationModel;

namespace DShow.PosMobile.Platforms.Android.Services;

public sealed class AndroidBluetoothPermissionService : IDevicePermissionService
{
    private sealed class BluetoothConnectPermission : Permissions.BasePlatformPermission
    {
        public override (string androidPermission, bool isRuntime)[] RequiredPermissions =>
        [
            (global::Android.Manifest.Permission.BluetoothConnect, true),
        ];
    }

    private sealed class BluetoothScanPermission : Permissions.BasePlatformPermission
    {
        public override (string androidPermission, bool isRuntime)[] RequiredPermissions =>
        [
            (global::Android.Manifest.Permission.BluetoothScan, true),
        ];
    }

    public Task<bool> IsBluetoothAvailableAsync(CancellationToken cancellationToken = default)
        => Task.FromResult(BluetoothAdapter.DefaultAdapter is not null);

    public async Task<bool> EnsureBluetoothPrinterAccessAsync(CancellationToken cancellationToken = default)
    {
        if (BluetoothAdapter.DefaultAdapter is null)
        {
            throw new InvalidOperationException("Bluetooth indisponible sur ce terminal POS.");
        }

        if (Build.VERSION.SdkInt >= BuildVersionCodes.S)
        {
            var connectStatus = await Permissions.CheckStatusAsync<BluetoothConnectPermission>();
            if (connectStatus != PermissionStatus.Granted)
            {
                connectStatus = await Permissions.RequestAsync<BluetoothConnectPermission>();
            }

            var scanStatus = await Permissions.CheckStatusAsync<BluetoothScanPermission>();
            if (scanStatus != PermissionStatus.Granted)
            {
                scanStatus = await Permissions.RequestAsync<BluetoothScanPermission>();
            }

            if (connectStatus != PermissionStatus.Granted || scanStatus != PermissionStatus.Granted)
            {
                throw new InvalidOperationException("Les permissions Bluetooth ont ete refusees. Autorisez Bluetooth pour l'impression POS.");
            }
        }
        else
        {
            var locationStatus = await Permissions.CheckStatusAsync<Permissions.LocationWhenInUse>();
            if (locationStatus != PermissionStatus.Granted)
            {
                locationStatus = await Permissions.RequestAsync<Permissions.LocationWhenInUse>();
            }

            if (locationStatus != PermissionStatus.Granted)
            {
                throw new InvalidOperationException("La permission de localisation est requise sur Android ancien pour detecter l'imprimante Bluetooth.");
            }
        }

        if (BluetoothAdapter.DefaultAdapter?.IsEnabled != true)
        {
            throw new InvalidOperationException("Bluetooth est desactive sur le terminal. Activez-le avant de chercher l'imprimante.");
        }

        return true;
    }
}
#endif
