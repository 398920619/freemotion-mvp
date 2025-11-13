import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MockPaymentDto } from './dto/mock-payment.dto';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class PaymentService {
  constructor(private readonly prisma: PrismaService) {}

  async mockPayment(dto: MockPaymentDto) {
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (order.status === OrderStatus.COMPLETED) {
      throw new BadRequestException('Order already completed');
    }
    return this.prisma.order.update({
      where: { id: dto.orderId },
      data: { status: dto.status },
    });
  }
}
