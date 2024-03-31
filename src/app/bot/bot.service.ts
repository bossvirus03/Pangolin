import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { Thread } from "src/db/models/threadModel";
import { User } from "src/db/models/userModel";

@Injectable()
export class BotService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    @InjectModel(Thread)
    private readonly threadModel: typeof Thread,
    private readonly sequelize: Sequelize
  ) {}
  async findAllUser(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findByUid(uid: string): Promise<User> {
    return this.userModel.findOne({ where: { uid } });
  }

  findAllThread() {
    return this.threadModel.findAll();
  }

  findByTid(tid: string) {
    return this.threadModel.findOne({ where: { tid } });
  }

  async rawQuery(sql: string): Promise<any[]> {
    return this.sequelize.query(sql, { raw: true });
  }
}
