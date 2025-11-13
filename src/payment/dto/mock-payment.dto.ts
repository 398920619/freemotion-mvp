import { IsEnum, IsInt } from 'class-validator';
import { OrderStatus } from '@prisma/client';

export class MockPaymentDto {
  @IsInt()
  orderId!: number;

  @IsEnum(OrderStatus)
  status!: OrderStatus;
}
