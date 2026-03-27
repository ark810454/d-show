import { IsArray, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class AssignRoleActivityItemDto {
  @IsString()
  activityId!: string;

  @IsString()
  roleId!: string;
}

export class AssignRolesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AssignRoleActivityItemDto)
  assignments!: AssignRoleActivityItemDto[];
}

