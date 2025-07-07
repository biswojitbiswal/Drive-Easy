import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { CarController } from "./car.controller";
import { CarService } from "./car.service";

@Module({
    imports: [PrismaModule],
    controllers: [CarController],
    providers: [CarService]
})
export class CarModule{}