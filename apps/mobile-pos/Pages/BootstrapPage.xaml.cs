using DShow.PosMobile.Core;
using DShow.PosMobile.Core.Services;

namespace DShow.PosMobile.Pages;

public partial class BootstrapPage : ContentPage
{
    public BootstrapPage()
    {
        InitializeComponent();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        var store = ServiceHelper.GetService<SessionStore>();
        var state = await store.GetStateAsync();

        StatusLabel.Text = "Verification du contexte POS...";
        if (state.Session is null || string.IsNullOrWhiteSpace(state.Session.AccessToken))
        {
            await Shell.Current.GoToAsync("//login");
            return;
        }

        if (state.ActiveCompany is null)
        {
            await Shell.Current.GoToAsync("//companies");
            return;
        }

        if (state.ActiveActivity is null)
        {
            await Shell.Current.GoToAsync("//activities");
            return;
        }

        await Shell.Current.GoToAsync("//hub");
    }
}
