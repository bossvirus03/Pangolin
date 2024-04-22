interface options {}

export default interface Ifca {
  /**
   *
   *
   *
   * */
  setOptions(options: any): Promise<undefined>;

  /**
   *
   *
   *
   * */
  login(): Promise<any>;
  addUserToGroup(
    userID: string,
    ThreadID: string,
    callback?: any,
  ): Promise<any>;
  changeAvt(image: any, caption: string, callback?: any): Promise<any>;
  changeAdminStatus(): Promise<any>;
  changeArchivedStatus(): Promise<any>;
  changeBlockedStatus(): Promise<any>;
  shareContact(option: any, messageID: string, threadID: string): Promise<any>;
  editMessage(message: any, messageID: any, callback?: any): Promise<undefined>;
  changeGroupImage(
    img: any,
    threadID: string,
    callback?: (err) => void,
  ): Promise<undefined>;

  changeNickname(
    newName: string,
    ThreadID: string,
    UserID: string,
    callback?: (err) => void,
  ): Promise<undefined>;

  changeThreadColor(
    color: string,
    threadID: string,
    callback?: any,
  ): Promise<any>;
  changeThreadEmoji(
    color: string,
    threadID: string,
    callback?: any,
  ): Promise<any>;
  createPoll(): Promise<any>;
  deleteMessage(): Promise<any>;
  deleteThread(): Promise<any>;
  forwardAttachment(): Promise<any>;
  getCurrentUserID(): Promise<any>;
  getEmojiUrl(): Promise<any>;
  getFriendsList(): Promise<any>;
  getThreadHistory(): Promise<any>;

  getThreadInfo(
    threadID: string,
    callback: (err: Error, info: any) => void,
  ): Promise<undefined>;

  getThreadList(
    limit: number,
    timestamp: string,
    tags: any,
    callback: (err, list) => void,
  ): Promise<undefined>;

  getThreadPictures(): Promise<any>;
  getUserID(): Promise<any>;

  getUserInfo(
    UserID: string | string[],
    callback: (err, info) => void,
  ): Promise<any>;

  handleMessageRequest(): Promise<any>;

  listenMqtt(callback: (err: Error, event: any) => void): Promise<undefined>;
  logout(): Promise<any>;

  markAsDelivered(): Promise<any>;
  markAsRead(): Promise<any>;
  markAsReadAll(): Promise<any>;
  muteThread(): Promise<any>;

  removeUserFromGroup(
    UserID: string | string[],
    ThreadID: string,
    callback?: (err) => void,
  ): Promise<any>;

  resolvePhotoUrl(): Promise<any>;
  searchForThread(): Promise<any>;

  sendMessage(
    options: any, //TODO: add sendMessage Option
    ThreadID: string,
    callback?: (err: Error, info: any) => void,
    MessageID?: any,
  ): Promise<undefined>;

  setMessageReaction(
    emoji: string,
    messageID: string,
    callback?: (err) => void,
  ): Promise<undefined>;

  setTitle(newTitle: string, threadID: string, callback?: any): Promise<any>;
  threadColors(): Promise<any>;

  unsendMessage(
    messageID: string,
    callback?: (err) => void,
  ): Promise<undefined>;

  getThreadHistoryDeprecated(): Promise<any>;
  getThreadInfoDeprecated(): Promise<any>;
  postTextStory(
    caption: string,
    font: string,
    background: string,
  ): Promise<any>;
}
