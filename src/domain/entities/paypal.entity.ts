import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaypalTransactionDocument = PaypalTransaction & Document;

@Schema()
export class PaypalTransaction {
  @Prop({ type: Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
  orderId: string;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  amount: number;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true })
  payerEmail: string;

  @Prop({ required: true })
  payerName: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const PaypalTransactionSchema =
  SchemaFactory.createForClass(PaypalTransaction);
