export default class RankCommand {
  static config = {
    name: "", //tên lệnh của bạn
    version: "",
    author: "",
    createdAt: "",
    description: "",
  };

  constructor(private client) {}
  async run(api, event, client, args, DataUser, DataThread) {
    // logic here
  }
  async event(api, event, client, args, DataUser, DataThread) {
    // logic
  }
  async noprefix(api, event, client, args, DataUser, DataThread) {
    // logic
  }
}
