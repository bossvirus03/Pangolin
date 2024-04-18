import { User } from "src/db/models/userModel";

export interface IUserData {
  set(uid: string, name: string): Promise<void>;
  setMoney(uid: string, money: number): Promise<void>;
  getAll(): Promise<User[]>;
  get(uid: string): Promise<User>;
  del(uid: string): Promise<void>;
}
