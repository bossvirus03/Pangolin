import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import { IUserInThreadData } from "src/types/type.userInThreadData";

export default class CheckttCommand {
  static config = {
    name: "checktt",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    permission: 1,
    description: {
      vi: "Kiểm tra số lượt thành viên tương tác trong nhóm",
      en: "Check the number of member interactions in the group",
    },
    guide: {
      vi: "[prefix]checktt",
      en: "[prefix]checktt",
    },
  };

  static message = {
    vi: {
      listInteract: "Danh sách thành viên tương tác trong nhóm: \n$0",
    },
    en: {
      listInteract: "List member interactions in the group: \n$0",
    },
  };

  constructor(private client) {}
  async run(
    api: Ifca,
    event: IEvent,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData: IUserInThreadData,
    getLang
  ) {
    api.getThreadInfo(event.threadID, async (err, res) => {
      const users = res.participantIDs;
      const smg = await Promise.all(
        users.map(async (item) => {
          const res = await UserInThreadData.get(item, event.threadID);
          if (res) {
            return { name: res.name, exp: res.exp };
          }
        })
      );
      smg.sort((a, b) => b.exp - a.exp);
      let smgSorted = "";
      let i = 1;
      smg.forEach((user) => {
        if (user) {
          smgSorted += `[${i}] ${user.name}: ${user.exp}\n`;
          i++;
        }
      });
      api.sendMessage(getLang("listInteract", smgSorted), event.threadID);
    });
  }
}
