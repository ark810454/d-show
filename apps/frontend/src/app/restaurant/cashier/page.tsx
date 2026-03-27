"use client";

import { useEffect, useState } from "react";
import { PaymentPanel } from "@/components/restaurant/payment-panel";
import { restaurantService } from "@/services/restaurant-service";
import { useAppStore } from "@/store/app-store";
import { useRestaurantSocket } from "@/hooks/restaurant/use-restaurant-socket";

export default function RestaurantCashierPage() {
  const activeContext = useAppStore((state) => state.activeContext);
  const user = useAppStore((state) => state.user);
  const [orders, setOrders] = useState<any[]>([]);

  async function loadOrders() {
    const data = await restaurantService.orders();
    setOrders(data);
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  useRestaurantSocket({
    "restaurant.order.created": () => void loadOrders(),
    "restaurant.payment.created": () => void loadOrders(),
  });

  return (
    <main className="min-h-screen p-4 lg:p-6">
      <div className="mx-auto grid max-w-4xl gap-6">
        <PaymentPanel
          orders={orders}
          companyId={activeContext.companyId}
          activityId={activeContext.activityId}
          userId={user?.id}
          onPay={async (payload) => {
            await restaurantService.createPayment(payload);
            await loadOrders();
          }}
        />
      </div>
    </main>
  );
}

