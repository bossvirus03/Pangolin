export default class LoadAllCommand {
  static config = {
    name: "loadAll",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
    description: "",
    permission: 2,
  };

  constructor(private client) {}
  async run(api, event, client, args, DataUser, DataThread) {
    const threadsData = await DataThread.getAll();
    const usersData = await DataUser.getAll();
    // console.log("threads.dataValues", { ...threads });
    const threads = threadsData.map((item) => {
      return item.dataValues.tid;
    });
    const users = usersData.map((item) => {
      return item.dataValues.uid;
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
                  if (!users.includes(item.userID)) {
                    await DataUser.set(item.userID, item.name);
                  }
                });
              });
            }

            // get list box form chat
            await listBox.forEach(async (item) => {
              if (!threads.includes(item.threadID)) {
                await DataThread.set(item.threadID, item.name);
              }
            });

            // get users form chat
            const listUser = list.filter((item) => item.isGroup == false);
            await listUser.forEach(async (item) => {
              if (!users.includes(item.threadID)) {
                await DataUser.set(item.threadID, item.name);
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
  }
}
