import { Body, Controller, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { MockPaymentDto } from './dto/mock-payment.dto';

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('mock')
  mock(@Body() dto: MockPaymentDto) {
    return this.paymentService.mockPayment(dto);
  }
}
