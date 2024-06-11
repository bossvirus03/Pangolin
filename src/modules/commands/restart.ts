import * as fs from "fs";
import { join } from "path";
import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class RestartCommand {
  static config = {
    category: "ADMIN",
    name: "restart",
    version: "1.0.0",
    author: "Lợi",
    description: "",
    permission: 2,
  };

  constructor(private client) {}
  pathFile = join(process.cwd(), "/src/db/data/restart.txt");
  async run({ api, event }: IPangolinRun) {
    api.sendMessage(global.getLang("Restarting"), event.threadID);
    fs.writeFileSync(this.pathFile, `${Date.now()} ${event.threadID}`);
    try {
      process.exit(2);
    } catch (error) {
      console.error("Error executing command:", error);
    }
  }
  async onload({ api }) {
    if (fs.existsSync(this.pathFile)) {
      const [time, threadID]: [number, string] = await new Promise(
        async (rs, rj) => {
          const dataRestart = fs
            .readFileSync(this.pathFile, "utf-8")
            .split(" ");
          const threadID = dataRestart[1];
          const time = await parseInt(dataRestart[0]);
          rs([time, threadID]);
        },
      );
      Promise.all([time]);
      const timeNow = Date.now();
      api.sendMessage(`Done restarted | ${(timeNow - time) / 1000}s`, threadID);
      fs.unlinkSync(this.pathFile);
    }
  }
}
