import { Controller, Post, Body, Param } from '@nestjs/common';
import { PaypalService } from 'src/infrastructure/paypal/paypal.service';

@Controller('paypal')
export class PaypalController {
  constructor(private readonly paypalService: PaypalService) {}

  @Post('create-order')
  async createOrder() {
    const order = await this.paypalService.createOrder();
    return {
      id: order.id,
      status: order.status,
      links: order.links,
    };
  }

  @Post('capture-order/:orderId')
  async captureOrder(@Param('orderId') orderId: string) {
    const capture = await this.paypalService.captureOrder(orderId);
    return {
      id: capture.id,
      status: capture.status,
      payer: capture.payer,
    };
  }
}
