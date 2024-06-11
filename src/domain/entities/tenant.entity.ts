import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';
import { Project, projectSchema } from './project.entity';

export type TenantDocument = Tenant & Document;

@Schema()
export class Tenant {
  @Prop({ required: true, unique:true })
  name: string;

  @Prop({ 
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    unique:true
  })
  email: string;

  @Prop({ 
    required: true,
    match: [/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, 'Password must be strong']
  })
  password: string;

  @Prop({ 
    required: true,
    validate: {
      validator: function(this: Tenant, value: string) {
        return value === this.password;
      },
      message: 'Passwords do not match'
    }
  })
  confirmPassword: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  website?: string;

  @Prop()
  image?: string;

  @Prop({ type: [projectSchema], default: [] })
  projects: Project[];
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);


TenantSchema.pre('save', function (next) {
  if (this.password !== this.confirmPassword) {
    next(new Error('Passwords do not match'));
  } else {
    next();
  }
});
