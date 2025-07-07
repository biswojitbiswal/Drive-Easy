import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AppRequestLoggerMiddleware } from "./common/middleware/req-logger.middleware";
import { APP_GUARD } from "@nestjs/core";
import { AtGuard } from "./common/guards/at.guard";
import { RolesGuard } from "./common/guards/roles.guard";
import { AuthModule } from "./auth/auth.module";
import { AddressModule } from "./address/address.module";
import { CarModule } from "./car/car.module";
import { BookingModule } from "./booking/booking.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // other modules...
    AuthModule,
    AddressModule,
    CarModule,
    BookingModule
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard
    }
  ]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(AppRequestLoggerMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL })
  }
}