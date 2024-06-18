import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, Types } from 'mongoose';
import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

@Schema({ timestamps: true })
export class Project extends Document {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop()
  @IsString()
  @IsOptional()
  clientID: string;

  @Prop()
  @IsString()
  @IsOptional()
  clientSECRET: string;

  @Prop({ required: true })
  @IsString()
  @IsNotEmpty()
  name: string;

  @Prop({ required: true })
  @IsString()
  @IsUrl()
  @IsNotEmpty()
  callBackUrl: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const projectSchema = SchemaFactory.createForClass(Project);
