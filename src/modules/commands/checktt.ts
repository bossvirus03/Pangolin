import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import { IUserInThreadData } from "src/types/type.userInThreadData";

export default class CheckttCommand {
  static config = {
    name: "checktt",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "Cách dùng: [prefix]checktt\nChức năng: Xem thông tin các thành viên trong nhóm có số tương tác",
    permission: 1,
  };

  constructor(private client) {}
  async run(
    api: Ifca,
    event: IEvent,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData: IUserInThreadData
  ) {
    api.getThreadInfo(event.threadID, async (err, res) => {
      const users = res.participantIDs;
      const smg = await Promise.all(
        users.map(async (item) => {
          const res = await UserInThreadData.get(item, event.threadID);
          return { name: res.name, exp: res.exp };
        })
      );
      smg.sort((a, b) => b.exp - a.exp);
      let smgSorted = "Danh sách tương tác trong nhóm: \n";
      let i = 1;
      smg.forEach((user) => {
        console.log(user);
        smgSorted += `[${i}] ${user.name}: ${user.exp}\n`;
        i++;
      });
      api.sendMessage(`${smgSorted}`, event.threadID);
    });
  }
}
