import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class AllCommand {
  static config = {
    name: "all", //your command name
    version: "1.0.0",
    author: "Lợi",
    description: {
      vi: "",
      en: "",
    },
    guide: {
      vi: "",
      en: "",
    },
  };

  static message = {
    vi: {
      notGroup: "Chỉ sử dụng trong nhóm chat",
      text2: "",
    },
    en: {
      notGroup: "only use it in groups",
      text2: "",
    },
  };

  constructor(private client) {}
  async run({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }: IPangolinRun) {
    if (!event.isGroup) {
      return api.sendMessage(
        getLang("notGroup"),
        event.threadID,
        () => {},
        event.messageID,
      );
    }
    const { participantIDs }: any = await new Promise(
      async (resolve, reject) => {
        await api.getThreadInfo(event.threadID, (err, info) => {
          if (err) return reject(err);
          return resolve(info);
        });
      },
    );
    const lengthAllUser = participantIDs.length;
    const mentions = [];
    let body = args.join(" ") || "@all";
    let bodyLength = body.length;
    let i = 0;
    for (const uid of participantIDs) {
      let fromIndex = 0;
      if (bodyLength < lengthAllUser) {
        body += body[bodyLength - 1];
        bodyLength++;
      }
      if (body.slice(0, i).lastIndexOf(body[i]) != -1) fromIndex = i;
      mentions.push({
        tag: body[i],
        id: uid,
        fromIndex,
      });
      i++;
    }
    api.sendMessage({ body, mentions }, event.threadID);
  }
}
