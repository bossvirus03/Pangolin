import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { ThreadModule } from "./thread/thread.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
    }),
    UserModule,
    ThreadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
