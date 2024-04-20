import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class RunCommand {
  static config = {
    category: "",
    name: "run", //tên lệnh của bạn
    version: "1.0.0",
    author: "Lợi NDK-[FIX]",

    permission: 2,
    description: {
      vi: "Test code nhanh",
      en: "Test code quickly",
    },
    guide: {
      vi: "[prefix]run <đoạn code cần test>",
      en: "[prefix]run <code to test>",
    },
  };
  static message = {
    vi: {
      error: "Đã xảy ra lỗi không xác định.",
    },
    en: {
      error: "An unknown error has occurred.",
    },
  };

  constructor() {}
  async run({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    getLang,
  }: IPangolinRun) {
    function output(msg) {
      if (
        typeof msg == "number" ||
        typeof msg == "boolean" ||
        typeof msg == "function"
      )
        msg = msg.toString();
      else if (msg instanceof Map) {
        let text = `Map(${msg.size}) `;
        text += JSON.stringify(mapToObj(msg), null, 2);
        msg = text;
      } else if (typeof msg == "object") msg = JSON.stringify(msg, null, 2);
      else if (typeof msg == "undefined") msg = "undefined";

      api.sendMessage(msg, event.threadID, () => {}, event.messageID);
    }

    function out(msg) {
      output(msg);
    }

    function mapToObj(map) {
      const obj = {};
      map.forEach(function (v, k) {
        obj[k] = v;
      });
      return obj;
    }

    const run = `(async () => {
			try {
				${(event.body as string).split(args[0])[1].trim()}
			}
			catch(error) {
        let message = await getLang("error");
        if (error instanceof Error) message = error.message;
				console.log(error);
        api.sendMessage(message, event.threadID, () => {}, event.messageID);
			}
		})()`;
    eval(run);
  }
}
