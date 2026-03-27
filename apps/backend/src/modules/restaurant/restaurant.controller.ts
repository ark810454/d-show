import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ActivityContext } from "../../common/decorators/activity-context.decorator";
import { CompanyContext } from "../../common/decorators/company-context.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { CreateMenuCategoryDto } from "./dto/create-menu-category.dto";
import { CreateMenuItemDto } from "./dto/create-menu-item.dto";
import { CreateRestaurantOrderDto } from "./dto/create-order.dto";
import { CreateRestaurantPaymentDto } from "./dto/create-payment.dto";
import { CreateRestaurantTableDto } from "./dto/create-table.dto";
import { RestaurantStatsQueryDto } from "./dto/restaurant-stats-query.dto";
import { UpdateMenuItemDto } from "./dto/update-menu-item.dto";
import { UpdateRestaurantOrderStatusDto } from "./dto/update-order-status.dto";
import { UpdateRestaurantTableStatusDto } from "./dto/update-table-status.dto";
import { RestaurantService } from "./restaurant.service";

@UseGuards(JwtAuthGuard, ScopeGuard, RolesGuard)
@Controller("restaurant")
export class RestaurantController {
  constructor(private readonly restaurantService: RestaurantService) {}

  @Roles("super_admin", "admin_entreprise", "manager", "serveur")
  @Post("tables")
  createTable(@Body() dto: CreateRestaurantTableDto) {
    return this.restaurantService.createTable(dto);
  }

  @Get("tables")
  listTables(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.restaurantService.listTables(companyId, activityId);
  }

  @Patch("tables/:id/status")
  updateTableStatus(
    @Param("id") id: string,
    @CompanyContext() companyId: string,
    @ActivityContext() activityId: string,
    @Body() dto: UpdateRestaurantTableStatusDto,
  ) {
    return this.restaurantService.updateTableStatus(id, companyId, activityId, dto.statut);
  }

  @Roles("super_admin", "admin_entreprise", "manager")
  @Post("menu/categories")
  createMenuCategory(@Body() dto: CreateMenuCategoryDto) {
    return this.restaurantService.createMenuCategory(dto);
  }

  @Roles("super_admin", "admin_entreprise", "manager")
  @Post("menu/items")
  createMenuItem(@Body() dto: CreateMenuItemDto) {
    return this.restaurantService.createMenuItem(dto);
  }

  @Roles("super_admin", "admin_entreprise", "manager")
  @Patch("menu/items/:id")
  updateMenuItem(
    @Param("id") id: string,
    @CompanyContext() companyId: string,
    @ActivityContext() activityId: string,
    @Body() dto: UpdateMenuItemDto,
  ) {
    return this.restaurantService.updateMenuItem(id, companyId, activityId, dto);
  }

  @Get("menu")
  listMenu(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.restaurantService.listMenu(companyId, activityId);
  }

  @Roles("super_admin", "admin_entreprise", "manager", "serveur")
  @Post("orders")
  createOrder(@Body() dto: CreateRestaurantOrderDto) {
    return this.restaurantService.createOrder(dto);
  }

  @Get("orders")
  listOrders(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.restaurantService.listOrders(companyId, activityId);
  }

  @Get("kitchen")
  kitchenBoard(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.restaurantService.kitchenBoard(companyId, activityId);
  }

  @Patch("kitchen/:id/status")
  updateKitchenStatus(
    @Param("id") id: string,
    @CompanyContext() companyId: string,
    @ActivityContext() activityId: string,
    @Body() dto: UpdateRestaurantOrderStatusDto,
  ) {
    return this.restaurantService.updateKitchenStatus(
      id,
      companyId,
      activityId,
      dto.statutCuisine,
      dto.handledByUserId,
    );
  }

  @Roles("super_admin", "admin_entreprise", "manager", "caissier")
  @Post("payments")
  createPayment(@Body() dto: CreateRestaurantPaymentDto) {
    return this.restaurantService.createPayment(dto);
  }

  @Get("stats")
  stats(
    @CompanyContext() companyId: string,
    @ActivityContext() activityId: string,
    @Query() query: RestaurantStatsQueryDto,
  ) {
    return this.restaurantService.restaurantStats(companyId, activityId, query);
  }
}
