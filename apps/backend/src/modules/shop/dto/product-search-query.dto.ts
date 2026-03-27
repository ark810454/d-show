import { IsOptional, IsString } from "class-validator";

export class ProductSearchQueryDto {
  @IsOptional()
  @IsString()
  q?: string;
}
