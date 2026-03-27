using System.Text.Json;
using DShow.PosMobile.Core.Models;
using DShow.PosMobile.Core.Services.Api;
using DShow.PosMobile.Core.Storage;

namespace DShow.PosMobile.Core.Services.Sync;

public sealed class SyncQueueService
{
    private const string FileName = "sync-queue.json";
    private readonly JsonFileStore _fileStore;
    private readonly ApiClient _apiClient;
    private List<PendingOperation>? _cache;

    public SyncQueueService(JsonFileStore fileStore, ApiClient apiClient)
    {
        _fileStore = fileStore;
        _apiClient = apiClient;
    }

    public async Task<IReadOnlyList<PendingOperation>> GetItemsAsync(CancellationToken cancellationToken = default)
    {
        _cache ??= await _fileStore.ReadAsync<List<PendingOperation>>(FileName, cancellationToken) ?? [];
        return _cache.OrderByDescending(item => item.CreatedAt).ToList();
    }

    public async Task EnqueueAsync(string module, string relativeUrl, object payload, bool includeActivityScope, CancellationToken cancellationToken = default)
    {
        var items = (await GetItemsAsync(cancellationToken)).ToList();
        items.Add(new PendingOperation
        {
            Module = module,
            RelativeUrl = relativeUrl,
            PayloadJson = JsonSerializer.Serialize(payload),
            IncludeActivityScope = includeActivityScope,
        });

        _cache = items;
        await _fileStore.WriteAsync(FileName, items, cancellationToken);
    }

    public async Task<int> ReplayPendingAsync(CancellationToken cancellationToken = default)
    {
        var items = (await GetItemsAsync(cancellationToken)).ToList();
        var synced = 0;

        foreach (var item in items.Where(item => item.Status is PendingOperationStatus.PendingSync or PendingOperationStatus.Failed))
        {
            try
            {
                using var response = await _apiClient.PostRawAsync(item.RelativeUrl, item.PayloadJson, item.IncludeActivityScope, cancellationToken);
                if (response.IsSuccessStatusCode)
                {
                    item.Status = PendingOperationStatus.Synced;
                    item.LastError = null;
                    synced++;
                }
                else
                {
                    item.Status = PendingOperationStatus.Failed;
                    item.LastError = await response.Content.ReadAsStringAsync(cancellationToken);
                }
            }
            catch (Exception ex)
            {
                item.Status = PendingOperationStatus.Failed;
                item.LastError = ex.Message;
            }
        }

        _cache = items;
        await _fileStore.WriteAsync(FileName, items, cancellationToken);
        return synced;
    }
}
