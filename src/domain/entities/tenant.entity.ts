import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

@Schema()
export class Tenant {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  email: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  website?: string;

  @Prop()
  logo?: string;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);
