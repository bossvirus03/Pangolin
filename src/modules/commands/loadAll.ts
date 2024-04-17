import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";
import { IPangolinRun } from "src/types/type.pangolin-handle";
import { IUserInThreadData } from "src/types/type.userInThreadData";
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
  async run({
    api,
    event,
    UserData,
    ThreadData,
    UserInThreadData,
  }: IPangolinRun) {
    try {
      const threadsData = await ThreadData.getAll();
      const threads = threadsData.map((item) => {
        return item.dataValues.tid;
      });
      let usersData = await UserData.getAll();
      let users = usersData.map((item) => {
        return item.dataValues.uid;
      });
      const userInThreads = (await UserInThreadData.getAll()).map((item) => {
        return item.dataValues.uniqueId;
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
                    usersData = await UserData.getAll();
                    users = usersData.map((item) => {
                      return item.dataValues.uid;
                    });
                    if (!users.includes(item.userID)) {
                      const createUser = new Promise<void>(
                        async (resolve, reject) => {
                          try {
                            await UserData.set(item.userID, item.name); // Assuming UserData.set() returns a promise
                            resolve(); // Resolve the promise when the user creation is successful
                          } catch (error) {
                            reject(error); // Reject the promise if there's an error during user creation
                          }
                        },
                      );

                      Promise.all([createUser])
                        .then(() => {
                          console.log("User created successfully");
                        })
                        .catch((error) => {
                          console.error("Error creating user:", error);
                        });
                    }
                    if (!userInThreads.includes(`${item.userID}${box.tid}`)) {
                      await UserInThreadData.set(
                        item.userID,
                        item.name,
                        box.threadID,
                      );
                    }
                  });
                });
              }

              // get list box form chat
              await listBox.forEach(async (item) => {
                if (!threads.includes(item.threadID)) {
                  await ThreadData.set(item.threadID, item.name);
                }
              });

              const listUser = list.filter((item) => item.isGroup == false);
              await listUser.forEach(async (item) => {
                usersData = await UserData.getAll();
                users = usersData.map((item) => {
                  return item.dataValues.uid;
                });
                if (!users.includes(item.userID)) {
                  const createUser = new Promise<void>(
                    async (resolve, reject) => {
                      try {
                        await UserData.set(item.userID, item.name); // Assuming UserData.set() returns a promise
                        resolve(); // Resolve the promise when the user creation is successful
                      } catch (error) {
                        reject(error); // Reject the promise if there's an error during user creation
                      }
                    },
                  );

                  Promise.all([createUser])
                    .then(() => {
                      console.log("User created successfully");
                    })
                    .catch((error) => {
                      console.error("Error creating user:", error);
                    });
                }
              });
            }
          },
        ];
        api.getThreadList(limit, timestamp, tags, callback);
      });
      api.sendMessage(
        "[DONE] All groups and users have been loaded!",
        event.threadID,
      );
    } catch (error) {
      api.sendMessage("Lỗi khi thực thi mã:" + error, event.threadID);
    }
  }
}
