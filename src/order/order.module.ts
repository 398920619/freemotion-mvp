import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { RolesGuard } from '../common/guards/roles.guard';

@Module({
  providers: [OrderService, RolesGuard],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
