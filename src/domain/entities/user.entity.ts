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
    // match: [
    //   /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/,
    //   'Password must be strong',
    // ],
  })
  password: string;

  @Prop({
    required: true,
    validate: {
      validator: function (this: User, value: string) {
        return value === this.password;
      },
      message: 'Passwords do not match',
    },
  })
  confirmPassword: string;

  @Prop()
  phone: string;

  @Prop()
  token: string;

  @Prop()
  image: string;

  @Prop()
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
