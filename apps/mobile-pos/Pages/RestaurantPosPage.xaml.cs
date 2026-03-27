using System.Collections.ObjectModel;
using DShow.PosMobile.Core;
using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services;
using DShow.PosMobile.Core.Services.Api;
using DShow.PosMobile.Core.Services.Printing;
using PosMenuItem = DShow.PosMobile.Core.Models.MenuItem;

namespace DShow.PosMobile.Pages;

public partial class RestaurantPosPage : ContentPage
{
    private readonly ObservableCollection<PosMenuItem> _menuItems = [];
    private readonly ObservableCollection<CartLine> _cart = [];
    private List<MenuCategory> _categories = [];
    private List<PosTable> _tables = [];

    public RestaurantPosPage()
    {
        InitializeComponent();
        MenuItemsView.ItemsSource = _menuItems;
        CartView.ItemsSource = _cart;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await LoadAsync();
    }

    private async Task LoadAsync()
    {
        var service = ServiceHelper.GetService<RestaurantMobileService>();
        _tables = [.. await service.GetTablesAsync()];
        _categories = [.. await service.GetMenuAsync()];

        TablePicker.ItemsSource = _tables.Select(table => table.DisplayName).ToList();
        CategoryPicker.ItemsSource = new List<string> { "Toutes les categories" }.Concat(_categories.Select(category => category.Nom)).ToList();
        if (CategoryPicker.SelectedIndex < 0)
        {
            CategoryPicker.SelectedIndex = 0;
        }

        RefreshMenu();
        UpdateTotal();
    }

    private void RefreshMenu()
    {
        _menuItems.Clear();
        IEnumerable<PosMenuItem> items = _categories.SelectMany(category => category.Items);
        if (CategoryPicker.SelectedIndex > 0)
        {
            var categoryName = CategoryPicker.SelectedItem?.ToString();
            items = _categories.Where(category => category.Nom == categoryName).SelectMany(category => category.Items);
        }

        foreach (var item in items)
        {
            _menuItems.Add(item);
        }
    }

    private void OnCategoryChanged(object? sender, EventArgs e) => RefreshMenu();

    private void OnMenuItemSelected(object? sender, SelectionChangedEventArgs e)
    {
        if (e.CurrentSelection.FirstOrDefault() is not PosMenuItem item)
        {
            return;
        }

        MenuItemsView.SelectedItem = null;
        var existing = _cart.FirstOrDefault(line => line.ReferenceId == item.Id);
        if (existing is null)
        {
            _cart.Add(new CartLine
            {
                ReferenceId = item.Id,
                Libelle = item.Nom,
                PrixUnitaire = item.Prix,
                Quantite = 1,
            });
        }
        else
        {
            existing.Quantite += 1;
            CartView.ItemsSource = null;
            CartView.ItemsSource = _cart;
        }

        UpdateTotal();
    }

    private void OnCartItemSelected(object? sender, SelectionChangedEventArgs e)
    {
        if (e.CurrentSelection.FirstOrDefault() is not CartLine line)
        {
            return;
        }

        CartView.SelectedItem = null;
        _cart.Remove(line);
        UpdateTotal();
    }

    private async void OnCashClicked(object? sender, EventArgs e) => await CheckoutAsync(MobilePaymentMethod.CASH);
    private async void OnCardClicked(object? sender, EventArgs e) => await CheckoutAsync(MobilePaymentMethod.CARTE);
    private async void OnMobileClicked(object? sender, EventArgs e) => await CheckoutAsync(MobilePaymentMethod.MOBILE_MONEY);

    private async Task CheckoutAsync(MobilePaymentMethod method)
    {
        if (TablePicker.SelectedIndex < 0 || !_cart.Any())
        {
            RestaurantStatusLabel.Text = "Choisissez une table et ajoutez au moins un article.";
            return;
        }

        var table = _tables[TablePicker.SelectedIndex];
        var result = await ServiceHelper.GetService<RestaurantMobileService>()
            .CreateOrderAndPaymentAsync(table.Id, _cart.ToList(), method, KitchenNoteEntry.Text);

        RestaurantStatusLabel.Text = result.Message;
        if (result.Data is not null)
        {
            await TryPrintAsync(result.Data);
            _cart.Clear();
            KitchenNoteEntry.Text = string.Empty;
            UpdateTotal();
        }
    }

    private async Task TryPrintAsync(PrintableReceipt receipt)
    {
        var state = await ServiceHelper.GetService<SessionStore>().GetStateAsync();
        if (string.IsNullOrWhiteSpace(state.SelectedPrinterId))
        {
            RestaurantStatusLabel.Text += " Selectionnez d'abord une imprimante Bluetooth.";
            return;
        }

        try
        {
            await ServiceHelper.GetService<IReceiptPrinterService>().PrintAsync(receipt, state.SelectedPrinterId);
        }
        catch (Exception ex)
        {
            RestaurantStatusLabel.Text = $"Impression impossible: {ex.Message}";
        }
    }

    private void UpdateTotal()
    {
        RestaurantTotalLabel.Text = $"Total: {_cart.Sum(item => item.Total):N0}";
    }

    private async void OnBackClicked(object? sender, EventArgs e) => await Shell.Current.GoToAsync("//hub");
}
