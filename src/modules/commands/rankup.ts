import { readdirSync } from "fs";
import * as fs from "fs";
import { join } from "path";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class RankUpCommand {
  static config = {
    category: "GROUP",
    name: "rankup",
    version: "1.0.0",
    author: "Lợi",
    description:
      "Cách dùng: [prefix]rankup [on/off]\nChức năng: bật tắt thông báo khi tăng cấp độ tương tác",
  };

  constructor(private client) {}
  async event({ api, event, client, UserData, ThreadData }: IPangolinRun) {
    if (!event.senderID) return;
    if (!event.isGroup) return;
    const thread = (await ThreadData.rankup.get(event.threadID)) || null;
    if (!thread) return;
    const user = await UserData.get(event.senderID);
    if (!user) return;
    const currentLevel = Math.floor(Math.sqrt(1 + (4 * user.exp) / 3 + 1) / 2);
    const level = Math.floor(Math.sqrt(1 + (4 * (user.exp + 1)) / 3 + 1) / 2);
    function getRandomGif(arr) {
      const randomIndex = Math.floor(Math.random() * arr.length);
      const item = arr[randomIndex];
      return item;
    }
    const gifPath = join(process.cwd(), "src", "db", "data", "rank", "gif");
    const listGif = readdirSync(gifPath).filter((file: string) =>
      file.endsWith(".gif"),
    );
    const randomGif = getRandomGif(listGif);
    if (level - currentLevel == 1 && level != 1) {
      return api.sendMessage(
        {
          body: `Chúc mừng @${user.name} đã tăng cấp`,
          mentions: [
            {
              tag: `@${user.name}`,
              id: event.senderID,
              fromIndex: 9,
            },
          ],
          attachment: fs.createReadStream(join(gifPath + "/" + randomGif)),
        },
        event.threadID,
      );
    }
  }

  async run({ api, event, client, args, UserData, ThreadData }) {
    if (args[1] == "on") {
      await ThreadData.rankup.set(event.threadID, true);
      api.sendMessage(
        "Đã bật thông báo khi tăng cấp độ tương tác",
        event.threadID,
      );
    }
    if (args[1] == "off") {
      await ThreadData.rankup.set(event.threadID, false);
      api.sendMessage(
        "Đã tắt thông báo khi tăng cấp độ tương tác",
        event.threadID,
      );
    }
  }
}
