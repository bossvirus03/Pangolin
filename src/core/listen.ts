class Listen {
  constructor(
    private api: any,
    private client: any
  ) {}
  listen() {
    for (let i = 0; i < this.client.onload.length; i++) {
      this.client.onload[i].onload(this.api, this.client);
    }

    this.api.setOptions({ listenEvents: true });
    this.api.listenMqtt((err, event) => {
      this.client.events.forEach((value, key) => {
        this.client.events.get(key).run(this.api, event, this.client);
      });

      const check = event.body == undefined;
      if (check) return;

      let args = event.body.trim().split(" ");
      let listNoprefix = [];
      this.client.noprefix.forEach((value, key) => {
        listNoprefix.push(key);
      });
      if (listNoprefix.includes(args[0])) {
        this.client.noprefix
          .get(args[0])
          .noprefix(this.api, event, args, this.client);
      }

      let listCommands = [];
      if (!event.body.startsWith(this.client.config.PREFIX)) {
        return;
      }
      args = event.body
        .slice(this.client.config.PREFIX.length)
        .trim()
        .split(" ");
      this.client.commands.forEach((value, key) => {
        listCommands.push(key);
      });

      if (!listCommands.includes(args[0]))
        return this.api.sendMessage(
          "Lệnh của bạn không tồn tại !!",
          event.threadID,
          event.messageID
        );
      this.client.commands.get(args[0]).run(this.api, event, args, this.client);
    });
  }
}
export default Listen;