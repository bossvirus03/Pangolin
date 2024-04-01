import { OmitType } from "@nestjs/mapped-types";
import { CreateUserDto } from "./create-user.dto";
import mongoose from "mongoose";

export class UpdateUserDto extends OmitType(CreateUserDto, [
  "password",
] as const) {
  _id: mongoose.Types.ObjectId;
  name: string;
  username: string;
  status: string;
  gender: string;
  email: string;
  role: string;
}
