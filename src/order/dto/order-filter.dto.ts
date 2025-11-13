import { OrderStatus } from '@prisma/client';
import { IsEnum, IsOptional } from 'class-validator';

export class OrderFilterDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}
