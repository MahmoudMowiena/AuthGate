import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { IsString, IsNotEmpty, IsUrl, IsOptional } from 'class-validator';

@Schema({ timestamps: true })
export class Project extends Document {
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
}

export const projectSchema = SchemaFactory.createForClass(Project);