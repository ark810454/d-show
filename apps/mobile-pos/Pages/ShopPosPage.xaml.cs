using System.Collections.ObjectModel;
using DShow.PosMobile.Core;
using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services;
using DShow.PosMobile.Core.Services.Api;
using DShow.PosMobile.Core.Services.Printing;

namespace DShow.PosMobile.Pages;

public partial class ShopPosPage : ContentPage
{
    private readonly ObservableCollection<ShopProduct> _products = [];
    private readonly ObservableCollection<CartLine> _cart = [];

    public ShopPosPage()
    {
        InitializeComponent();
        ProductsView.ItemsSource = _products;
        ShopCartView.ItemsSource = _cart;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await LoadAsync();
    }

    private async Task LoadAsync(string? query = null)
    {
        _products.Clear();
        var products = await ServiceHelper.GetService<ShopMobileService>().GetProductsAsync(query);
        foreach (var product in products)
        {
            _products.Add(product);
        }
        UpdateTotal();
    }

    private async void OnSearchPressed(object? sender, EventArgs e) => await LoadAsync(ProductSearchBar.Text);

    private void OnProductSelected(object? sender, SelectionChangedEventArgs e)
    {
        if (e.CurrentSelection.FirstOrDefault() is not ShopProduct product)
        {
            return;
        }

        ProductsView.SelectedItem = null;
        var existing = _cart.FirstOrDefault(line => line.ReferenceId == product.Id);
        if (existing is null)
        {
            _cart.Add(new CartLine
            {
                ReferenceId = product.Id,
                Libelle = product.Nom,
                PrixUnitaire = product.PrixVente,
                Quantite = 1,
            });
        }
        else
        {
            existing.Quantite += 1;
            ShopCartView.ItemsSource = null;
            ShopCartView.ItemsSource = _cart;
        }

        UpdateTotal();
    }

    private void OnCartItemSelected(object? sender, SelectionChangedEventArgs e)
    {
        if (e.CurrentSelection.FirstOrDefault() is not CartLine line)
        {
            return;
        }

        ShopCartView.SelectedItem = null;
        _cart.Remove(line);
        UpdateTotal();
    }

    private async void OnCashClicked(object? sender, EventArgs e) => await CheckoutAsync(MobilePaymentMethod.CASH);
    private async void OnCardClicked(object? sender, EventArgs e) => await CheckoutAsync(MobilePaymentMethod.CARTE);
    private async void OnMobileClicked(object? sender, EventArgs e) => await CheckoutAsync(MobilePaymentMethod.MOBILE_MONEY);

    private async Task CheckoutAsync(MobilePaymentMethod method)
    {
        if (!_cart.Any())
        {
            ShopStatusLabel.Text = "Ajoutez au moins un produit.";
            return;
        }

        var result = await ServiceHelper.GetService<ShopMobileService>()
            .CreateSaleAsync(_cart.ToList(), method, 0m, 0m, null);

        ShopStatusLabel.Text = result.Message;
        if (result.Data is not null)
        {
            await TryPrintAsync(result.Data);
            _cart.Clear();
            UpdateTotal();
        }
    }

    private async Task TryPrintAsync(PrintableReceipt receipt)
    {
        var state = await ServiceHelper.GetService<SessionStore>().GetStateAsync();
        if (string.IsNullOrWhiteSpace(state.SelectedPrinterId))
        {
            ShopStatusLabel.Text += " Selectionnez une imprimante Bluetooth.";
            return;
        }

        try
        {
            await ServiceHelper.GetService<IReceiptPrinterService>().PrintAsync(receipt, state.SelectedPrinterId);
        }
        catch (Exception ex)
        {
            ShopStatusLabel.Text = $"Impression impossible: {ex.Message}";
        }
    }

    private void UpdateTotal()
    {
        ShopTotalLabel.Text = $"Total: {_cart.Sum(item => item.Total):N0}";
    }

    private async void OnBackClicked(object? sender, EventArgs e) => await Shell.Current.GoToAsync("//hub");
}
