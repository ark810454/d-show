import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreateExpenseDto {
  @IsString()
  companyId!: string;

  @IsOptional()
  @IsString()
  activityId?: string;

  @IsString()
  financeAccountId!: string;

  @IsOptional()
  @IsString()
  userId?: string;

  montant!: number;

  @IsDateString()
  dateTransaction!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  justificatif?: string;
}
