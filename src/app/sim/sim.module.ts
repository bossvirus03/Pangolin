import { Module } from '@nestjs/common';
import { SimService } from './sim.service';
import { SimController } from './sim.controller';

@Module({
  controllers: [SimController],
  providers: [SimService],
})
export class SimModule {}
