import { Schema,Prop, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";

@Schema()
export class Project{
    
    @Prop({required: true,unique:true})
    clientID:string;

    @Prop({required: true})
    clientSECRET:string;

}

export const projectSchema = SchemaFactory.createForClass(Project);