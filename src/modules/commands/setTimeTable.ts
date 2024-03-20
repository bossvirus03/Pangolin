export default class SayCommand {
  static config = {
    name: "settimetable",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "set tkb",
  };

  constructor(private client) {}
  async run(api, event, client, args) {
    //   api.sendMessage(args.join(" ").split(`${args[0]}`)[1], event.threadID);
  }
}
