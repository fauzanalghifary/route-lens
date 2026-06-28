import { Module } from "@nestjs/common";
import { ScenesController } from "./scenes.controller";
import { ScenesRepository } from "./scenes.repository";
import { ScenesService } from "./scenes.service";

@Module({
  controllers: [ScenesController],
  providers: [ScenesRepository, ScenesService]
})
export class ScenesModule {}
