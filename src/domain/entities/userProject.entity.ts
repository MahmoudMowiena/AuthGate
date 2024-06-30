import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { IsString } from 'class-validator';
import mongoose, { Types } from 'mongoose';

@Schema()
export class UserProject {
  @Prop({ type: Types.ObjectId, ref: 'Project' })
  projectID: Types.ObjectId;

  @Prop()
  authorizationCode: string;

  @Prop()
  authorizationAccessToken: string;

  @Prop()
  expireDate: Date;

  @Prop()
  @IsString()
  name: string;

  @Prop()
  callBackUrl?: string;

  @Prop()
  createdAt?: string;

  @Prop()
  updatedAt?: string;

  @Prop({ default: false })
  deleted?: boolean;
}

export const userProjectSchema = SchemaFactory.createForClass(UserProject);
