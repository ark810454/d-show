using DShow.PosMobile.Core.Models;

namespace DShow.PosMobile.Core.Services.Printing;

public sealed class UnsupportedReceiptPrinterService : IReceiptPrinterService
{
    public Task<IReadOnlyList<PrinterDevice>> GetAvailableDevicesAsync(CancellationToken cancellationToken = default)
        => Task.FromResult<IReadOnlyList<PrinterDevice>>([]);

    public Task PrintAsync(PrintableReceipt receipt, string printerId, CancellationToken cancellationToken = default)
        => throw new PlatformNotSupportedException("L'impression Bluetooth est prise en charge sur Android dans cette version.");
}
