using System.Collections.ObjectModel;
using DShow.PosMobile.Core;
using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services;
using DShow.PosMobile.Core.Services.Permissions;
using DShow.PosMobile.Core.Services.Printing;

namespace DShow.PosMobile.Pages;

public partial class PrinterSettingsPage : ContentPage
{
    private readonly ObservableCollection<PrinterDevice> _devices = [];

    public PrinterSettingsPage()
    {
        InitializeComponent();
        DevicesView.ItemsSource = _devices;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await RefreshAsync();
    }

    private async Task RefreshAsync()
    {
        _devices.Clear();
        var state = await ServiceHelper.GetService<SessionStore>().GetStateAsync();
        SelectedPrinterLabel.Text = string.IsNullOrWhiteSpace(state.SelectedPrinterName)
            ? "Aucune imprimante selectionnee."
            : $"Imprimante actuelle: {state.SelectedPrinterName}";

        try
        {
            var permissionService = ServiceHelper.GetService<IDevicePermissionService>();
            if (!await permissionService.IsBluetoothAvailableAsync())
            {
                PrinterStatusLabel.Text = "Bluetooth indisponible sur ce terminal POS.";
                return;
            }

            await permissionService.EnsureBluetoothPrinterAccessAsync();
            var devices = await ServiceHelper.GetService<IReceiptPrinterService>().GetAvailableDevicesAsync();
            foreach (var device in devices)
            {
                _devices.Add(device);
            }

            PrinterStatusLabel.Text = _devices.Count == 0
                ? "Aucune imprimante Bluetooth jumelee trouvee. Faites d'abord l'association dans Android."
                : $"{_devices.Count} imprimante(s) Bluetooth detectee(s).";
        }
        catch (Exception ex)
        {
            PrinterStatusLabel.Text = ex.Message;
        }
    }

    private async void OnDeviceSelected(object? sender, SelectionChangedEventArgs e)
    {
        if (e.CurrentSelection.FirstOrDefault() is not PrinterDevice device)
        {
            return;
        }

        DevicesView.SelectedItem = null;
        await ServiceHelper.GetService<SessionStore>().SetPrinterAsync(device.Id, device.Name);
        SelectedPrinterLabel.Text = $"Imprimante actuelle: {device.Name}";
        PrinterStatusLabel.Text = "Imprimante enregistree pour les tickets POS.";
    }

    private async void OnRefreshClicked(object? sender, EventArgs e) => await RefreshAsync();

    private async void OnRequestBluetoothClicked(object? sender, EventArgs e)
    {
        try
        {
            var permissionService = ServiceHelper.GetService<IDevicePermissionService>();
            if (!await permissionService.IsBluetoothAvailableAsync())
            {
                PrinterStatusLabel.Text = "Bluetooth indisponible sur ce terminal POS.";
                return;
            }

            await permissionService.EnsureBluetoothPrinterAccessAsync();
            PrinterStatusLabel.Text = "Bluetooth autorise. Vous pouvez maintenant rechercher l'imprimante.";
        }
        catch (Exception ex)
        {
            PrinterStatusLabel.Text = ex.Message;
        }
    }

    private async void OnTestPrintClicked(object? sender, EventArgs e)
    {
        var state = await ServiceHelper.GetService<SessionStore>().GetStateAsync();
        if (string.IsNullOrWhiteSpace(state.SelectedPrinterId))
        {
            PrinterStatusLabel.Text = "Selectionnez une imprimante Bluetooth avant le test.";
            return;
        }

        try
        {
            await ServiceHelper.GetService<IDevicePermissionService>().EnsureBluetoothPrinterAccessAsync();
            await ServiceHelper.GetService<IReceiptPrinterService>().PrintAsync(
                new PrintableReceipt
                {
                    Title = "D_Show POS Mobile",
                    Subtitle = DateTime.Now.ToString("dd/MM/yyyy HH:mm"),
                    Lines = ["Test imprimante Bluetooth", "Connexion OK", "Ticket ESC/POS Android"],
                    Footer = "Fin de ticket",
                },
                state.SelectedPrinterId);
            PrinterStatusLabel.Text = "Ticket test envoye.";
        }
        catch (Exception ex)
        {
            PrinterStatusLabel.Text = $"Test impression impossible: {ex.Message}";
        }
    }

    private async void OnBackClicked(object? sender, EventArgs e) => await Shell.Current.GoToAsync("//hub");
}
