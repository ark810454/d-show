import { IsDateString, IsOptional } from "class-validator";

export class RestaurantStatsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}

