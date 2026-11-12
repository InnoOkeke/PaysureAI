import { Controller, Get, Post } from "@nestjs/common";
import { SeedService } from "./seed.service";

@Controller("seed")
export class SeedController {
  constructor(private readonly seed: SeedService) {}

  @Post()
  run() {
    return this.seed.seed();
  }

  @Get()
  runFromBrowser() {
    return this.seed.seed();
  }
}
