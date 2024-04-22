import fast from "fast-speedtest-api";
import { IPangolinRun } from "src/types/type.pangolin-handle";
export default class FastCommand {
  static config = {
    category: "TOOL",
    name: "fast",
    version: "1.0.0",
    author: "Nguyên Blue [convert] - nguồn niiozic team",
    description: {
      vi: "Xem tốc độ internet của bot",
      en: "See the bot's internet speed",
    },
    guide: {
      vi: "[prefix]fast",
      en: "[prefix]fast",
    },
  };

  static message = {
    vi: {
      canNotSend: "⚠️ Không thể speedtest ngay lúc này, hãy thử lại sau!",
    },
    en: {
      canNotSend: "⚠️ Can't speedtest right now, try again later!",
    },
  };
  constructor(private client) {}
  async run({ api, event, getLang }: IPangolinRun) {
    try {
      const speedTest = new fast({
        token: "YXNkZmFzZGxmbnNkYWZoYXNkZmhrYWxm",
        verbose: false,
        timeout: 10000,
        https: true,
        urlCount: 5,
        bufferSize: 8,
        unit: fast.UNITS.Mbps,
      });
      const resault = await speedTest.getSpeed();
      return api.sendMessage(
        "🚀 Speed: " + resault + " Mbps",
        event.threadID,
        () => {},
        event.messageID,
      );
    } catch {
      return api.sendMessage(
        getLang("canNotSend"),
        event.threadID,
        () => {},
        event.messageID,
      );
    }
  }
}
