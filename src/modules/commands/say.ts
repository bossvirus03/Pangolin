export default class SayCommand {
  static config = {
    name: "say",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
    description: "nói theo",
  };

  constructor(private client) {}
  async run(api, event, client, args) {
    api.sendMessage(args.join(" ").split(`${args[0]}`)[1], event.threadID);
  }
}
