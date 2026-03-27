import { TerraceOrderStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateTerraceOrderStatusDto {
  @IsEnum(TerraceOrderStatus)
  statut!: TerraceOrderStatus;
}

