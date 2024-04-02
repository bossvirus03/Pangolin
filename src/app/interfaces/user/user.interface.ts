import mongoose from "mongoose";

export default interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  password: string;
  email: string;
  name: string;
  gender: string;
  role: string;
  type?: string;
  status?: string;
  resetPasswordExpires?: Date;
  resetPasswordToken?: string;
}
