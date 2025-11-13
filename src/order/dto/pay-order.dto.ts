import { IsOptional, IsString } from 'class-validator';

export class PayOrderDto {
  @IsOptional()
  @IsString()
  paymentMethod?: string;
}
