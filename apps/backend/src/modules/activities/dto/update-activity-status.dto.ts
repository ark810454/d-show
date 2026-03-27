import { ActivityStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateActivityStatusDto {
  @IsEnum(ActivityStatus)
  statut!: ActivityStatus;
}

