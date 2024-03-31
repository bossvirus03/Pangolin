import { Module } from "@nestjs/common";
import { BotService } from "./bot.service";
import { BotController } from "./bot.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { join } from "path";
import { User } from "src/db/models/userModel";
import { Thread } from "src/db/models/threadModel";
@Module({
  imports: [
    SequelizeModule.forRoot({
      logging: false,
      dialect: "sqlite",
      storage: join(process.cwd(), "/src/db/data/database.sqlite"),
      define: {
        timestamps: false,
      },
      models: [User, Thread],
    }),
    SequelizeModule.forFeature([User, Thread]),
  ],
  controllers: [BotController],
  providers: [BotService],
})
export class BotModule {}
