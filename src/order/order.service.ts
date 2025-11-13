import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { PayOrderDto } from './dto/pay-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';
import { OrderStatus, UserRole } from '@prisma/client';

@Injectable()
export class OrderService {
  private readonly autoCompleteHours = 48;

  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: number, dto: CreateOrderDto) {
    const coach = await this.prisma.coachProfile.findUnique({ where: { id: dto.coachId } });
    if (!coach || !coach.isApproved || !coach.isActive) {
      throw new BadRequestException('Coach is not available');
    }
    const scheduledAt = new Date(dto.scheduledAt);
    if (scheduledAt.getTime() < Date.now()) {
      throw new BadRequestException('Schedule time must be in the future');
    }
    return this.prisma.order.create({
      data: {
        coachId: coach.id,
        userId,
        price: coach.price,
        scheduledAt,
        autoCompleteAt: this.addHours(scheduledAt, this.autoCompleteHours),
      },
    });
  }

  async listUserOrders(userId: number, filter: OrderFilterDto) {
    return this.prisma.order.findMany({
      where: { userId, status: filter.status },
      include: this.defaultOrderInclude(),
      orderBy: { createdAt: 'desc' },
    });
  }

  async listCoachOrders(coachId: number, filter: OrderFilterDto) {
    return this.prisma.order.findMany({
      where: { coachId, status: filter.status },
      include: this.defaultOrderInclude(),
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async getOrderForParticipant(orderId: number, payload: { userId: number; role: UserRole }) {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: this.defaultOrderInclude(),
    });
    if (!order) {
      throw new NotFoundException('Order not found');
    }
    if (payload.role === UserRole.USER && order.userId !== payload.userId) {
      throw new ForbiddenException('You cannot view this order');
    }
    if (payload.role === UserRole.COACH) {
      const coachProfile = await this.prisma.coachProfile.findUnique({ where: { userId: payload.userId } });
      if (!coachProfile || order.coachId !== coachProfile.id) {
        throw new ForbiddenException('You cannot view this order');
      }
    }
    return order;
  }

  async payOrder(userId: number, orderId: number, _dto: PayOrderDto) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId } });
    if (!order || order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }
    if (order.status !== OrderStatus.PENDING) {
      throw new BadRequestException('Order already paid');
    }
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.PAID, autoCompleteAt: this.addHours(new Date(), this.autoCompleteHours) },
    });
  }

  async completeOrder(orderId: number) {
    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.COMPLETED },
    });
  }

  async completeOrderByActor(orderId: number, payload: { userId: number; role: UserRole }) {
    const order = await this.getOrderForParticipant(orderId, payload);
    if (order.status !== OrderStatus.PAID) {
      throw new BadRequestException('Order not paid yet');
    }
    return this.prisma.order.update({
      where: { id: order.id },
      data: { status: OrderStatus.COMPLETED },
    });
  }

  private addHours(date: Date, hours: number) {
    const ms = date.getTime() + hours * 60 * 60 * 1000;
    return new Date(ms);
  }

  private defaultOrderInclude() {
    return {
      user: { select: { id: true, nickname: true, phone: true } },
      coach: {
        select: {
          id: true,
          city: true,
          skills: true,
          price: true,
          user: { select: { id: true, nickname: true } },
        },
      },
    };
  }
}
