using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services.Printing;
using DShow.PosMobile.Core.Services.Sync;

namespace DShow.PosMobile.Core.Services.Api;

public sealed class RestaurantMobileService
{
    private readonly ApiClient _apiClient;
    private readonly SessionStore _sessionStore;
    private readonly SyncQueueService _syncQueueService;

    public RestaurantMobileService(ApiClient apiClient, SessionStore sessionStore, SyncQueueService syncQueueService)
    {
        _apiClient = apiClient;
        _sessionStore = sessionStore;
        _syncQueueService = syncQueueService;
    }

    public async Task<IReadOnlyList<PosTable>> GetTablesAsync(CancellationToken cancellationToken = default)
        => await _apiClient.GetAsync<List<PosTable>>("restaurant/tables", true, cancellationToken) ?? [];

    public async Task<IReadOnlyList<MenuCategory>> GetMenuAsync(CancellationToken cancellationToken = default)
        => await _apiClient.GetAsync<List<MenuCategory>>("restaurant/menu", true, cancellationToken) ?? [];

    public async Task<MutationResult<PrintableReceipt>> CreateOrderAndPaymentAsync(string tableId, IReadOnlyCollection<CartLine> cart, MobilePaymentMethod paymentMethod, string? notesCuisine, CancellationToken cancellationToken = default)
    {
        var state = await _sessionStore.GetStateAsync(cancellationToken);
        var payload = new
        {
            companyId = state.ActiveCompany?.Id,
            activityId = state.ActiveActivity?.Id,
            serverId = state.Session?.User.Id,
            tableId,
            notesCuisine,
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
            var order = await _apiClient.PostAsync<RestaurantOrderResponse>("restaurant/orders", payload, true, cancellationToken)
                ?? throw new InvalidOperationException("La commande restaurant n'a pas ete retournee.");

            await _apiClient.PostAsync<object>(
                "restaurant/payments",
                new
                {
                    companyId = state.ActiveCompany?.Id,
                    activityId = state.ActiveActivity?.Id,
                    restaurantOrderId = order.Id,
                    processedByUserId = state.Session?.User.Id,
                    montant = order.TotalTtc,
                    modePaiement = paymentMethod.ToString(),
                },
                true,
                cancellationToken);

            return new MutationResult<PrintableReceipt>
            {
                Data = ReceiptComposer.ComposeRestaurantReceipt(
                    state.ActiveCompany?.Nom ?? "D_Show",
                    state.ActiveActivity?.Nom ?? "Restaurant",
                    order.Reference,
                    order.Table?.DisplayName ?? "Table",
                    cart,
                    order.TotalTtc,
                    paymentMethod),
                Message = "Commande restaurant enregistree.",
            };
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            await _syncQueueService.EnqueueAsync("restaurant", "restaurant/orders", payload, true, cancellationToken);
            return new MutationResult<PrintableReceipt>
            {
                IsQueued = true,
                Message = "Connexion indisponible. La commande restaurant a ete mise en attente de synchronisation.",
            };
        }
    }
}

public sealed class RestaurantOrderResponse
{
    public string Id { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public decimal TotalTtc { get; set; }
    public PosTable? Table { get; set; }
}
