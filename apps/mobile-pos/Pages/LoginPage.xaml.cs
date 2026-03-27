using DShow.PosMobile.Core;
using DShow.PosMobile.Core.Services;
using DShow.PosMobile.Core.Services.Api;

namespace DShow.PosMobile.Pages;

public partial class LoginPage : ContentPage
{
    private bool _apiConfigVisible;

    public LoginPage()
    {
        InitializeComponent();
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        var state = await ServiceHelper.GetService<SessionStore>().GetStateAsync();
        ApiUrlEntry.Text = state.ApiBaseUrl;
        ApiHintLabel.Text = "Exemple reseau local: http://172.20.10.2:4000/api";
        AdviceLabel.Text = $"API memorisee: {state.ApiBaseUrl}";
        StatusLabel.Text = "Pret pour la connexion.";
        SetApiConfigVisibility(false);
    }

    private void OnToggleApiConfigClicked(object? sender, EventArgs e)
        => SetApiConfigVisibility(!_apiConfigVisible);

    private void SetApiConfigVisibility(bool isVisible)
    {
        _apiConfigVisible = isVisible;
        ApiConfigPanel.IsVisible = isVisible;
        ApiToggleButton.Text = isVisible ? "Masquer" : "Afficher";
    }

    private async void OnLoginClicked(object? sender, EventArgs e)
    {
        ErrorCard.IsVisible = false;
        LoginLoader.IsVisible = true;
        LoginLoader.IsRunning = true;
        LoginButton.IsEnabled = false;
        StatusLabel.Text = "Connexion en cours...";

        try
        {
            var store = ServiceHelper.GetService<SessionStore>();
            await store.UpdateApiBaseUrlAsync(ApiUrlEntry.Text ?? string.Empty);
            AdviceLabel.Text = $"API memorisee: {ApiUrlEntry.Text?.Trim()}";
            await ServiceHelper.GetService<AuthService>().LoginAsync(EmailEntry.Text ?? string.Empty, PasswordEntry.Text ?? string.Empty);
            StatusLabel.Text = "Connexion reussie. Chargement des entreprises...";
            await Shell.Current.GoToAsync("//companies");
        }
        catch (TaskCanceledException)
        {
            ErrorLabel.Text = "Connexion au serveur trop longue. Verifiez l'URL API et le reseau du terminal POS.";
            ErrorCard.IsVisible = true;
            StatusLabel.Text = "Connexion impossible.";
        }
        catch (Exception ex)
        {
            ErrorLabel.Text = ex.Message;
            ErrorCard.IsVisible = true;
            StatusLabel.Text = "Connexion impossible.";
        }
        finally
        {
            LoginLoader.IsRunning = false;
            LoginLoader.IsVisible = false;
            LoginButton.IsEnabled = true;
        }
    }
}
