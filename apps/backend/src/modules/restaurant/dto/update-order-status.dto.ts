import { RestaurantOrderKitchenStatus } from "@prisma/client";
import { IsEnum, IsOptional, IsString } from "class-validator";

export class UpdateRestaurantOrderStatusDto {
  @IsEnum(RestaurantOrderKitchenStatus)
  statutCuisine!: RestaurantOrderKitchenStatus;

  @IsOptional()
  @IsString()
  handledByUserId?: string;
}

