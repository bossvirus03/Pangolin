import { UserInThread } from "src/database/models/userInThreadModel";

export interface IUserInThreadData {
  get(uid: string, tid: string): Promise<UserInThread>;
  set(uid: string, name: string, tid: string): Promise<any>;
  getAll(): Promise<UserInThread[]>;
}
