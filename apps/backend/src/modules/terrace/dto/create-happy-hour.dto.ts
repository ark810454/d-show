import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";

export class CreateHappyHourDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  nom!: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  reductionPct!: number;

  @IsString()
  startTime!: string;

  @IsString()
  endTime!: string;

  @IsString()
  joursSemaine!: string;

  @IsOptional()
  @IsBoolean()
  actif?: boolean;
}

