import { ReservationStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateNightclubBookingStatusDto {
  @IsEnum(ReservationStatus)
  statut!: ReservationStatus;
}
