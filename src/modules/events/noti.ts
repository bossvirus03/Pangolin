export default class NotiCommand {
  static config = {
    name: "noti",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
  };

  constructor(private client) {}

  run(api, event, args) {
    // Your run logic here
  }

  onload(api, client) {
    // Your onload logic here
  }
}
