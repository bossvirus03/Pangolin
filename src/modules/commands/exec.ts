import { IPangolinRun } from "src/types/type.pangolin-handle";
import { exec } from "child_process";
export default class ExecCommand {
  static config = {
    name: "exec",
    version: "1.0.0",
    author: "Nguyên Blue",
    category: "TOOL",
    permission: 2,
    description: {
      vi: "chạy câu lệnh dưới terminal",
      en: "run command in terminal",
    },
    guide: {
      vi: "[prefix]exec [command]",
      en: "[prefix]exec [command]",
    },
  };

  static message = {
    vi: {
      syntaxError: "Bạn chưa nhập lệnh",
      error: "Đã xảy ra lỗi không xác định.",
    },
    en: {
      error: "An unknown error has occurred.",
      syntaxError: "You have not entered a command",
    },
  };

  constructor(private client) {}
  async run({ api, event, args, getLang }: IPangolinRun) {
    const command = args.join(" ");
    if (!command)
      return api.sendMessage(
        getLang("syntaxError"),
        event.threadID,
        () => {},
        event.messageID,
      );
    exec(command, (err: any, stdout: any, stderr: any) => {
      if (err) {
        api.sendMessage(
          getLang("error"),
          event.threadID,
          () => {},
          event.messageID,
        );
        console.error(err);
        return;
      }
      api.sendMessage(
        `${stdout}\n${stderr}`,
        event.threadID,
        () => {},
        event.messageID,
      );
    });
  }
}
