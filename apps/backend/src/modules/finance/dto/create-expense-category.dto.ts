import { IsOptional, IsString } from "class-validator";

export class CreateExpenseCategoryDto {
  @IsString()
  companyId!: string;

  @IsString()
  code!: string;

  @IsString()
  nom!: string;

  @IsOptional()
  @IsString()
  description?: string;
}
