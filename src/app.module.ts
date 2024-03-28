import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ConfigModule } from "@nestjs/config";
import { UserModule } from "./app/user/user.module";
import { ThreadModule } from "./app/thread/thread.module";
import { SimModule } from "./app/sim/sim.module";
import { AuthModule } from './app/auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
    }),
    UserModule,
    ThreadModule,
    SimModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
