import { Module } from "@nestjs/common";
import { RolesGuard } from "../../common/guards/roles.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { RealtimeModule } from "../realtime/realtime.module";
import { NightclubController } from "./nightclub.controller";
import { NightclubService } from "./nightclub.service";

@Module({
  imports: [RealtimeModule],
  controllers: [NightclubController],
  providers: [NightclubService, RolesGuard, ScopeGuard],
})
export class NightclubModule {}
