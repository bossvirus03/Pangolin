import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose, { HydratedDocument } from "mongoose";

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop()
  username: string;

  @Prop()
  name: string;

  @Prop()
  password: string;

  @Prop()
  email: string;

  @Prop({ default: "USER" })
  role: string;

  @Prop()
  gender: string;

  @Prop()
  status: string;

  @Prop({ default: "SYSTEM" })
  type: string;

  @Prop()
  refresh_token: string;

  @Prop()
  resetPasswordExpires: Date;

  @Prop()
  resetPasswordToken: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
