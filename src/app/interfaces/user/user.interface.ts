import mongoose from "mongoose";

export default interface IUser {
  _id: mongoose.Types.ObjectId;
  username: string;
  email: string;
  gender: string;
  role: string;
  password: string;
}
