import { NightclubBottleOrderStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateNightclubBottleOrderStatusDto {
  @IsEnum(NightclubBottleOrderStatus)
  statut!: NightclubBottleOrderStatus;
}
