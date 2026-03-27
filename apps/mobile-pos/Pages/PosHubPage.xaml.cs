using DShow.PosMobile.Core;
using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services;

namespace DShow.PosMobile.Pages;

public partial class PosHubPage : ContentPage
{
    private MobileActivityType _activityType;

    public PosHubPage()
    {
        InitializeComponent();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        var state = await ServiceHelper.GetService<SessionStore>().GetStateAsync();
        if (state.ActiveCompany is null || state.ActiveActivity is null)
        {
            await Shell.Current.GoToAsync("//activities");
            return;
        }

        CompanyLabel.Text = state.ActiveCompany.Nom;
        ActivityLabel.Text = $"{state.ActiveActivity.Nom} - {state.ActiveActivity.Type}";
        _activityType = state.ActiveActivity.Type;
        PrimaryPosButton.Text = state.ActiveActivity.Type switch
        {
            MobileActivityType.RESTAURANT => "Restaurant POS",
            MobileActivityType.TERRASSE => "Terrasse POS",
            MobileActivityType.SHOP => "Boutique POS",
            _ => "POS de l'activite",
        };
    }

    private async void OnPrimaryPosClicked(object? sender, EventArgs e)
    {
        var route = _activityType switch
        {
            MobileActivityType.RESTAURANT => nameof(RestaurantPosPage),
            MobileActivityType.TERRASSE => nameof(TerracePosPage),
            MobileActivityType.SHOP => nameof(ShopPosPage),
            _ => nameof(SyncCenterPage),
        };

        await Shell.Current.GoToAsync(route);
    }

    private async void OnPrinterClicked(object? sender, EventArgs e) => await Shell.Current.GoToAsync(nameof(PrinterSettingsPage));
    private async void OnSyncClicked(object? sender, EventArgs e) => await Shell.Current.GoToAsync(nameof(SyncCenterPage));
    private async void OnChangeActivityClicked(object? sender, EventArgs e) => await Shell.Current.GoToAsync("//activities");
    private async void OnChangeCompanyClicked(object? sender, EventArgs e) => await Shell.Current.GoToAsync("//companies");
}
