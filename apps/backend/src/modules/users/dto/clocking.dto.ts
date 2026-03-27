import { IsOptional, IsString } from "class-validator";

export class ClockingDto {
  @IsOptional()
  @IsString()
  activityId?: string;

  @IsOptional()
  @IsString()
  note?: string;
}

