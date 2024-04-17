import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class TimeTableCommand {
  static config = {
    name: "timetable",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "get tkb",
  };

  constructor(private client) {}
  async run({ api, event, client, args }: IPangolinRun) {
    //   api.sendMessage(args.join(" ").split(`${args[0]}`)[1], event.threadID);
  }
}
