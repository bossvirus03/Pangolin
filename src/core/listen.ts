import * as cache from "memory-cache";
class Listen {
  constructor(
    private api: any,
    private client: any
  ) {}
  listen() {
    const PREFIX = this.client.config.PREFIX || ";";
    for (let i = 0; i < this.client.onload.length; i++) {
      this.client.onload[i].onload(this.api, this.client);
    }

    this.api.setOptions({ listenEvents: true });
    this.api.listenMqtt((err, event) => {
      // load all event
      this.client.events.forEach((value, key) => {
        this.client.events.get(key).run(this.api, event, this.client);
      });

      //load all command event
      this.client.event.forEach((value, key) => {
        this.client.event.get(key).event(this.api, event, this.client);
      });

      if (event.body == undefined) return;
      let args = event.body.trim().split(" ");
      let listNoprefix = [];
      this.client.noprefix.forEach((value, key) => {
        listNoprefix.push(key);
      });

      if (listNoprefix.includes(args[0])) {
        this.client.noprefix
          .get(args[0])
          .noprefix(this.api, event, this.client, args);
      }

      let listCommands = [];

      args = event.body.slice(PREFIX.length).trim().split(" ");

      this.client.commands.forEach((value, key) => {
        listCommands.push(key);
      });

      //load command when cache has command-event-on
      let commandEventOn = cache.get("command-event-on") ?? [];
      if (commandEventOn) {
        if (event.body.startsWith(PREFIX)) {
          if (listCommands.includes(args[0])) {
            this.client.commands
              .get(args[0])
              .run(this.api, event, this.client, args);
          } else {
            this.api.sendMessage("Lệnh của bạn không hợp lệ!!", event.threadID);
          }
        } else {
          commandEventOn.forEach((command) => {
            this.client.commands
              .get(command.command)
              .run(this.api, event, this.client, args);
          });
        }
      }
      //load all command
      else {
        if (!event.body.startsWith(PREFIX)) return;
        if (!listCommands.includes(args[0])) {
          return this.api.sendMessage(
            "Lệnh của bạn không hợp lệ!!",
            event.messageID,
            event.threadID
          );
        }
        this.client.commands
          .get(args[0])
          .run(this.api, event, this.client, args);
      }
    });
  }
}
export default Listen;
