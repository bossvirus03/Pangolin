import * as cache from "memory-cache";
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

      args = event.body
        .slice(this.client.config.PREFIX.length)
        .trim()
        .split(" ");

      this.client.commands.forEach((value, key) => {
        listCommands.push(key);
      });

      let commandEventOn = cache.get("command-event-on") ?? [];
      if (commandEventOn) {
        if (event.body.startsWith(this.client.config.PREFIX)) {
          if (listCommands.includes(args[0])) {
            this.client.commands
              .get(args[0])
              .run(this.api, event, args, this.client);
          } else {
            this.api.sendMessage("Lệnh của bạn không hợp lệ!!", event.threadID);
          }
        } else {
          commandEventOn.forEach((command) => {
            this.client.commands
              .get(command.command)
              .run(this.api, event, args, this.client);
          });
        }
        // return;
      } else {
        if (!event.body.startsWith(this.client.config.PREFIX)) return;
        if (!listCommands.includes(args[0])) {
          return this.api.sendMessage(
            "Lệnh của bạn không hợp lệ!!",
            event.messageID,
            event.threadID
          );
        }
        this.client.commands
          .get(args[0])
          .run(this.api, event, args, this.client);
      }
    });
  }
}
export default Listen;
