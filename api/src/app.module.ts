import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { JourneysModule } from "./journeys/journeys.module";
import { PrismaModule } from "./prisma/prisma.module";
import { SessionMiddleware } from "./session/session.middleware";

@Module({
  imports: [PrismaModule, JourneysModule],
  controllers: [HealthController]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(SessionMiddleware).forRoutes("*");
  }
}
