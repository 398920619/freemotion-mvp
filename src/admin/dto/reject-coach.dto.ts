import { IsNotEmpty, IsString } from 'class-validator';

export class RejectCoachDto {
  @IsNotEmpty()
  @IsString()
  reason!: string;
}
