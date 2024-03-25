import { Injectable } from "@nestjs/common";
import { User } from "src/database/models/userModel";
import { Sequelize } from "sequelize-typescript";
import { InjectModel } from "@nestjs/sequelize";

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
    private readonly sequelize: Sequelize
  ) {}

  async findAll(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async findByUid(uid: string): Promise<User> {
    return this.userModel.findOne({ where: { uid } });
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.userModel.create(userData);
  }

  async rawQuery(sql: string): Promise<any[]> {
    return this.sequelize.query(sql, { raw: true });
  }
}
