import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { BookingDto } from "./dtos/booking.dto";
import { generateBookingId } from "src/common/utils/generate-booking-id.util";
import { calculateHourDifference } from "src/common/utils/calculate-hour";

@Injectable({})
export class BookingService{
    constructor(private readonly prisma: PrismaService){}

    async create(userId: string, dto: BookingDto) {
        const car = await this.prisma.car.findUnique({
            where: {id: dto.bookedCarId}
        })

        if(!car){
            throw new NotFoundException("Car Not Found")
        }

        const bookingId = await generateBookingId();

        const totalHours =  calculateHourDifference(dto.pickupDt, dto.dropupDt);
        
        const price = parseFloat((totalHours * car.pricePerDay).toFixed(2));

        const gstAmount = parseFloat((((car?.gst || 0) / 100) * price).toFixed(2));

        const totalAmount = parseFloat((price + gstAmount + (car?.logistic || 0)).toFixed(2));


    }
}