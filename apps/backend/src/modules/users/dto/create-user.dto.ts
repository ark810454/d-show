import {
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

const USER_STATUSES = ["ACTIVE", "INACTIVE", "SUSPENDED"] as const;
type UserStatusValue = (typeof USER_STATUSES)[number];

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
  @IsIn(USER_STATUSES)
  statut?: UserStatusValue;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserActivityRoleAssignmentDto)
  assignments!: UserActivityRoleAssignmentDto[];
}
