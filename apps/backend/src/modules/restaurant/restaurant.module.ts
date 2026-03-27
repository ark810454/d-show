import { Module } from "@nestjs/common";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { RealtimeModule } from "../realtime/realtime.module";
import { RestaurantController } from "./restaurant.controller";
import { RestaurantService } from "./restaurant.service";

@Module({
  imports: [RealtimeModule],
  controllers: [RestaurantController],
  providers: [RestaurantService, RolesGuard, ScopeGuard],
  exports: [RestaurantService],
})
export class RestaurantModule {}

