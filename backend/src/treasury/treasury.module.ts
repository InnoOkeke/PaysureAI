import { Global, Module } from "@nestjs/common";
import { OutlayerService } from "./outlayer.service";
import { SputnikDaoService } from "./sputnik-dao.service";
import { TreasuryService } from "./treasury.service";
import { TreasuryController } from "./treasury.controller";

@Global()
@Module({
  controllers: [TreasuryController],
  providers: [OutlayerService, SputnikDaoService, TreasuryService],
  exports: [OutlayerService, SputnikDaoService, TreasuryService],
})
export class TreasuryModule {}
