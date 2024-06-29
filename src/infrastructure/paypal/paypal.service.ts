import { Injectable } from '@nestjs/common';
import * as paypal from '@paypal/checkout-server-sdk';
import { Environment } from '@paypal/checkout-server-sdk';
import { PaypalTransactionService } from './paypal-transaction.service';

@Injectable()
export class PaypalService {
  private payPalClient: paypal.core.PayPalHttpClient;

  constructor(private paypalTransactionService: PaypalTransactionService) {
    let environment: Environment;
    if (process.env.NODE_ENV === 'production') {
      environment = new paypal.core.LiveEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET,
      );
    } else {
      environment = new paypal.core.SandboxEnvironment(
        process.env.PAYPAL_CLIENT_ID,
        process.env.PAYPAL_CLIENT_SECRET,
      );
    }
    this.payPalClient = new paypal.core.PayPalHttpClient(environment);
  }

  async createOrder() {
    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'USD',
            value: '5.00',
            description: 'Buy me a coffee',
          },
        },
      ],
      application_context: {
        return_url: 'http://localhost:4200/paypal/callback', // Your callback URL
        cancel_url: 'http://localhost:4200/paypal/cancel', // Your cancel URL
      },
    });

    const order = await this.payPalClient.execute(request);
    return order.result;
  }

  async captureOrder(orderId: string) {
    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.requestBody({});
    const capture = await this.payPalClient.execute(request);

    const transactionData = {
      orderId: capture.result.id,
      status: capture.result.status,
      amount: capture.result.purchase_units[0].amount.value,
      currency: capture.result.purchase_units[0].amount.currency_code,
      payerEmail: capture.result.payer.email_address,
      payerName: `${capture.result.payer.name.given_name} ${capture.result.payer.name.surname}`,
    };

    //await this.paypalTransactionService.createTransaction(transactionData);

    return capture.result;
  }
}
