import { IsIn } from "class-validator";

const TERRACE_RESOURCE_STATUSES = ["LIBRE", "OCCUPEE", "RESERVEE"] as const;

export class UpdateTerraceTableStatusDto {
  @IsIn(TERRACE_RESOURCE_STATUSES)
  statut!: (typeof TERRACE_RESOURCE_STATUSES)[number];
}
