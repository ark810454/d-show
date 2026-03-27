import { PaymentMethod } from "@prisma/client";
import { IsEnum, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateRestaurantPaymentDto {
  @IsString()
  companyId!: string;

  @IsString()
  activityId!: string;

  @IsString()
  restaurantOrderId!: string;

  @IsOptional()
  @IsString()
  processedByUserId?: string;

  @IsNumber()
  @Min(0)
  montant!: number;

  @IsEnum(PaymentMethod)
  modePaiement!: PaymentMethod;

  @IsOptional()
  @IsString()
  note?: string;
}

