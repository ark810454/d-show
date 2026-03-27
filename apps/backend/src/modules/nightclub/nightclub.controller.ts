import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ActivityContext } from "../../common/decorators/activity-context.decorator";
import { CompanyContext } from "../../common/decorators/company-context.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { CreateNightclubBookingDto } from "./dto/create-nightclub-booking.dto";
import { CreateNightclubBottleCategoryDto } from "./dto/create-nightclub-bottle-category.dto";
import { CreateNightclubBottleItemDto } from "./dto/create-nightclub-bottle-item.dto";
import { CreateNightclubBottleOrderDto } from "./dto/create-nightclub-bottle-order.dto";
import { CreateNightclubBottlePaymentDto } from "./dto/create-nightclub-bottle-payment.dto";
import { CreateNightclubEventDto } from "./dto/create-nightclub-event.dto";
import { CreateNightclubTicketDto } from "./dto/create-nightclub-ticket.dto";
import { CreateNightclubZoneDto } from "./dto/create-nightclub-zone.dto";
import { UpdateNightclubBookingStatusDto } from "./dto/update-nightclub-booking-status.dto";
import { UpdateNightclubBottleOrderStatusDto } from "./dto/update-nightclub-bottle-order-status.dto";
import { UpdateNightclubZoneStatusDto } from "./dto/update-nightclub-zone-status.dto";
import { ValidateNightclubTicketDto } from "./dto/validate-nightclub-ticket.dto";
import { NightclubService } from "./nightclub.service";

@UseGuards(JwtAuthGuard, ScopeGuard, RolesGuard)
@Controller("nightclub")
export class NightclubController {
  constructor(private readonly nightclubService: NightclubService) {}

  @Get("dashboard")
  dashboard(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.nightclubService.dashboard(companyId, activityId);
  }

  @Roles("super_admin", "admin_entreprise", "manager")
  @Post("zones")
  createZone(@Body() dto: CreateNightclubZoneDto) {
    return this.nightclubService.createZone(dto);
  }

  @Get("zones")
  zones(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.nightclubService.listZones(companyId, activityId);
  }

  @Patch("zones/:id/status")
  updateZoneStatus(@Param("id") id: string, @CompanyContext() companyId: string, @ActivityContext() activityId: string, @Body() dto: UpdateNightclubZoneStatusDto) {
    return this.nightclubService.updateZoneStatus(id, companyId, activityId, dto.statut);
  }

  @Roles("super_admin", "admin_entreprise", "manager", "dj")
  @Post("events")
  createEvent(@Body() dto: CreateNightclubEventDto) {
    return this.nightclubService.createEvent(dto);
  }

  @Get("events")
  events(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.nightclubService.listEvents(companyId, activityId);
  }

  @Roles("super_admin", "admin_entreprise", "manager", "caissier")
  @Post("tickets")
  createTicket(@Body() dto: CreateNightclubTicketDto) {
    return this.nightclubService.createTicket(dto);
  }

  @Get("tickets")
  tickets(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.nightclubService.listTickets(companyId, activityId);
  }

  @Roles("super_admin", "admin_entreprise", "manager", "caissier")
  @Post("tickets/validate")
  validateTicket(@CompanyContext() companyId: string, @ActivityContext() activityId: string, @Body() dto: ValidateNightclubTicketDto) {
    return this.nightclubService.validateTicket(companyId, activityId, dto);
  }

  @Roles("super_admin", "admin_entreprise", "manager")
  @Post("bookings")
  createBooking(@Body() dto: CreateNightclubBookingDto) {
    return this.nightclubService.createBooking(dto);
  }

  @Get("bookings")
  bookings(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.nightclubService.listBookings(companyId, activityId);
  }

  @Patch("bookings/:id/status")
  updateBookingStatus(@Param("id") id: string, @CompanyContext() companyId: string, @ActivityContext() activityId: string, @Body() dto: UpdateNightclubBookingStatusDto) {
    return this.nightclubService.updateBookingStatus(id, companyId, activityId, dto.statut);
  }

  @Roles("super_admin", "admin_entreprise", "manager")
  @Post("bottles/categories")
  createBottleCategory(@Body() dto: CreateNightclubBottleCategoryDto) {
    return this.nightclubService.createBottleCategory(dto);
  }

  @Roles("super_admin", "admin_entreprise", "manager")
  @Post("bottles/items")
  createBottleItem(@Body() dto: CreateNightclubBottleItemDto) {
    return this.nightclubService.createBottleItem(dto);
  }

  @Get("bottles/menu")
  bottleMenu(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.nightclubService.bottleMenu(companyId, activityId);
  }

  @Roles("super_admin", "admin_entreprise", "manager", "serveur", "vendeur")
  @Post("bottle-orders")
  createBottleOrder(@Body() dto: CreateNightclubBottleOrderDto) {
    return this.nightclubService.createBottleOrder(dto);
  }

  @Get("bottle-orders")
  bottleOrders(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.nightclubService.bottleOrders(companyId, activityId);
  }

  @Patch("bottle-orders/:id/status")
  updateBottleOrderStatus(@Param("id") id: string, @CompanyContext() companyId: string, @ActivityContext() activityId: string, @Body() dto: UpdateNightclubBottleOrderStatusDto) {
    return this.nightclubService.updateBottleOrderStatus(id, companyId, activityId, dto.statut);
  }

  @Roles("super_admin", "admin_entreprise", "manager", "caissier")
  @Post("bottle-payments")
  createBottlePayment(@Body() dto: CreateNightclubBottlePaymentDto) {
    return this.nightclubService.createBottlePayment(dto);
  }

  @Get("vip")
  vip(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.nightclubService.vipOverview(companyId, activityId);
  }

  @Get("stats")
  stats(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.nightclubService.stats(companyId, activityId);
  }
}
