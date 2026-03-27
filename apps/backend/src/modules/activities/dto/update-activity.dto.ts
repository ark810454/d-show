import { ActivityStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString, MinLength } from "class-validator";
import { ActivityType } from "../../../common/enums/activity-type.enum";

export class UpdateActivityDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  companyId?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  nom?: string;

  @IsOptional()
  @IsString()
  code?: string;

  @IsOptional()
  @IsEnum(ActivityType)
  type?: ActivityType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(ActivityStatus)
  statut?: ActivityStatus;
}
