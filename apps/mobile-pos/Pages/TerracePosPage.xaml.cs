using System.Collections.ObjectModel;
using DShow.PosMobile.Core;
using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services;
using DShow.PosMobile.Core.Services.Api;
using DShow.PosMobile.Core.Services.Printing;
using PosMenuItem = DShow.PosMobile.Core.Models.MenuItem;

namespace DShow.PosMobile.Pages;

public partial class TerracePosPage : ContentPage
{
    private readonly ObservableCollection<PosMenuItem> _menuItems = [];
    private readonly ObservableCollection<CartLine> _cart = [];
    private List<PosTable> _tables = [];

    public TerracePosPage()
    {
        InitializeComponent();
        TerraceMenuItemsView.ItemsSource = _menuItems;
        TerraceCartView.ItemsSource = _cart;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await LoadAsync();
    }

    private async Task LoadAsync()
    {
        var service = ServiceHelper.GetService<TerraceMobileService>();
        _tables = [.. await service.GetTablesAsync()];
        var menu = await service.GetMenuAsync();

        TerraceTablePicker.ItemsSource = new List<string> { "Sans table" }.Concat(_tables.Select(table => table.DisplayName)).ToList();
        if (TerraceTablePicker.SelectedIndex < 0)
        {
            TerraceTablePicker.SelectedIndex = 0;
        }

        _menuItems.Clear();
        foreach (var item in menu.SelectMany(category => category.Items))
        {
            _menuItems.Add(item);
        }

        UpdateTotal();
    }

    private void OnMenuItemSelected(object? sender, SelectionChangedEventArgs e)
    {
        if (e.CurrentSelection.FirstOrDefault() is not PosMenuItem item)
        {
            return;
        }

        TerraceMenuItemsView.SelectedItem = null;
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
            TerraceCartView.ItemsSource = null;
            TerraceCartView.ItemsSource = _cart;
        }

        UpdateTotal();
    }

    private void OnCartItemSelected(object? sender, SelectionChangedEventArgs e)
    {
        if (e.CurrentSelection.FirstOrDefault() is not CartLine line)
        {
            return;
        }

        TerraceCartView.SelectedItem = null;
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
            TerraceStatusLabel.Text = "Ajoutez au moins un article.";
            return;
        }

        var selectedTableId = TerraceTablePicker.SelectedIndex <= 0 ? null : _tables[TerraceTablePicker.SelectedIndex - 1].Id;
        var result = await ServiceHelper.GetService<TerraceMobileService>()
            .CreateOrderAndPaymentAsync(selectedTableId, _cart.ToList(), method, TerraceNoteEntry.Text);

        TerraceStatusLabel.Text = result.Message;
        if (result.Data is not null)
        {
            await TryPrintAsync(result.Data);
            _cart.Clear();
            TerraceNoteEntry.Text = string.Empty;
            UpdateTotal();
        }
    }

    private async Task TryPrintAsync(PrintableReceipt receipt)
    {
        var state = await ServiceHelper.GetService<SessionStore>().GetStateAsync();
        if (string.IsNullOrWhiteSpace(state.SelectedPrinterId))
        {
            TerraceStatusLabel.Text += " Selectionnez une imprimante Bluetooth.";
            return;
        }

        try
        {
            await ServiceHelper.GetService<IReceiptPrinterService>().PrintAsync(receipt, state.SelectedPrinterId);
        }
        catch (Exception ex)
        {
            TerraceStatusLabel.Text = $"Impression impossible: {ex.Message}";
        }
    }

    private void UpdateTotal()
    {
        TerraceTotalLabel.Text = $"Total: {_cart.Sum(item => item.Total):N0}";
    }

    private async void OnBackClicked(object? sender, EventArgs e) => await Shell.Current.GoToAsync("//hub");
}
