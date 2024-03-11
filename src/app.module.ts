import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import GetIpService from "libs/shared/common/services/get-IP.service";

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, GetIpService],
})
export class AppModule {}
