import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { JourneysModule } from "./journeys/journeys.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ScenesModule } from "./scenes/scenes.module";
import { SessionMiddleware } from "./session/session.middleware";

@Module({
  imports: [PrismaModule, JourneysModule, ScenesModule],
  controllers: [HealthController]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SessionMiddleware).forRoutes("*");
  }
}
