import { Module } from "@nestjs/common";
import { UserService } from "./user.service";
import { UserController } from "./user.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "src/database/models/userModel";
import { join } from "path";

@Module({
  imports: [
    SequelizeModule.forRoot({
      logging: false,
      dialect: "sqlite",
      storage: join(process.cwd(), "/src/database/data/database.sqlite"),
      define: {
        timestamps: false,
      },
      models: [User],
    }),
    SequelizeModule.forFeature([User]),
  ],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
