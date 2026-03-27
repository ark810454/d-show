import { Module } from "@nestjs/common";
import { RealtimeModule } from "../realtime/realtime.module";
import { RecordsController } from "./records.controller";
import { RecordsService } from "./records.service";

@Module({
  imports: [RealtimeModule],
  controllers: [RecordsController],
  providers: [RecordsService],
})
export class RecordsModule {}

