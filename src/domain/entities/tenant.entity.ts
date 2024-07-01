import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as mongoose from 'mongoose';
import { Project, projectSchema } from './project.entity';
import {
  ConflictException,
  InternalServerErrorException,
  NotAcceptableException,
} from '@nestjs/common';
import { IsString } from 'class-validator';

export type TenantDocument = Tenant & Document;

@Schema()
export class Tenant {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string;

  @Prop({
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    unique: true,
  })
  email: string;

  @Prop({
    required: true,
    validate: [
      {
        validator: function (this: Tenant, value: string) {
          return value === this.confirmPassword;
        },
        message: 'Passwords do not match',
      },
    ],
  })
  password: string;

  @Prop({ required: true })
  confirmPassword: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop({
    match: [/^(?:\+20|0)?1[0125]\d{8}$/, 'Please use a valid phone number'],
  })
  phone?: string;

  @Prop()
  address?: string;

  @Prop({
  })
  website?: string;

  @Prop()
  image?: string;

  @Prop({ type: [projectSchema], default: [] })
  projects: Project[];

  @Prop()
  role: string;

  @Prop({ default: false })
  deleted: boolean;
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

TenantSchema.pre('save', function (next) {
  if (this.isModified('password') && this.password !== this.confirmPassword) {
    next(new Error('Passwords do not match'));
  } else {
    next();
  }
});

TenantSchema.post('save', function (error, doc, next) {
  if (error.name === 'MongoServerError') {
    if (error.code === 11000) {
      if (error.message.includes('name')) {
        return next(
          new NotAcceptableException(
            'Name must be unique. This name is already taken.',
          ),
        );
      } else if (error.message.includes('email')) {
        return next(
          new NotAcceptableException(
            'Email must be unique. This email is already registered.',
          ),
        );
      }
    } else if (error.message.includes('Password must be strong')) {
      return next(new ConflictException('Password must be strong.'));
    }
  }
  return next(error);
});
