export default class NameCommand {
  static config = {
    category: "",
    name: "", //your command name
    version: "",
    author: "",

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
  async run({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }) {
    // logic here
  }
  async event({
    api,
    event,
    client,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }) {
    //no agrs
    // logic
  }
  async noprefix({
    api,
    event,
    client,
    args,
    UserData,
    ThreadData,
    UserInThreadData,
    getLang,
  }) {
    // logic
  }
}
