import { IsOptional, IsString } from "class-validator";

export class ValidateNightclubTicketDto {
  @IsString()
  qrCode!: string;

  @IsOptional()
  @IsString()
  validatedByUserId?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
