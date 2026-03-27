using DShow.PosMobile.Core.Models;

namespace DShow.PosMobile.Core.Services.Printing;

public static class ReceiptComposer
{
    public static PrintableReceipt ComposeRestaurantReceipt(string companyName, string activityName, string reference, string tableLabel, IEnumerable<CartLine> items, decimal total, MobilePaymentMethod paymentMethod)
        => Compose(companyName, activityName, reference, tableLabel, items, total, paymentMethod);

    public static PrintableReceipt ComposeTerraceReceipt(string companyName, string activityName, string reference, string tableLabel, IEnumerable<CartLine> items, decimal total, MobilePaymentMethod paymentMethod)
        => Compose(companyName, activityName, reference, tableLabel, items, total, paymentMethod);

    public static PrintableReceipt ComposeShopReceipt(string companyName, string activityName, string reference, IEnumerable<CartLine> items, decimal total, MobilePaymentMethod paymentMethod)
        => Compose(companyName, activityName, reference, "Vente comptoir", items, total, paymentMethod);

    public static byte[] ToEscPosBytes(PrintableReceipt receipt)
    {
        var buffer = new List<byte>();
        buffer.AddRange([0x1B, 0x40]);
        buffer.AddRange([0x1B, 0x61, 0x01]);
        Append(buffer, receipt.Title.ToUpperInvariant());
        if (!string.IsNullOrWhiteSpace(receipt.Subtitle))
        {
            Append(buffer, receipt.Subtitle);
        }

        buffer.AddRange([0x1B, 0x61, 0x00]);
        Append(buffer, new string('-', 32));
        foreach (var line in receipt.Lines)
        {
            Append(buffer, line);
        }

        Append(buffer, new string('-', 32));
        if (!string.IsNullOrWhiteSpace(receipt.Footer))
        {
            Append(buffer, receipt.Footer);
        }

        Append(buffer, string.Empty);
        Append(buffer, string.Empty);
        buffer.AddRange([0x1D, 0x56, 0x41, 0x10]);
        return [.. buffer];
    }

    private static PrintableReceipt Compose(string companyName, string activityName, string reference, string contextLabel, IEnumerable<CartLine> items, decimal total, MobilePaymentMethod paymentMethod)
    {
        var receipt = new PrintableReceipt
        {
            Title = companyName,
            Subtitle = $"{activityName} - {DateTime.Now:dd/MM/yyyy HH:mm}",
            Footer = $"Ref: {reference} | Paiement: {paymentMethod}",
        };

        receipt.Lines.Add(contextLabel);
        foreach (var item in items)
        {
            receipt.Lines.Add($"{item.Quantite} x {item.Libelle}");
            receipt.Lines.Add($"  {item.PrixUnitaire:N0} = {item.Total:N0}");
        }

        receipt.Lines.Add($"TOTAL: {total:N0}");
        receipt.Lines.Add("Merci pour votre visite.");
        return receipt;
    }

    private static void Append(List<byte> buffer, string line)
    {
        buffer.AddRange(System.Text.Encoding.UTF8.GetBytes(line));
        buffer.Add(0x0A);
    }
}
