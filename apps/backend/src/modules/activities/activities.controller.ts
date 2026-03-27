import { Body, Controller, Get, Param, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ActivitiesService } from "./activities.service";
import { CreateActivityDto } from "./dto/create-activity.dto";
import { UpdateActivityDto } from "./dto/update-activity.dto";
import { UpdateActivityStatusDto } from "./dto/update-activity-status.dto";

@UseGuards(JwtAuthGuard)
@Controller("activities")
export class ActivitiesController {
  constructor(private readonly activitiesService: ActivitiesService) {}

  @Post()
  create(@Body() dto: CreateActivityDto) {
    return this.activitiesService.create(dto);
  }

  @Get("company/:companyId")
  findByCompany(@Param("companyId") companyId: string, @CurrentUser() user: any) {
    return this.activitiesService.findByCompany(companyId, user);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.activitiesService.findOne(id);
  }

  @Patch(":id")
  update(@Param("id") id: string, @Body() dto: UpdateActivityDto) {
    return this.activitiesService.update(id, dto);
  }

  @Patch(":id/status")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateActivityStatusDto) {
    return this.activitiesService.updateStatus(id, dto.statut);
  }
}
