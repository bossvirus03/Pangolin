import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import * as fs from "fs";
import { join } from "path";
import { exec } from "child_process";

export default class RestartCommand {
  static config = {
    name: "restart",
    version: "",
    author: "",
    createdAt: "",
    description: "",
  };

  constructor(private client) {}
  pathFile = join(process.cwd(), "/src/db/data/restart.txt");
  async run(api: Ifca, event: IEvent, client, args, DataUser, DataThread) {
    api.sendMessage(global.getLang("Restarting"), event.threadID);
    fs.writeFileSync(this.pathFile, `${Date.now()}`);
    try {
      const { stdout, stderr } = await exec("pm2 restart pangolin");
      console.log("stdout:", stdout);
      console.error("stderr:", stderr);
    } catch (error) {
      console.error("Error executing command:", error);
    }
  }
  async event(api: Ifca, event: IEvent, client, args, DataUser, DataThread) {
    if (fs.existsSync(this.pathFile)) {
      const time = parseInt(fs.readFileSync(this.pathFile, "utf-8"));
      console.log(time, Date.now());
      api.sendMessage(
        `✅ | Bot restarted\n⏰ | Time: ${(Date.now() - time) / 1000}s`,
        event.threadID
      );
      fs.unlinkSync(this.pathFile);
    }
  }
}
