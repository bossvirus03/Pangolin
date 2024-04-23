import Ifca from "./type.api";
import IEvent from "./type.event";
import { IPangolinConfig } from "./type.pangolin-config";
import { IThreadData } from "./type.threadData";
import { IUserData } from "./type.userData";
import { IUserInThreadData } from "./type.userInThreadData";

interface Reply {
  name: string;
  messageID: string;
  author: string;
  value: any;
}
interface Reaction extends Reply {}

interface IClient {
  handleReply: (values: Reply) => void;
  handleReaction: (values: Reaction) => void;
}
interface IcacheCommand {
  client: IClient;
}
export interface IPangolinRun {
  api?: Ifca;
  event?: IEvent;
  client?: any;
  args?: any;
  UserData?: IUserData;
  ThreadData?: IThreadData;
  UserInThreadData?: IUserInThreadData;
  getLang?: (...args: any[]) => Promise<string>;
  pangolin?: IPangolinConfig;
  cache?: IcacheCommand;
}
export interface IPangolinOnload {
  api?: Ifca;
  client?: any;
  UserData?: IUserData;
  ThreadData?: IThreadData;
  UserInThreadData?: IUserInThreadData;
  pangolin?: IPangolinConfig;
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
  pangolin?: IPangolinConfig;
}
export interface IPangolinHandleEvent {
  api?: Ifca;
  event?: IEvent;
  client?: any;
  UserData?: IUserData;
  ThreadData?: IThreadData;
  UserInThreadData?: IUserInThreadData;
  getLang?: (...args: any[]) => Promise<string>;
  pangolin?: IPangolinConfig;
}
export interface IPangolinHandleReaction {
  api?: Ifca;
  event?: IEvent;
  client?: any;
  UserData?: IUserData;
  ThreadData?: IThreadData;
  UserInThreadData?: IUserInThreadData;
  getLang?: (...args: any[]) => Promise<string>;
  pangolin?: IPangolinConfig;
  reaction?: Reaction;
}
export interface IPangolinHandleReply {
  api?: Ifca;
  event?: IEvent;
  client?: any;
  UserData?: IUserData;
  ThreadData?: IThreadData;
  UserInThreadData?: IUserInThreadData;
  getLang?: (...args: any[]) => Promise<string>;
  pangolin?: IPangolinConfig;
  reply: Reply;
}
