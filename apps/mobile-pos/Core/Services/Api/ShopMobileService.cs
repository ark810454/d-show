using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services.Printing;
using DShow.PosMobile.Core.Services.Sync;

namespace DShow.PosMobile.Core.Services.Api;

public sealed class ShopMobileService
{
    private readonly ApiClient _apiClient;
    private readonly SessionStore _sessionStore;
    private readonly SyncQueueService _syncQueueService;

    public ShopMobileService(ApiClient apiClient, SessionStore sessionStore, SyncQueueService syncQueueService)
    {
        _apiClient = apiClient;
        _sessionStore = sessionStore;
        _syncQueueService = syncQueueService;
    }

    public async Task<IReadOnlyList<ShopProduct>> GetProductsAsync(string? query = null, CancellationToken cancellationToken = default)
    {
        var path = string.IsNullOrWhiteSpace(query)
            ? "shop/products"
            : $"shop/products?q={Uri.EscapeDataString(query)}";
        return await _apiClient.GetAsync<List<ShopProduct>>(path, true, cancellationToken) ?? [];
    }

    public async Task<MutationResult<PrintableReceipt>> CreateSaleAsync(IReadOnlyCollection<CartLine> cart, MobilePaymentMethod paymentMethod, decimal remise, decimal taxeMontant, string? note, CancellationToken cancellationToken = default)
    {
        var state = await _sessionStore.GetStateAsync(cancellationToken);
        var payload = new
        {
            companyId = state.ActiveCompany?.Id,
            activityId = state.ActiveActivity?.Id,
            sellerId = state.Session?.User.Id,
            remise,
            taxeMontant,
            modePaiement = paymentMethod.ToString(),
            note,
            items = cart.Select(line => new
            {
                productId = line.ReferenceId,
                libelle = line.Libelle,
                quantite = line.Quantite,
                prixUnitaire = line.PrixUnitaire,
            }).ToList(),
        };

        try
        {
            var sale = await _apiClient.PostAsync<ShopSaleResponse>("shop/sales", payload, true, cancellationToken)
                ?? throw new InvalidOperationException("La vente boutique n'a pas ete retournee.");

            return new MutationResult<PrintableReceipt>
            {
                Data = ReceiptComposer.ComposeShopReceipt(
                    state.ActiveCompany?.Nom ?? "D_Show",
                    state.ActiveActivity?.Nom ?? "Shop",
                    sale.Reference,
                    cart,
                    sale.TotalTtc,
                    paymentMethod),
                Message = "Vente boutique enregistree.",
            };
        }
        catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
        {
            await _syncQueueService.EnqueueAsync("shop", "shop/sales", payload, true, cancellationToken);
            return new MutationResult<PrintableReceipt>
            {
                IsQueued = true,
                Message = "Connexion indisponible. La vente boutique a ete mise en attente de synchronisation.",
            };
        }
    }
}

public sealed class ShopSaleResponse
{
    public string Id { get; set; } = string.Empty;
    public string Reference { get; set; } = string.Empty;
    public decimal TotalTtc { get; set; }
}
