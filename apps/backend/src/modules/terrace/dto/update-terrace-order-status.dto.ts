import { IsIn } from "class-validator";

const TERRACE_ORDER_STATUSES = ["EN_ATTENTE", "EN_PREPARATION", "PRET", "SERVI", "ANNULE"] as const;

export class UpdateTerraceOrderStatusDto {
  @IsIn(TERRACE_ORDER_STATUSES)
  statut!: (typeof TERRACE_ORDER_STATUSES)[number];
}
