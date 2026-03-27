using DShow.PosMobile.Pages;

namespace DShow.PosMobile;

public partial class AppShell : Shell
{
    public AppShell()
    {
        InitializeComponent();
        Routing.RegisterRoute(nameof(RestaurantPosPage), typeof(RestaurantPosPage));
        Routing.RegisterRoute(nameof(TerracePosPage), typeof(TerracePosPage));
        Routing.RegisterRoute(nameof(ShopPosPage), typeof(ShopPosPage));
        Routing.RegisterRoute(nameof(PrinterSettingsPage), typeof(PrinterSettingsPage));
        Routing.RegisterRoute(nameof(SyncCenterPage), typeof(SyncCenterPage));
    }
}
