import Ifca from "./type.api";
import IEvent from "./type.event";
import { IUserInThreadData } from "./type.userInThreadData";

export interface IPangolinRun {
  api?: Ifca;
  event?: IEvent;
  client?: any;
  args?: any;
  UserData?: any;
  ThreadData?: any;
  UserInThreadData?: IUserInThreadData;
  getLang?: (...args: any[]) => Promise<string>;
}
export interface IPangolinNoprefix extends IPangolinRun {}
export interface IPangolinEvent {
  api?: Ifca;
  event?: IEvent;
  client?: any;
  UserData?: any;
  ThreadData?: any;
  UserInThreadData?: IUserInThreadData;
  getLang?: (...args: any[]) => Promise<string>;
}
export interface IPangolinListenEvent {
  api?: Ifca;
  event?: IEvent;
  client?: any;
  UserData?: any;
  ThreadData?: any;
  UserInThreadData?: IUserInThreadData;
  getLang?: (...args: any[]) => Promise<string>;
}
