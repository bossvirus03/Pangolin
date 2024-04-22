import { IPangolinRun } from "src/types/type.pangolin-handle";

export default class CheckttCommand {
  static config = {
    name: "poststory",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    permission: 2,
    description: {
      vi: "",
      en: "",
    },
    guide: {
      vi: "[prefix]poststory",
      en: "[prefix]poststory",
    },
  };

  static message = {
    vi: {
      listInteract: "$0",
    },
    en: {
      listInteract: "$0",
    },
  };

  constructor(private client) {}

  async run({ api, event, args }: IPangolinRun) {
    new Promise<void>(() => {
      const caption = (event.body as string).split(args[0])[1];
      api.postTextStory(caption, "233490655168261", "525779004528357"); //tạm thời fix cứng font và background
    }).then(() => {
      api.sendMessage("Đã đăng story thành công", event.threadID);
    });
  }
}
