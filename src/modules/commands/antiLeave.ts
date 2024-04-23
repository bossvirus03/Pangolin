import {
  IPangolinHandleEvent,
  IPangolinNoprefix,
  IPangolinRun,
} from "src/types/type.pangolin-handle";

export default class ClassName {
  static config = {
    name: "antileave", //your command name
    version: "1.0.0",
    author: "Lợi",
    category: "GROUP",
    description: {
      vi: "Chặn thành viên ra khỏi nhóm",
      en: "Block members from the group",
    },
    guide: {
      vi: "[prefix]antileave on/off",
      en: "[prefix]antileave on/off",
    },
  };

  static message = {
    vi: {
      onModule: "Đã bật chế độ cấm thành viên out box",
      offModule: "Đã tắt chế độ cấm thành viên out box",
      dontAllow: "Không được đâu ní ơi :>>",
    },
    en: {
      onModule: "Enabled mode to prohibit members from out box",
      offModule: "Disabled mode to disable members from out box",
      dontAllow: "No way :>>",
    },
  };

  constructor(private client) {}
  async run({ api, event, args, ThreadData, getLang }: IPangolinRun) {
    if (args[1] == "on") {
      await ThreadData.antileave.set(event.threadID, true);
      api.sendMessage(getLang("onModule"), event.threadID);
    }
    if (args[1] == "off") {
      await ThreadData.antileave.set(event.threadID, false);
      api.sendMessage(getLang("offModule"), event.threadID);
    }
  }
  async handleEvent({
    api,
    event,
    client,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }: IPangolinHandleEvent) {
    if (!event.isGroup) return;
    if (!(await ThreadData.antileave.get(event.threadID))) return;
    if (event.logMessageType === "log:unsubscribe") {
      const UID_BOT = await api.getCurrentUserID();
      if (event.logMessageData.leftParticipantFbId === UID_BOT) return;
      else {
        new Promise<void>((resolve, reject) => {
          api.addUserToGroup(
            event.logMessageData.leftParticipantFbId,
            event.threadID,
          );
        }).then(() => {
          api.sendMessage(getLang("dontAllow"), event.threadID);
        });
      }
    }
  }
}
