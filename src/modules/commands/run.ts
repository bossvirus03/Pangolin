import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class RunCommand {
  static config = {
    name: "run", //tên lệnh của bạn
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description: "Cách dùng: [prefix]run [your script]",
    permission: 2,
  };

  constructor(private client) {}
  async run(api: Ifca, event: IEvent, client, args, DataUser, DataThread) {
    const script = (event.body as string).split(args[0])[1].trim();
    try {
      eval(script);
    } catch (error) {
      api.sendMessage("Lỗi khi thực thi mã:" + error, event.threadID);
    }
  }
}
