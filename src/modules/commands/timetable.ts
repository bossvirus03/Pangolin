export default class SayCommand {
  static config = {
    name: "timetable",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
    description: "get tkb",
  };

  constructor(private client) {}
  async run(api, event, client, args) {
    //   api.sendMessage(args.join(" ").split(`${args[0]}`)[1], event.threadID);
  }
}
