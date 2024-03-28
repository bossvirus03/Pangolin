import { Controller, Get, Param } from "@nestjs/common";
import { ThreadService } from "./thread.service";
import { Thread } from "src/database/models/threadModel";
@Controller("thread")
export class ThreadController {
  constructor(private readonly threadService: ThreadService) {}
  @Get()
  async findAll(): Promise<Thread[]> {
    return this.threadService.findAll();
  }

  @Get(":tid")
  findOne(@Param("tid") tid: string) {
    return this.threadService.findOne(tid);
  }
}
