import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class SetTimeTableCommand {
  static config = {
    name: "settimetable",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "set tkb",
  };

  constructor(private client) {}
  async run(api: Ifca, event: IEvent, client, args) {
    //   api.sendMessage(args.join(" ").split(`${args[0]}`)[1], event.threadID);
  }
}
