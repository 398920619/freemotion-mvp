import { IsDateString, IsInt } from 'class-validator';

export class CreateOrderDto {
  @IsInt()
  coachId!: number;

  @IsDateString()
  scheduledAt!: string;
}
