import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import { IUserInThreadData } from "src/types/type.userInThreadData";
// import PQueue from "p-queue";
export default class LoadAllCommand {
  static config = {
    name: "loadAll",
    version: "1.0.0",
    author: "Lợi",
    createdAt: "",
    description:
      "[Chỉ dảnh cho ADMIN bot]:load all người dùng, thread đang hoạt động vào database",
    permission: 2,
  };

  constructor(private client) {}
  async run(
    api: Ifca,
    event: IEvent,
    client,
    args,
    DataUser,
    DataThread,
    UserInThreadData: IUserInThreadData
  ) {
    try {
      // const queue = new PQueue({ concurrency: 1 });
      const threadsData = await DataThread.getAll();
      const usersData = await DataUser.getAll();
      const threads = threadsData.map((item) => {
        return item.dataValues.tid;
      });
      const users = usersData.map((item) => {
        return item.dataValues.uid;
      });
      const userInThreads = (await UserInThreadData.getAll()).map((item) => {
        return { uid: item.dataValues.uid, tid: item.dataValues.tid };
      });
      const allTags = [["INBOX"], ["OTHER"]];
      allTags.forEach((item) => {
        const [limit, timestamp, tags, callback] = [
          10,
          null,
          item,
          async function (err, list) {
            if (err) {
              console.error("Error fetching threads:", err);
            } else {
              const listBox = list.filter((item) => item.isGroup == true);
              // get list user from group
              if (listBox.length > 0) {
                listBox.forEach((box) => {
                  const usersFromListBox = box.participants;
                  usersFromListBox.forEach(async (item) => {
                    // Thêm mỗi tác vụ vào hàng đợi
                    // queue.add(async () => {
                    if (!users.includes(item.userID)) {
                      await DataUser.set(item.userID, item.name);
                    }
                    if (
                      !userInThreads.some(
                        (data) =>
                          item.uid === item.userID && data.tid == box.tid
                      )
                    ) {
                      await UserInThreadData.set(
                        item.userID,
                        item.name,
                        box.threadID
                      );
                    }
                    // });
                  });
                });
                // await queue.onIdle();
              }

              // get list box form chat
              await listBox.forEach(async (item) => {
                if (!threads.includes(item.threadID)) {
                  // queue.add(async () => {
                  await DataThread.set(item.threadID, item.name);
                  // });
                }
              });

              // get users form chat
              const listUser = list.filter((item) => item.isGroup == false);
              await listUser.forEach(async (item) => {
                if (!users.includes(item.threadID)) {
                  // queue.add(async () => {
                  await DataUser.set(item.threadID, item.name);
                  // });
                }
              });
            }
          },
        ];
        api.getThreadList(limit, timestamp, tags, callback);
      });
      api.sendMessage(
        "[DONE] All groups and users have been loaded!",
        event.threadID
      );
    } catch (error) {
      api.sendMessage("Lỗi khi thực thi mã:" + error, event.threadID);
    }
  }
}
