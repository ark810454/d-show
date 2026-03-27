import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";

type ScopedPayload = {
  companyId?: string;
  activityId?: string | null;
  [key: string]: unknown;
};

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class RealtimeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  handleConnection(client: Socket) {
    const { companyId, activityId } = client.handshake.auth ?? {};
    if (companyId) {
      client.join(this.getCompanyRoom(String(companyId)));
    }
    if (companyId && activityId) {
      client.join(this.getActivityRoom(String(companyId), String(activityId)));
    }
  }

  handleDisconnect(_client: Socket) {}

  @SubscribeMessage("ping")
  handlePing(@MessageBody() payload: unknown) {
    return { event: "pong", payload };
  }

  @SubscribeMessage("scope.join")
  handleJoinScope(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { companyId?: string; activityId?: string | null },
  ) {
    if (payload.companyId) {
      client.join(this.getCompanyRoom(payload.companyId));
    }
    if (payload.companyId && payload.activityId) {
      client.join(this.getActivityRoom(payload.companyId, payload.activityId));
    }
    return { joined: payload };
  }

  @SubscribeMessage("scope.leave")
  handleLeaveScope(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: { companyId?: string; activityId?: string | null },
  ) {
    if (payload.companyId) {
      client.leave(this.getCompanyRoom(payload.companyId));
    }
    if (payload.companyId && payload.activityId) {
      client.leave(this.getActivityRoom(payload.companyId, payload.activityId));
    }
    return { left: payload };
  }

  broadcastRecordCreated(record: unknown) {
    this.server.emit("record.created", record);
  }

  broadcastRestaurantOrderCreated(payload: ScopedPayload) {
    this.emitScoped("restaurant.order.created", payload);
    this.emitScoped("sync.order.created", payload);
  }

  broadcastKitchenTicketCreated(payload: ScopedPayload) {
    this.emitScoped("restaurant.kitchen.created", payload);
  }

  broadcastKitchenStatusUpdated(payload: ScopedPayload) {
    this.emitScoped("restaurant.kitchen.status", payload);
    this.emitScoped("sync.order.updated", payload);
  }

  broadcastRestaurantDishReady(payload: ScopedPayload) {
    this.emitScoped("restaurant.dish.ready", payload);
    this.emitScoped("sync.order.ready", payload);
  }

  broadcastRestaurantPaymentCreated(payload: ScopedPayload) {
    this.emitScoped("restaurant.payment.created", payload);
    this.emitScoped("sync.payment.validated", payload);
  }

  broadcastRestaurantTableUpdated(payload: ScopedPayload) {
    this.emitScoped("restaurant.table.updated", payload);
    this.emitScoped("sync.table.updated", payload);
  }

  broadcastTerraceOrderCreated(payload: ScopedPayload) {
    this.emitScoped("terrace.order.created", payload);
    this.emitScoped("sync.order.created", payload);
  }

  broadcastTerraceOrderStatusUpdated(payload: ScopedPayload) {
    this.emitScoped("terrace.order.status", payload);
    this.emitScoped("sync.order.updated", payload);
  }

  broadcastTerracePaymentCreated(payload: ScopedPayload) {
    this.emitScoped("terrace.payment.created", payload);
    this.emitScoped("sync.payment.validated", payload);
  }

  broadcastTerraceTableUpdated(payload: ScopedPayload) {
    this.emitScoped("terrace.table.updated", payload);
    this.emitScoped("sync.table.updated", payload);
  }

  broadcastNightclubEventCreated(payload: ScopedPayload) {
    this.emitScoped("nightclub.event.created", payload);
  }

  broadcastNightclubTicketCreated(payload: ScopedPayload) {
    this.emitScoped("nightclub.ticket.created", payload);
  }

  broadcastNightclubTicketValidated(payload: ScopedPayload) {
    this.emitScoped("nightclub.ticket.validated", payload);
    this.emitScoped("sync.ticket.validated", payload);
  }

  broadcastNightclubReservationUpdated(payload: ScopedPayload) {
    this.emitScoped("nightclub.reservation.updated", payload);
    this.emitScoped("sync.reservation.updated", payload);
  }

  broadcastNightclubBottleSaleUpdated(payload: ScopedPayload) {
    this.emitScoped("nightclub.bottle.updated", payload);
    this.emitScoped("sync.order.updated", payload);
  }

  broadcastShopSaleCreated(payload: ScopedPayload) {
    this.emitScoped("shop.sale.created", payload);
    this.emitScoped("sync.order.created", payload);
  }

  broadcastShopStockUpdated(payload: ScopedPayload) {
    this.emitScoped("shop.stock.updated", payload);
    this.emitScoped("sync.stock.updated", payload);
  }

  private emitScoped(event: string, payload: ScopedPayload) {
    if (!payload.companyId) {
      this.server.emit(event, payload);
      return;
    }

    this.server.to(this.getCompanyRoom(payload.companyId)).emit(event, payload);

    if (payload.activityId) {
      this.server.to(this.getActivityRoom(payload.companyId, payload.activityId)).emit(event, payload);
    }
  }

  private getCompanyRoom(companyId: string) {
    return `company:${companyId}`;
  }

  private getActivityRoom(companyId: string, activityId: string) {
    return `activity:${companyId}:${activityId}`;
  }
}
