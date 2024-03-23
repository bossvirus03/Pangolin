import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class RankCommand {
  static config = {
    name: "", //tên lệnh của bạn
    version: "",
    author: "",
    createdAt: "",
    description: "",
  };

  constructor(private client) {}
  async run(api: Ifca, event: IEvent, client, args, DataUser, DataThread) {
    // logic here
  }
  async event(api: Ifca, event: IEvent, client, args, DataUser, DataThread) {
    // logic
  }
  async noprefix(api: Ifca, event: IEvent, client, args, DataUser, DataThread) {
    // logic
  }
}
