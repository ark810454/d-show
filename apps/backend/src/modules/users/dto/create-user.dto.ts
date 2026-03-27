import { UserStatus } from "@prisma/client";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class UserActivityRoleAssignmentDto {
  @IsString()
  activityId!: string;

  @IsString()
  roleId!: string;
}

export class CreateUserDto {
  @IsString()
  companyId!: string;

  @IsString()
  @MinLength(2)
  nom!: string;

  @IsString()
  @MinLength(2)
  prenom!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  telephone?: string;

  @IsString()
  @MinLength(8)
  motDePasse!: string;

  @IsOptional()
  @IsString()
  photo?: string;

  @IsOptional()
  @IsEnum(UserStatus)
  statut?: UserStatus;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserActivityRoleAssignmentDto)
  assignments!: UserActivityRoleAssignmentDto[];
}

