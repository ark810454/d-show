import { IsDateString, IsOptional, IsString } from "class-validator";

export class DashboardStatsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  activityId?: string;
}

