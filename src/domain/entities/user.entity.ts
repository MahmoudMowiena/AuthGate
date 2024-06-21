import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Types } from 'mongoose';
import { UserProject } from './userProject.entity';
import { IsString } from 'class-validator';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ type: mongoose.Schema.Types.ObjectId, auto: true })
  _id: Types.ObjectId;

  @Prop({ required: true })
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
        validator: (value: string) =>
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/.test(value),
        message:
          'Password must contain at least one uppercase letter, one lowercase letter, and one digit, and be at least 8 characters long',
      },
      {
        validator: function (this: User, value: string) {
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

  phone: string;

  @Prop()
  token: string;

  @Prop()
  image: string;

  @Prop({
    min: [13, 'Age must be at least 13'],
    max: [100, 'Age must be at most 100'],
  })
  age: number;

  @Prop({ unique: true, sparse: true })
  googleId?: string;

  @Prop({ unique: true, sparse: true })
  githubId?: string;

  @Prop({ default: false })
  deleted: boolean;

  @Prop()
  role: string;

  @Prop({ type: [UserProject] })
  projects: UserProject[];
}

export const userSchema = SchemaFactory.createForClass(User);

userSchema.pre('save', function (next) {
  if (this.isModified('password') && this.password !== this.confirmPassword) {
    next(new Error('Passwords do not match'));
  } else {
    next();
  }
});
