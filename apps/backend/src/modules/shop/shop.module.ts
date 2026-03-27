import { Module } from "@nestjs/common";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { RealtimeModule } from "../realtime/realtime.module";
import { ShopController } from "./shop.controller";
import { ShopService } from "./shop.service";

@Module({
  imports: [RealtimeModule],
  controllers: [ShopController],
  providers: [ShopService, RolesGuard, ScopeGuard],
})
export class ShopModule {}
