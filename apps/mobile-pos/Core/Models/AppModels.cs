using System.Text.Json.Serialization;

namespace DShow.PosMobile.Core.Models;

public enum MobileActivityType
{
    RESTAURANT,
    TERRASSE,
    BOITE_NUIT,
    SHOP,
    CORDONNERIE,
}

public enum MobilePaymentMethod
{
    CASH,
    CARTE,
    MOBILE_MONEY,
}

public enum PendingOperationStatus
{
    PendingSync,
    Synced,
    Failed,
    Conflict,
}

public sealed class RoleSummary
{
    public string Id { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
}

public sealed class AssignmentSummary
{
    public string ActivityId { get; set; } = string.Empty;
    public string RoleId { get; set; } = string.Empty;
    public RoleSummary? Role { get; set; }
}

public sealed class SessionUser
{
    public string Id { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string Prenom { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? CompanyId { get; set; }
    public List<AssignmentSummary> Assignments { get; set; } = [];
}

public sealed class AuthSession
{
    public SessionUser User { get; set; } = new();
    public string AccessToken { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
}

public sealed class CompanySummary
{
    public string Id { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string? Telephone { get; set; }
    public string? Adresse { get; set; }
}

public sealed class ActivitySummary
{
    public string Id { get; set; } = string.Empty;
    public string CompanyId { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public MobileActivityType Type { get; set; }

    public string? Description { get; set; }
}

public sealed class AppSessionState
{
    public string ApiBaseUrl { get; set; } = "http://10.0.2.2:4000/api";
    public AuthSession? Session { get; set; }
    public CompanySummary? ActiveCompany { get; set; }
    public ActivitySummary? ActiveActivity { get; set; }
    public string? SelectedPrinterId { get; set; }
    public string? SelectedPrinterName { get; set; }
}

public sealed class PosTable
{
    public string Id { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string? Nom { get; set; }
    public int Capacite { get; set; }
    public string Statut { get; set; } = string.Empty;

    public string DisplayName => !string.IsNullOrWhiteSpace(Nom) ? Nom : Code;
}

public sealed class MenuOption
{
    public string Id { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public decimal Prix { get; set; }
}

public sealed class MenuItem
{
    public string Id { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public decimal Prix { get; set; }
    public string? Description { get; set; }
    public string? Statut { get; set; }
    public List<MenuOption> Options { get; set; } = [];
}

public sealed class MenuCategory
{
    public string Id { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string? Description { get; set; }
    public List<MenuItem> Items { get; set; } = [];
}

public sealed class ShopProduct
{
    public string Id { get; set; } = string.Empty;
    public string Nom { get; set; } = string.Empty;
    public string Sku { get; set; } = string.Empty;
    public string? CodeBarres { get; set; }
    public decimal PrixVente { get; set; }
    public decimal StockActuel { get; set; }
    public decimal StockMinimum { get; set; }
    public string? Description { get; set; }
}

public sealed class CartLine
{
    public string ReferenceId { get; set; } = string.Empty;
    public string Libelle { get; set; } = string.Empty;
    public decimal PrixUnitaire { get; set; }
    public int Quantite { get; set; } = 1;
    public string? Note { get; set; }
    public decimal Total => PrixUnitaire * Quantite;
}

public sealed class PrinterDevice
{
    public string Id { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public bool IsConnected { get; set; }
}

public sealed class PrintableReceipt
{
    public string Title { get; set; } = string.Empty;
    public string? Subtitle { get; set; }
    public List<string> Lines { get; set; } = [];
    public string? Footer { get; set; }
}

public sealed class PendingOperation
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Module { get; set; } = string.Empty;
    public string HttpMethod { get; set; } = "POST";
    public string RelativeUrl { get; set; } = string.Empty;
    public string PayloadJson { get; set; } = "{}";
    public bool IncludeActivityScope { get; set; } = true;
    public DateTimeOffset CreatedAt { get; set; } = DateTimeOffset.UtcNow;
    public PendingOperationStatus Status { get; set; } = PendingOperationStatus.PendingSync;
    public string? LastError { get; set; }
}

public sealed class MutationResult<T>
{
    public bool IsQueued { get; set; }
    public string Message { get; set; } = string.Empty;
    public T? Data { get; set; }
}
