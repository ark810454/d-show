using System.Collections.ObjectModel;
using DShow.PosMobile.Core;
using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services;
using DShow.PosMobile.Core.Services.Api;
using DShow.PosMobile.Core.Services.Realtime;

namespace DShow.PosMobile.Pages;

public partial class ActivitySelectionPage : ContentPage
{
    private readonly ObservableCollection<ActivitySummary> _activities = [];

    public ActivitySelectionPage()
    {
        InitializeComponent();
        ActivitiesView.ItemsSource = _activities;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        var state = await ServiceHelper.GetService<SessionStore>().GetStateAsync();
        CompanyLabel.Text = state.ActiveCompany?.Nom ?? "Entreprise non selectionnee";
        await LoadAsync();
    }

    private async Task LoadAsync()
    {
        _activities.Clear();
        var state = await ServiceHelper.GetService<SessionStore>().GetStateAsync();
        if (state.ActiveCompany is null)
        {
            await Shell.Current.GoToAsync("//companies");
            return;
        }

        var activities = await ServiceHelper.GetService<ActivityService>().ListByCompanyAsync(state.ActiveCompany.Id);
        foreach (var activity in activities)
        {
            _activities.Add(activity);
        }
    }

    private async void OnActivitySelected(object? sender, SelectionChangedEventArgs e)
    {
        if (e.CurrentSelection.FirstOrDefault() is not ActivitySummary activity)
        {
            return;
        }

        ActivitiesView.SelectedItem = null;
        await ServiceHelper.GetService<SessionStore>().SetActivityAsync(activity);
        await ServiceHelper.GetService<IRealtimeSyncService>().ScopeAsync(activity.CompanyId, activity.Id);
        await Shell.Current.GoToAsync("//hub");
    }

    private async void OnBackClicked(object? sender, EventArgs e) => await Shell.Current.GoToAsync("//companies");
    private async void OnRefreshClicked(object? sender, EventArgs e) => await LoadAsync();
}
