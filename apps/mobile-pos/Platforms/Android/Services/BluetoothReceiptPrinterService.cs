#if ANDROID
using Android.Bluetooth;
using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services.Printing;
using Java.Util;

namespace DShow.PosMobile.Platforms.Android.Services;

public sealed class BluetoothReceiptPrinterService : IReceiptPrinterService
{
    private static readonly UUID SerialPortProfileUuid = UUID.FromString("00001101-0000-1000-8000-00805F9B34FB")!;

    public Task<IReadOnlyList<PrinterDevice>> GetAvailableDevicesAsync(CancellationToken cancellationToken = default)
    {
        var adapter = BluetoothAdapter.DefaultAdapter;
        if (adapter is null)
        {
            return Task.FromResult<IReadOnlyList<PrinterDevice>>([]);
        }

        try
        {
            var devices = adapter.BondedDevices?
                .Select(device => new PrinterDevice
                {
                    Id = device.Address ?? string.Empty,
                    Name = device.Name ?? "Bluetooth Printer",
                    IsConnected = device.BondState == Bond.Bonded,
                })
                .OrderBy(device => device.Name)
                .ToList() ?? [];

            return Task.FromResult<IReadOnlyList<PrinterDevice>>(devices);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException("Impossible de lire les imprimantes Bluetooth. Verifiez les permissions Bluetooth du terminal POS.", ex);
        }
    }

    public async Task PrintAsync(PrintableReceipt receipt, string printerId, CancellationToken cancellationToken = default)
    {
        var adapter = BluetoothAdapter.DefaultAdapter ?? throw new InvalidOperationException("Bluetooth indisponible sur ce terminal.");
        var device = adapter.BondedDevices?.FirstOrDefault(item => item.Address == printerId)
            ?? throw new InvalidOperationException("Imprimante Bluetooth introuvable.");

        using var socket = device.CreateRfcommSocketToServiceRecord(SerialPortProfileUuid);
        await Task.Run(() =>
        {
            adapter.CancelDiscovery();
            socket.Connect();
            var bytes = ReceiptComposer.ToEscPosBytes(receipt);
            var outputStream = socket.OutputStream ?? throw new InvalidOperationException("Flux d'impression Bluetooth indisponible.");
            outputStream.Write(bytes, 0, bytes.Length);
            outputStream.Flush();
        }, cancellationToken);
    }
}
#endif
