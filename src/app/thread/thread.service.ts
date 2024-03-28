import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Sequelize } from "sequelize-typescript";
import { Thread } from "src/db/models/threadModel";

@Injectable()
export class ThreadService {
  constructor(
    @InjectModel(Thread)
    private readonly threadModel: typeof Thread,
    private readonly sequelize: Sequelize
  ) {}

  findAll() {
    return this.threadModel.findAll();
  }

  findOne(tid: string) {
    return this.threadModel.findOne({ where: { tid } });
  }

  async rawQuery(sql: string): Promise<any[]> {
    return this.sequelize.query(sql, { raw: true });
  }
}
