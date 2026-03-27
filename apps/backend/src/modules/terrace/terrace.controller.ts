import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { ActivityContext } from "../../common/decorators/activity-context.decorator";
import { CompanyContext } from "../../common/decorators/company-context.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { CreateHappyHourDto } from "./dto/create-happy-hour.dto";
import { CreateTerraceCategoryDto } from "./dto/create-terrace-category.dto";
import { CreateTerraceItemDto } from "./dto/create-terrace-item.dto";
import { CreateTerraceOrderDto } from "./dto/create-terrace-order.dto";
import { CreateTerracePaymentDto } from "./dto/create-terrace-payment.dto";
import { CreateTerraceTableDto } from "./dto/create-terrace-table.dto";
import { UpdateTerraceOrderStatusDto } from "./dto/update-terrace-order-status.dto";
import { UpdateTerraceTableStatusDto } from "./dto/update-terrace-table-status.dto";
import { TerraceService } from "./terrace.service";

@UseGuards(JwtAuthGuard, ScopeGuard, RolesGuard)
@Controller("terrace")
export class TerraceController {
  constructor(private readonly terraceService: TerraceService) {}

  @Roles("super_admin", "admin_entreprise", "manager", "serveur")
  @Post("tables")
  createTable(@Body() dto: CreateTerraceTableDto) {
    return this.terraceService.createTable(dto);
  }

  @Get("tables")
  tables(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.terraceService.listTables(companyId, activityId);
  }

  @Patch("tables/:id/status")
  updateTableStatus(@Param("id") id: string, @CompanyContext() companyId: string, @ActivityContext() activityId: string, @Body() dto: UpdateTerraceTableStatusDto) {
    return this.terraceService.updateTableStatus(id, companyId, activityId, dto.statut);
  }

  @Post("menu/categories")
  createCategory(@Body() dto: CreateTerraceCategoryDto) {
    return this.terraceService.createCategory(dto);
  }

  @Post("menu/items")
  createItem(@Body() dto: CreateTerraceItemDto) {
    return this.terraceService.createItem(dto);
  }

  @Get("menu")
  menu(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.terraceService.menu(companyId, activityId);
  }

  @Post("happy-hours")
  createHappyHour(@Body() dto: CreateHappyHourDto) {
    return this.terraceService.createHappyHour(dto);
  }

  @Get("happy-hours")
  happyHours(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.terraceService.happyHours(companyId, activityId);
  }

  @Post("orders")
  createOrder(@Body() dto: CreateTerraceOrderDto) {
    return this.terraceService.createOrder(dto);
  }

  @Get("orders")
  orders(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.terraceService.orders(companyId, activityId);
  }

  @Patch("orders/:id/status")
  updateStatus(@Param("id") id: string, @CompanyContext() companyId: string, @ActivityContext() activityId: string, @Body() dto: UpdateTerraceOrderStatusDto) {
    return this.terraceService.updateOrderStatus(id, companyId, activityId, dto.statut);
  }

  @Post("payments")
  createPayment(@Body() dto: CreateTerracePaymentDto) {
    return this.terraceService.createPayment(dto);
  }

  @Get("stats")
  stats(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.terraceService.stats(companyId, activityId);
  }
}
