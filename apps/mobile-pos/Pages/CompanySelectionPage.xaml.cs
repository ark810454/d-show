using System.Collections.ObjectModel;
using DShow.PosMobile.Core;
using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services;
using DShow.PosMobile.Core.Services.Api;

namespace DShow.PosMobile.Pages;

public partial class CompanySelectionPage : ContentPage
{
    private readonly ObservableCollection<CompanySummary> _companies = [];

    public CompanySelectionPage()
    {
        InitializeComponent();
        CompaniesView.ItemsSource = _companies;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        var state = await ServiceHelper.GetService<SessionStore>().GetStateAsync();
        UserLabel.Text = state.Session is null ? string.Empty : $"{state.Session.User.Prenom} {state.Session.User.Nom}";
        await LoadAsync();
    }

    private async Task LoadAsync()
    {
        _companies.Clear();
        var companies = await ServiceHelper.GetService<CompanyService>().GetAuthorizedAsync();
        foreach (var company in companies)
        {
            _companies.Add(company);
        }
    }

    private async void OnCompanySelected(object? sender, SelectionChangedEventArgs e)
    {
        if (e.CurrentSelection.FirstOrDefault() is not CompanySummary company)
        {
            return;
        }

        CompaniesView.SelectedItem = null;
        await ServiceHelper.GetService<SessionStore>().SetCompanyAsync(company);
        await Shell.Current.GoToAsync("//activities");
    }

    private async void OnRefreshClicked(object? sender, EventArgs e) => await LoadAsync();

    private async void OnLogoutClicked(object? sender, EventArgs e)
    {
        await ServiceHelper.GetService<AuthService>().LogoutAsync();
        await Shell.Current.GoToAsync("//login");
    }
}
