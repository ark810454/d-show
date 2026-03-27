import { Module } from "@nestjs/common";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { RealtimeModule } from "../realtime/realtime.module";
import { TerraceController } from "./terrace.controller";
import { TerraceService } from "./terrace.service";

@Module({
  imports: [RealtimeModule],
  controllers: [TerraceController],
  providers: [TerraceService, RolesGuard, ScopeGuard],
})
export class TerraceModule {}

