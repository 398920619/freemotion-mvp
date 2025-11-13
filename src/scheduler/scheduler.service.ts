import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { OrderStatus } from '@prisma/client';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_10_MINUTES)
  async autoCompleteOrders() {
    const now = new Date();
    const orders = await this.prisma.order.findMany({
      where: { status: OrderStatus.PAID, autoCompleteAt: { lte: now } },
    });
    if (orders.length === 0) {
      return;
    }
    await this.prisma.order.updateMany({
      where: { id: { in: orders.map((o) => o.id) } },
      data: { status: OrderStatus.COMPLETED },
    });
    this.logger.log(`Auto completed ${orders.length} orders`);
  }
}
