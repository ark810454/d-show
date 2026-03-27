using DShow.PosMobile.Core;
using DShow.PosMobile.Core.Services;
using DShow.PosMobile.Core.Services.Api;
using DShow.PosMobile.Core.Services.Permissions;
using DShow.PosMobile.Core.Services.Printing;
using DShow.PosMobile.Core.Services.Realtime;
using DShow.PosMobile.Core.Services.Sync;
using DShow.PosMobile.Core.Storage;
using DShow.PosMobile.Pages;
using Microsoft.Extensions.Logging;

namespace DShow.PosMobile;

public static class MauiProgram
{
    public static MauiApp CreateMauiApp()
    {
        var builder = MauiApp.CreateBuilder();
        builder
            .UseMauiApp<App>()
            .ConfigureFonts(fonts =>
            {
                fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
            });

#if DEBUG
        builder.Logging.AddDebug();
#endif

        builder.Services.AddSingleton<JsonFileStore>();
        builder.Services.AddSingleton<SessionStore>();
        builder.Services.AddSingleton<ApiClient>();
        builder.Services.AddSingleton<AuthService>();
        builder.Services.AddSingleton<CompanyService>();
        builder.Services.AddSingleton<ActivityService>();
        builder.Services.AddSingleton<RestaurantMobileService>();
        builder.Services.AddSingleton<TerraceMobileService>();
        builder.Services.AddSingleton<ShopMobileService>();
        builder.Services.AddSingleton<SyncQueueService>();
        builder.Services.AddSingleton<IRealtimeSyncService, PlaceholderRealtimeSyncService>();
#if ANDROID
        builder.Services.AddSingleton<IDevicePermissionService, Platforms.Android.Services.AndroidBluetoothPermissionService>();
        builder.Services.AddSingleton<IReceiptPrinterService, Platforms.Android.Services.BluetoothReceiptPrinterService>();
#else
        builder.Services.AddSingleton<IDevicePermissionService, UnsupportedDevicePermissionService>();
        builder.Services.AddSingleton<IReceiptPrinterService, UnsupportedReceiptPrinterService>();
#endif

        builder.Services.AddSingleton<AppShell>();
        builder.Services.AddTransient<BootstrapPage>();
        builder.Services.AddTransient<LoginPage>();
        builder.Services.AddTransient<CompanySelectionPage>();
        builder.Services.AddTransient<ActivitySelectionPage>();
        builder.Services.AddTransient<PosHubPage>();
        builder.Services.AddTransient<RestaurantPosPage>();
        builder.Services.AddTransient<TerracePosPage>();
        builder.Services.AddTransient<ShopPosPage>();
        builder.Services.AddTransient<PrinterSettingsPage>();
        builder.Services.AddTransient<SyncCenterPage>();

        var app = builder.Build();
        ServiceHelper.Initialize(app.Services);
        return app;
    }
}
