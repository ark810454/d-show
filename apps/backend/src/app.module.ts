import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppController } from "./app.controller";
import { PrismaModule } from "./config/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { RolesModule } from "./modules/roles/roles.module";
import { CompaniesModule } from "./modules/companies/companies.module";
import { FinanceModule } from "./modules/finance/finance.module";
import { ActivitiesModule } from "./modules/activities/activities.module";
import { NightclubModule } from "./modules/nightclub/nightclub.module";
import { RestaurantModule } from "./modules/restaurant/restaurant.module";
import { ShopModule } from "./modules/shop/shop.module";
import { TerraceModule } from "./modules/terrace/terrace.module";
import { StatsModule } from "./modules/stats/stats.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RolesModule,
    CompaniesModule,
    FinanceModule,
    ActivitiesModule,
    NightclubModule,
    RestaurantModule,
    ShopModule,
    TerraceModule,
    StatsModule,
    RealtimeModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
