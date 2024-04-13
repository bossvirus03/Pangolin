import Ifca from "src/types/type.api";
import IEvent from "src/types/type.event";

export default class NameCommand {
  static config = {
    name: "", //your command name
    version: "",
    author: "",
    createdAt: "",
    description: {
      vi: "",
      en: "",
    },
    guide: {
      vi: "",
      en: "",
    },
  };

  static message = {
    vi: {
      text1: "",
      text2: "",
    },
    en: {
      text1: "",
      text2: "",
    },
  };

  constructor(private client) {}
  async run(
    api: Ifca,
    event: IEvent,
    client,
    args,
    DataUser,
    DataThread,
    UserInThreadData,
    getLang
  ) {
    // logic here
  }
  async event(api: Ifca, event: IEvent, client, DataUser, DataThread) {
    //no agrs
    // logic
  }
  async noprefix(
    api: Ifca,
    event: IEvent,
    client,
    args,
    DataUser,
    DataThread,
    UserInThreadData,
    getLang
  ) {
    // logic
  }
}
