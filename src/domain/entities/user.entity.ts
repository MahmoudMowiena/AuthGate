import { Schema,Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { UserProject } from "./userProject.entity";

export type UserDocument = User & Document;

@Schema()
export class User{
   
    @Prop({required: true})
    name:string;

    @Prop({required: true,unique:true})
    email:string;

    @Prop({required: true})
    password:string;

    @Prop()
    phone:string;

    @Prop()
    token:string;

    @Prop()
    image:string;

    @Prop()
    age:number;

    @Prop({type:[UserProject]})
    projects:UserProject[];
}

export const userSchema = SchemaFactory.createForClass(User);