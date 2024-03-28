import { Controller } from '@nestjs/common';
import { SimService } from './sim.service';

@Controller('sim')
export class SimController {
  constructor(private readonly simService: SimService) {}
}
