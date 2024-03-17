export default class LoadAllCommand {
  static config = {
    name: "loadAll",
    version: "1.0.0",
    author: "loi",
    createdAt: "",
    description: "",
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
    console.log(users);
    const allTags = [["INBOX"], , ["OTHER"]];
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
            await listBox.forEach((item) => {
              if (!threads.includes(item.threadID)) {
                DataThread.set(item.threadID, item.name);
              }
            });

            const listUser = list.filter((item) => item.isGroup == false);
            await listUser.forEach((item) => {
              if (!users.includes(item.threadID)) {
                DataUser.set(item.threadID, item.name);
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
