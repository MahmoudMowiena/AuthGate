import { Schema,Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { Types } from "mongoose";

@Schema()
export class UserProject{
    
    @Prop({ type: Types.ObjectId, ref: 'Project' })
    projectID: Types.ObjectId;

    @Prop()
    authorizationCode:string;

    @Prop()
    authorizationAccessToken:string;

    @Prop()
    expireDate:Date;
  
}

export const userProjectSchema = SchemaFactory.createForClass(UserProject);