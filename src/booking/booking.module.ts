import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { BookingController } from "./booking.controller";
import { BookingService } from "./booking.service";
import { PaymentModule } from "src/payment/payment.module";

@Module({
    imports: [PaymentModule, PrismaModule],
    controllers: [BookingController],
    providers: [BookingService]
})
export class BookingModule{}