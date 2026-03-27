using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Storage;

namespace DShow.PosMobile.Core.Services;

public sealed class SessionStore
{
    private const string FileName = "session.json";
    private readonly JsonFileStore _fileStore;
    private AppSessionState? _cachedState;

    public event EventHandler<AppSessionState>? StateChanged;

    public SessionStore(JsonFileStore fileStore)
    {
        _fileStore = fileStore;
    }

    public async Task<AppSessionState> GetStateAsync(CancellationToken cancellationToken = default)
    {
        if (_cachedState is not null)
        {
            return _cachedState;
        }

        _cachedState = await _fileStore.ReadAsync<AppSessionState>(FileName, cancellationToken) ?? new AppSessionState();
        return _cachedState;
    }

    public async Task SaveStateAsync(AppSessionState state, CancellationToken cancellationToken = default)
    {
        _cachedState = state;
        await _fileStore.WriteAsync(FileName, state, cancellationToken);
        StateChanged?.Invoke(this, state);
    }

    public async Task UpdateApiBaseUrlAsync(string apiBaseUrl, CancellationToken cancellationToken = default)
    {
        var state = await GetStateAsync(cancellationToken);
        state.ApiBaseUrl = apiBaseUrl.Trim().TrimEnd('/');
        await SaveStateAsync(state, cancellationToken);
    }

    public async Task SetSessionAsync(AuthSession session, CancellationToken cancellationToken = default)
    {
        var state = await GetStateAsync(cancellationToken);
        state.Session = session;
        state.ActiveCompany = null;
        state.ActiveActivity = null;
        await SaveStateAsync(state, cancellationToken);
    }

    public async Task SetCompanyAsync(CompanySummary company, CancellationToken cancellationToken = default)
    {
        var state = await GetStateAsync(cancellationToken);
        state.ActiveCompany = company;
        state.ActiveActivity = null;
        await SaveStateAsync(state, cancellationToken);
    }

    public async Task SetActivityAsync(ActivitySummary activity, CancellationToken cancellationToken = default)
    {
        var state = await GetStateAsync(cancellationToken);
        state.ActiveActivity = activity;
        await SaveStateAsync(state, cancellationToken);
    }

    public async Task SetPrinterAsync(string? printerId, string? printerName, CancellationToken cancellationToken = default)
    {
        var state = await GetStateAsync(cancellationToken);
        state.SelectedPrinterId = printerId;
        state.SelectedPrinterName = printerName;
        await SaveStateAsync(state, cancellationToken);
    }

    public Task ClearAsync(CancellationToken cancellationToken = default)
        => SaveStateAsync(new AppSessionState(), cancellationToken);
}
