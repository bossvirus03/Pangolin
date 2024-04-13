interface messageReply {
  messageID?: string;
  senderID?: string;
  attachments?: any[];
  body?: string | number;
  isGroup?: boolean;
  mentions?: any;
  timestamp?: number | bigint;
}
export default interface IEvent {
  type: string;
  senderID?: string;
  body?: string | number;
  threadID?: string;
  messageID?: string;
  attachments?: any[];
  mentions?: any;
  timestamp?: string | bigint;
  isGroup?: boolean;
  statuses?: number;
  messageReply: messageReply;
  logMessageType?: string;
  logMessageData?: any;
  reaction?: string;
}
