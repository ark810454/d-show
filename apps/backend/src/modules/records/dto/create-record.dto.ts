import { IsEnum, IsNumber, IsOptional, IsString, MinLength } from "class-validator";
import { RecordStatus } from "../../../common/enums/record-status.enum";

export class CreateRecordDto {
  @IsString()
  @MinLength(5)
  companyId!: string;

  @IsString()
  @MinLength(5)
  activityId!: string;

  @IsString()
  @MinLength(2)
  title!: string;

  @IsString()
  @MinLength(3)
  reference!: string;

  @IsNumber()
  amount!: number;

  @IsEnum(RecordStatus)
  status!: RecordStatus;

  @IsOptional()
  @IsString()
  payload?: string;
}
