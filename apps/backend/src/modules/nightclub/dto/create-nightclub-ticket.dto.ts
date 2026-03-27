import { NightclubTicketType } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class CreateNightclubTicketDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsOptional()
  @IsString()
  clientId?: string;

  @IsOptional()
  @IsString()
  eventId?: string;

  @IsOptional()
  @IsString()
  bookingId?: string;

  @IsEnum(NightclubTicketType)
  typeTicket!: NightclubTicketType;

  montant!: number;

  @IsOptional()
  @IsString()
  note?: string;
}
