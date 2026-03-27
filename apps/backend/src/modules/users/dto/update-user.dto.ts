import { IsEmail, IsIn, IsOptional, IsString, MinLength } from "class-validator";

const USER_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
type UserStatusValue = (typeof USER_STATUSES)[number];

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  nom?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  prenom?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsOptional()
  @IsString()
  @MinLength(8)
  motDePasse?: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsIn(USER_STATUSES)
  statut?: UserStatusValue;
}
