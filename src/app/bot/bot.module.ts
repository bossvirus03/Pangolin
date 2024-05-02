import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotController } from "./bot.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { join } from "path";
import { User } from "./../../db/models/userModel";
import { Thread } from "./../../db/models/threadModel";
import { UserInThread } from "./../../db/models/userInThreadModel";
@Module({
  imports: [
    SequelizeModule.forRoot({
      logging: false,
      dialect: "sqlite",
      storage: join(process.cwd(), "/src/db/data/database.sqlite"),
      define: {
        timestamps: false,
      },
      models: [User, Thread, UserInThread],
    }),
    SequelizeModule.forFeature([User, Thread, UserInThread]),
  ],
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule {}
