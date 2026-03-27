using DShow.PosMobile.Core.Models;

namespace DShow.PosMobile.Core.Services.Printing;

public interface IReceiptPrinterService
{
    Task<IReadOnlyList<PrinterDevice>> GetAvailableDevicesAsync(CancellationToken cancellationToken = default);
    Task PrintAsync(PrintableReceipt receipt, string printerId, CancellationToken cancellationToken = default);
}
