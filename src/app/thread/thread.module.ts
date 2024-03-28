import { Module } from "@nestjs/common";
import { ThreadService } from "./thread.service";
import { ThreadController } from "./thread.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { join } from "path";
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
      models: [Thread],
    }),
    SequelizeModule.forFeature([Thread]),
  ],
  controllers: [ThreadController],
  providers: [ThreadService],
})
export class ThreadModule {}
