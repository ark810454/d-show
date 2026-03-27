import { CompanyStatus } from "@prisma/client";
import { IsEnum } from "class-validator";

export class UpdateCompanyStatusDto {
  @IsEnum(CompanyStatus)
  statut!: CompanyStatus;
}

