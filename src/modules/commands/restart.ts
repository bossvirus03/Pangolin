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
    fs.writeFileSync(this.pathFile, `${Date.now()} ${event.threadID}`);
    try {
      const { stdout, stderr } = await exec("pm2 restart pangolin");
      console.log("stdout:", stdout);
      console.error("stderr:", stderr);
    } catch (error) {
      console.error("Error executing command:", error);
    }
  }
  async onload(api: Ifca, event: IEvent, client, args, DataUser, DataThread) {
    const [time, threadID]: [number, string] = await new Promise(
      async (rs, rj) => {
        const dataRestart = fs.readFileSync(this.pathFile, "utf-8").split(" ");
        const threadID = dataRestart[1];
        const time = await parseInt(dataRestart[0]);
        rs([time, threadID]);
      }
    );
    Promise.all([time]);
    const timeNow = Date.now();
    api.sendMessage(`Done restarted | ${(timeNow - time) / 1000}s`, threadID);
  }
}
