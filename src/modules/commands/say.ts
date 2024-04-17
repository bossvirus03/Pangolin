import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class SayCommand {
  static config = {
    name: "say",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]say [câu muốn bot nói]\nChức năng: nói theo",
  };

  constructor(private client) {}
  async run({ api, event, client, args }: IPangolinRun) {
    api.sendMessage(args.join(" ").split(`${args[0]}`)[1], event.threadID);
  }
}
