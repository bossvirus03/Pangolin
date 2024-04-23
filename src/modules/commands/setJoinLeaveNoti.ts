import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class Setjoinleavnoti {
  static config = {
    name: "setjoinleavnoti",
    version: "1.0.0",
    author: "Lợi",
    description: {
      vi: "Bật tắt thông báo khi thành viên (rời khỏi/vào) nhóm",
      en: "Toggle notifications when members (leave/join) the group",
    },
    guide: {
      vi: "[prifix]setjoinleavnoti on/off",
      en: "[prifix]setjoinleavnoti on/off",
    },
    permission: 1,
  };

  static message = {
    vi: {
      onModule: "Đã bật chế độ thông báo khi thành viên ra/vào box",
      offModule: "Đã tắt chế độ thông báo khi thành viên ra/vào box",
    },
    en: {
      onModule: "Enabled mode to when members join/leave from box",
      offModule: "Disabled mode to when members join/leave from box",
    },
  };

  constructor(private client) {}
  async run({ api, event, args, ThreadData, getLang }: IPangolinRun) {
    if (args[1] == "on") {
      await ThreadData.joinLeaveNoti.set(event.threadID, true);
      api.sendMessage(getLang("offModule"), event.threadID, event.messageID);
    }
    if (args[1] == "off") {
      await ThreadData.joinLeaveNoti.set(event.threadID, false);
      api.sendMessage(getLang("offModule"), event.threadID, event.messageID);
    }
  }
}
