import { readdirSync } from "fs";
import * as fs from "fs";
import { join } from "path";
export default class RankUpCommand {
  static config = {
    name: "rankup",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
    description: "",
  };

  constructor(private client) {}
  async event(api, event, client, DataUser, DataThread) {
    if (!event.senderID) return;
    const thread = DataThread.rankup.get(event.threadID) || {};
    if (!thread) return;
    const user = await DataUser.get(event.senderID);
    const currentLevel = Math.floor(Math.sqrt(1 + (4 * user.exp) / 3 + 1) / 2);
    const level = Math.floor(Math.sqrt(1 + (4 * (user.exp + 1)) / 3 + 1) / 2);
    function getRandomGif(arr) {
      const randomIndex = Math.floor(Math.random() * arr.length);
      const item = arr[randomIndex];
      return item;
    }
    const gifPath = join(
      process.cwd(),
      "src",
      "database",
      "data",
      "rank",
      "gif"
    );
    const listGif = readdirSync(gifPath).filter((file: string) =>
      file.endsWith(".gif")
    );
    const randomGif = getRandomGif(listGif);
    if (level > currentLevel && level != 1) {
      api.sendMessage(
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
        event.threadID
      );
    }
  }

  async run(api, event, client, args, DataUser, DataThread) {
    console.log(args[1]);
    if (args[1] == "on") {
      await DataThread.rankup.set(event.threadID, true);
    }
    if (args[1] == "off") {
      await DataThread.rankup.set(event.threadID, false);
    }
  }
}
