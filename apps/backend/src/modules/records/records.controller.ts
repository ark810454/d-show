import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { CreateRecordDto } from "./dto/create-record.dto";
import { RecordsService } from "./records.service";

@UseGuards(JwtAuthGuard)
@Controller("records")
export class RecordsController {
  constructor(private readonly recordsService: RecordsService) {}

  @Post()
  create(@Body() dto: CreateRecordDto) {
    return this.recordsService.create(dto);
  }

  @Get("activity/:activityId")
  findByActivity(@Param("activityId") activityId: string) {
    return this.recordsService.findByActivity(activityId);
  }
}

