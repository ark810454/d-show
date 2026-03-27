import { ResourceStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateNightclubZoneStatusDto {
  @IsEnum(ResourceStatus)
  statut!: ResourceStatus;
}
