import { IsIn, IsNumber, IsOptional, IsString, Min } from "class-validator";

const PAYMENT_METHODS = ["CASH", "CARTE", "MOBILE_MONEY", "VIREMENT"] as const;

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

  @IsIn(PAYMENT_METHODS)
  modePaiement!: (typeof PAYMENT_METHODS)[number];

  @IsOptional()
  @IsString()
  note?: string;
}
