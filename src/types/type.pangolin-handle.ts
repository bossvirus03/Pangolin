import Ifca from "./type.api";
import IEvent from "./type.event";
import { IThreadData } from "./type.threadData";
import { IUserData } from "./type.userData";
import { IUserInThreadData } from "./type.userInThreadData";

export interface IPangolinRun {
  api?: Ifca;
  event?: IEvent;
  client?: any;
  args?: any;
  UserData?: IUserData;
  ThreadData?: IThreadData;
  UserInThreadData?: IUserInThreadData;
  getLang?: (...args: any[]) => Promise<string>;
}
export interface IPangolinNoprefix extends IPangolinRun {}
export interface IPangolinEvent {
  api?: Ifca;
  event?: IEvent;
  client?: any;
  UserData?: IUserData;
  ThreadData?: IThreadData;
  UserInThreadData?: IUserInThreadData;
  getLang?: (...args: any[]) => Promise<string>;
}
export interface IPangolinListenEvent {
  api?: Ifca;
  event?: IEvent;
  client?: any;
  UserData?: IUserData;
  ThreadData?: IThreadData;
  UserInThreadData?: IUserInThreadData;
  getLang?: (...args: any[]) => Promise<string>;
}
