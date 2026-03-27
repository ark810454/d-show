import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { CompanyContext } from "../../common/decorators/company-context.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { ScopeGuard } from "../../common/guards/scope.guard";
import { DashboardStatsQueryDto } from "./dto/dashboard-stats-query.dto";
import { StatsService } from "./stats.service";

@UseGuards(JwtAuthGuard, ScopeGuard)
@Controller("stats")
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get("dashboard")
  getDashboard(@CompanyContext() companyId: string, @Query() query: DashboardStatsQueryDto) {
    return this.statsService.getDashboard(companyId, query);
  }
}

