import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PaypalService } from 'src/infrastructure/paypal/paypal.service';
import { PaypalController } from 'src/presentation/controllers/paypal.controller';
import {
  PaypalTransactionSchema,
  PaypalTransaction,
} from 'src/domain/entities/paypal.entity';
import { PaypalTransactionService } from 'src/infrastructure/paypal/paypal-transaction.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: PaypalTransaction.name, schema: PaypalTransactionSchema },
    ]),
  ],
  controllers: [PaypalController],
  providers: [PaypalService, PaypalTransactionService],
})
export class PaypalModule {}
