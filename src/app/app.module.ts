import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import OnTime from "./../modules/ontime";
@Module({
  controllers: [AppController],
  providers: [AppService, OnTime],
})
export class AppModule {}
