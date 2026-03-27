using System.Collections.ObjectModel;
using DShow.PosMobile.Core;
using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services.Sync;

namespace DShow.PosMobile.Pages;

public partial class SyncCenterPage : ContentPage
{
    private readonly ObservableCollection<PendingOperation> _items = [];

    public SyncCenterPage()
    {
        InitializeComponent();
        QueueView.ItemsSource = _items;
    }

    protected override async void OnAppearing()
    {
        base.OnAppearing();
        await RefreshAsync();
    }

    private async Task RefreshAsync()
    {
        _items.Clear();
        var items = await ServiceHelper.GetService<SyncQueueService>().GetItemsAsync();
        foreach (var item in items)
        {
            _items.Add(item);
        }

        SyncStatusLabel.Text = $"{_items.Count} operation(s) dans la file.";
    }

    private async void OnReplayClicked(object? sender, EventArgs e)
    {
        var synced = await ServiceHelper.GetService<SyncQueueService>().ReplayPendingAsync();
        SyncStatusLabel.Text = $"{synced} operation(s) synchronisee(s).";
        await RefreshAsync();
    }

    private async void OnBackClicked(object? sender, EventArgs e) => await Shell.Current.GoToAsync("//hub");
}
