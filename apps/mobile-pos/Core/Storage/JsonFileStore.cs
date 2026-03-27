using System.Text.Json;

namespace DShow.PosMobile.Core.Storage;

public sealed class JsonFileStore
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNameCaseInsensitive = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
        WriteIndented = true,
    };

    public async Task<T?> ReadAsync<T>(string fileName, CancellationToken cancellationToken = default)
    {
        var path = ResolvePath(fileName);
        if (!File.Exists(path))
        {
            return default;
        }

        await using var stream = File.OpenRead(path);
        return await JsonSerializer.DeserializeAsync<T>(stream, SerializerOptions, cancellationToken);
    }

    public async Task WriteAsync<T>(string fileName, T value, CancellationToken cancellationToken = default)
    {
        var path = ResolvePath(fileName);
        Directory.CreateDirectory(Path.GetDirectoryName(path)!);
        await using var stream = File.Create(path);
        await JsonSerializer.SerializeAsync(stream, value, SerializerOptions, cancellationToken);
    }

    private static string ResolvePath(string fileName)
        => Path.Combine(FileSystem.AppDataDirectory, "store", fileName);
}
