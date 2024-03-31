import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { BotService } from "./bot.service";
import { User } from "src/db/models/userModel";
import { Thread } from "src/db/models/threadModel";

@Controller("bot")
export class BotController {
  constructor(private botService: BotService) {}

  @Get("user/:uid")
  async findById(@Param("uid") uid: string): Promise<User> {
    return this.botService.findByUid(uid);
  }
  @Get("user")
  async findAllUser(): Promise<User[]> {
    return this.botService.findAllUser();
  }

  @Get("thread")
  async findAllThread(): Promise<Thread[]> {
    return this.botService.findAllThread();
  }

  @Get("thread/:tid")
  findByTid(@Param("tid") tid: string) {
    return this.botService.findByTid(tid);
  }
}
