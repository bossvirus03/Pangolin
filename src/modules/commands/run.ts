import { IPangolinRun } from "src/types/type.pangolin-handle";

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
  async run({ api, event, client, args, UserData, ThreadData }: IPangolinRun) {
    // const script = (event.body as string).split(args[0])[1].trim();
    const script = `(api, event, client, args, UserData, ThreadData) => {
      ${(event.body as string).split(args[0])[1].trim()}
  }`;
    try {
      const scriptFunction = eval(script);
      scriptFunction(api, event, client, args, UserData, ThreadData);
    } catch (error) {
      api.sendMessage("Lỗi khi thực thi mã: " + error, event.threadID);
    }
  }
}
