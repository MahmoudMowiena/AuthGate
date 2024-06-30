import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PaypalTransaction,
  PaypalTransactionDocument,
} from 'src/domain/entities/paypal.entity';

@Injectable()
export class PaypalTransactionService {
  constructor(
    @InjectModel(PaypalTransaction.name)
    private paypalTransactionModel: Model<PaypalTransactionDocument>,
  ) {}

  async createTransaction(data: any): Promise<PaypalTransaction> {
    const newTransaction = new this.paypalTransactionModel(data);
    return newTransaction.save();
  }
}
