import { Body, Controller, Get, Param, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.type';
import { PayOrderDto } from './dto/pay-order.dto';
import { OrderFilterDto } from './dto/order-filter.dto';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Roles(UserRole.USER)
  @Post()
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    return this.orderService.createOrder(user.sub, dto);
  }

  @Roles(UserRole.USER)
  @Get()
  list(@CurrentUser() user: JwtPayload, @Query() filter: OrderFilterDto) {
    return this.orderService.listUserOrders(user.sub, filter);
  }

  @Roles(UserRole.USER, UserRole.COACH)
  @Get(':id')
  detail(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.getOrderForParticipant(id, { userId: user.sub, role: user.role });
  }

  @Roles(UserRole.USER)
  @Post(':id/pay')
  pay(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number, @Body() dto: PayOrderDto) {
    return this.orderService.payOrder(user.sub, id, dto);
  }

  @Roles(UserRole.USER, UserRole.COACH)
  @Post(':id/complete')
  complete(@CurrentUser() user: JwtPayload, @Param('id', ParseIntPipe) id: number) {
    return this.orderService.completeOrderByActor(id, { userId: user.sub, role: user.role });
  }
}
