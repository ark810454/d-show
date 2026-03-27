import { CompanyStatus } from "@prisma/client";
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from "class-validator";

export class UpdateCompanyDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nom?: string;

  @IsOptional()
  @IsString()
  raisonSociale?: string;

  @IsOptional()
  @IsString()
  rccm?: string;

  @IsOptional()
  @IsString()
  idNat?: string;

  @IsOptional()
  @IsString()
  numeroImpot?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  adresse?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsEnum(CompanyStatus)
  statut?: CompanyStatus;
}

