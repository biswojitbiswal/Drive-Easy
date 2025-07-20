import { Module } from "@nestjs/common";
import { PrismaModule } from "src/prisma/prisma.module";
import { CarRatingController } from "./car-rating.controller";
import { CarRatingService } from "./car-rating.service";

@Module({
    imports: [PrismaModule],
    controllers: [CarRatingController],
    providers: [CarRatingService]
})
export class CarRatingModule{}