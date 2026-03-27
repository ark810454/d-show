import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ActivityContext } from "../../common/decorators/activity-context.decorator";
import { CompanyContext } from "../../common/decorators/company-context.decorator";
import { Roles } from "../../common/decorators/roles.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { CreateShopCategoryDto } from "./dto/create-shop-category.dto";
import { CreateShopProductDto } from "./dto/create-shop-product.dto";
import { CreateShopPromotionDto } from "./dto/create-shop-promotion.dto";
import { CreateShopSaleDto } from "./dto/create-shop-sale.dto";
import { ProductSearchQueryDto } from "./dto/product-search-query.dto";
import { UpdateShopProductDto } from "./dto/update-shop-product.dto";
import { ShopService } from "./shop.service";

@UseGuards(JwtAuthGuard, ScopeGuard, RolesGuard)
@Controller("shop")
export class ShopController {
  constructor(private readonly shopService: ShopService) {}

  @Post("categories")
  @Roles("super_admin", "admin_entreprise", "manager", "vendeur")
  createCategory(@Body() dto: CreateShopCategoryDto) {
    return this.shopService.createCategory(dto);
  }

  @Get("categories")
  categories(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.shopService.categories(companyId, activityId);
  }

  @Post("products")
  @Roles("super_admin", "admin_entreprise", "manager", "vendeur")
  createProduct(@Body() dto: CreateShopProductDto) {
    return this.shopService.createProduct(dto);
  }

  @Get("products")
  products(@CompanyContext() companyId: string, @ActivityContext() activityId: string, @Query() query: ProductSearchQueryDto) {
    return this.shopService.products(companyId, activityId, query.q);
  }

  @Patch("products/:id")
  @Roles("super_admin", "admin_entreprise", "manager", "vendeur")
  updateProduct(@Param("id") id: string, @CompanyContext() companyId: string, @ActivityContext() activityId: string, @Body() dto: UpdateShopProductDto) {
    return this.shopService.updateProduct(id, companyId, activityId, dto);
  }

  @Post("promotions")
  @Roles("super_admin", "admin_entreprise", "manager", "vendeur")
  createPromotion(@Body() dto: CreateShopPromotionDto) {
    return this.shopService.createPromotion(dto);
  }

  @Get("promotions")
  promotions(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.shopService.promotions(companyId, activityId);
  }

  @Post("sales")
  @Roles("super_admin", "admin_entreprise", "manager", "vendeur", "caissier")
  createSale(@Body() dto: CreateShopSaleDto) {
    return this.shopService.createSale(dto);
  }

  @Get("sales")
  sales(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.shopService.sales(companyId, activityId);
  }

  @Get("alerts/low-stock")
  lowStock(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.shopService.lowStock(companyId, activityId);
  }

  @Get("inventory/movements")
  stockMovements(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.shopService.stockMovements(companyId, activityId);
  }

  @Get("stats")
  stats(@CompanyContext() companyId: string, @ActivityContext() activityId: string) {
    return this.shopService.stats(companyId, activityId);
  }
}
