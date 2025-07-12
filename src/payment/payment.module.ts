import { Module } from "@nestjs/common";
import { PaymentController } from "./payment.controller";
import { PaymentService } from "./payment.service";
import { InvoiceModule } from "src/invoice/invoice.module";
import { PrismaModule } from "src/prisma/prisma.module";

@Module({
    imports: [ InvoiceModule, PrismaModule],
    controllers: [PaymentController],
    providers: [PaymentService]
})
export class PaymentModule{}