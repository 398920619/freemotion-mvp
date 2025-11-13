import { IsBooleanString, IsOptional } from 'class-validator';

export class AdminCoachFilterDto {
  @IsOptional()
  @IsBooleanString()
  isApproved?: string;
}
