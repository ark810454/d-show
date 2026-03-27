using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services.Printing;
using DShow.PosMobile.Core.Services.Sync;

namespace DShow.PosMobile.Core.Services.Api;

public sealed class TerraceMobileService
{
    private readonly ApiClient _apiClient;
    private readonly SessionStore _sessionStore;
    private readonly SyncQueueService _syncQueueService;

    public TerraceMobileService(ApiClient apiClient, SessionStore sessionStore, SyncQueueService syncQueueService)
    {
        _apiClient = apiClient;
        _sessionStore = sessionStore;
        _syncQueueService = syncQueueService;
    }

    public async Task<IReadOnlyList<PosTable>> GetTablesAsync(CancellationToken cancellationToken = default)
        => await _apiClient.GetAsync<List<PosTable>>("terrace/tables", true, cancellationToken) ?? [];

    public async Task<IReadOnlyList<MenuCategory>> GetMenuAsync(CancellationToken cancellationToken = default)
        => await _apiClient.GetAsync<List<MenuCategory>>("terrace/menu", true, cancellationToken) ?? [];

    public async Task<MutationResult<PrintableReceipt>> CreateOrderAndPaymentAsync(string? tableId, IReadOnlyCollection<CartLine> cart, MobilePaymentMethod paymentMethod, string? note, CancellationToken cancellationToken = default)
    {
        var state = await _sessionStore.GetStateAsync(cancellationToken);
        var payload = new
        {
            companyId = state.ActiveCompany?.Id,
            activityId = state.ActiveActivity?.Id,
            serverId = state.Session?.User.Id,
            terraceTableId = tableId,
            note,
            items = cart.Select(line => new
            {
                menuItemId = line.ReferenceId,
                libelle = line.Libelle,
                quantite = line.Quantite,
                prixUnitaire = line.PrixUnitaire,
                note = line.Note,
            }).ToList(),
        };

        try
        {
            var order = await _apiClient.PostAsync<TerraceOrderResponse>("terrace/orders", payload, true, cancellationToken)
                ?? throw new InvalidOperationException("Le ticket terrasse n'a pas ete retourne.");

            await _apiClient.PostAsync<object>(
                "terrace/payments",
                new
                {
                    companyId = state.ActiveCompany?.Id,
                    activityId = state.ActiveActivity?.Id,
                    terraceOrderId = order.Id,
                    processedByUserId = state.Session?.User.Id,
                    montant = order.TotalNet,
                    modePaiement = paymentMethod.ToString(),
                },
                true,
                cancellationToken);

            return new MutationResult<PrintableReceipt>
            {
                Data = ReceiptComposer.ComposeTerraceReceipt(
                    state.ActiveCompany?.Nom ?? "D_Show",
                    state.ActiveActivity?.Nom ?? "Terrasse",
                    order.Reference,
                    order.TableLabel ?? "Ticket rapide",
                    cart,
                    order.TotalNet,
                    paymentMethod),
                Message = "Ticket terrasse encaisse.",
            };
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            await _syncQueueService.EnqueueAsync("terrace", "terrace/orders", payload, true, cancellationToken);
            return new MutationResult<PrintableReceipt>
            {
                IsQueued = true,
                Message = "Connexion indisponible. Le ticket terrasse a ete mis en attente de synchronisation.",
            };
        }
    }
}

public sealed class TerraceOrderResponse
{
    public string Id { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public decimal TotalNet { get; set; }
    public string? TableLabel { get; set; }
}
