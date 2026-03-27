import { PaymentMethod } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class CreateNightclubBottlePaymentDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  bottleOrderId!: string;

  @IsOptional()
  @IsString()
  processedByUserId?: string;

  montant!: number;

  @IsEnum(PaymentMethod)
  modePaiement!: PaymentMethod;
}
