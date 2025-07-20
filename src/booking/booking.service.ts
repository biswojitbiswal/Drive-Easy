import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { BookingDto } from "./dtos/booking.dto";
import { generateBookingId } from "src/common/utils/generate-booking-id.util";
import { calculateHourDifference } from "src/common/utils/calculate-hour";
import { DeliveryStatus, Status } from "@prisma/client";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { PaymentService } from "src/payment/payment.service";

@Injectable({})
export class BookingService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly payment: PaymentService
    ) { }

    async create(userId: string, dto: BookingDto) {
        try {
            const car = await this.prisma.car.findUnique({
                where: { id: dto.bookedCarId }
            })

            if (!car) {
                throw new NotFoundException("Car Not Found")
            }

            const bookingId = await generateBookingId();

            const totalHours = calculateHourDifference(dto.pickupDt, dto.dropupDt);

            const price = parseFloat((totalHours * car.pricePerDay).toFixed(2));

            const gstAmount = parseFloat((((car.gst || 0) / 100) * price).toFixed(2));

            const totalAmount = parseFloat((price + gstAmount + (car.logistic || 0)).toFixed(2));




            const booking = await this.prisma.booking.create({
                data: {
                    bookingId,
                    bookedById: userId,
                    bookedCarId: dto.bookedCarId,
                    bookingName: dto.bookingName,
                    contact: dto.contact,
                    dlNo: dto.dlNo,
                    dob: dto.dob,
                    pickupDt: dto.pickupDt,
                    dropupDt: dto.dropupDt,
                    pickupLocation: dto.pickupLocation,
                    dropupLocation: dto.dropupLocation,
                    price,
                    gst: car.gst ?? 0,
                    logisticCharge: car.logistic ?? 0,
                    gstAmount,
                    totalAmount,
                    deliveryStatus: DeliveryStatus.PENDING,
                    status: Status.PENDING,
                }
            })

            return {
                message: 'Booking Created Successfully',
                data: booking
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.log(error)
            throw new InternalServerErrorException("Something Went Wrong")
        }
    }

    async get(id: string) {
        try {
            const booking = await this.prisma.booking.findUnique({
                where: { id },
                include: {
                    bookedCar: true,
                    bookedBy: true,
                    assignedAgent: true
                }
            })

            if (!booking) {
                throw new NotFoundException("Booking Not Found");
            }

            return {
                message: "Booking Retrived Successfully",
                data: booking
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new InternalServerErrorException("Something Went Wrong")
        }
    }


    @Pagination([])
    async getAll(
        dto: PaginationDto,
        modelName: string,
        queryOptions: any,
    ): Promise<{
        total: number;
        page: number;
        limit: number;
        data: any[];
    }> {
        return {
            total: 0,
            page: 0,
            limit: 0,
            data: [],
        };
    }


    async cancelBooking(id: string, {reason}: { reason: string }) {
        try {
            const booking = await this.prisma.booking.findUnique({
                where: { id }
            });

            if (!booking) {
                throw new NotFoundException("Booking Not Found!");
            }

            if (booking.status === 'IN_PROGRESS' || booking.status === 'COMPLETED') {
                throw new BadRequestException("Booking Can't Be Cancelled");
            }

            const refund = await this.payment.refundPayment(booking.id)

            const updatedBooking = await this.prisma.booking.update({
                where: { id },
                data: {
                    status: 'CANCELLED',
                    customerOTP: '',
                    deliveryStatus: 'CANCELLED',
                    cancellationReason: reason || 'Cancelled By DriveEasy'
                }
            });

            await this.prisma.invoice.updateMany({
                where: { bookingId: booking.id },
                data: { status: 'REFUNDED' }
            });

            return {
                message: "Booking cancelled and refunded successfully",
                data: {updatedBooking, refund}
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.log(error)
            throw new InternalServerErrorException("Something Went Wrong");
        }
    }



    async getBookingByUserId(userId: string) {
        try {
            const bookings = await this.prisma.booking.findMany({
                where: { 
                    bookedById: userId,
                    NOT: {
                        status: 'PENDING'
                    }
                },
                include: {
                    assignedAgent: {
                        select: {
                            id: true,
                            email: true,
                            firstName: true,
                            lastName: true,
                            phone: true,
                            profileImg: true,
                            isVerify: true,
                            role: true,
                            licenseNo: true,
                            experience: true,
                            identityProof: true,
                            rating: true,
                            ratingsCount: true,
                        }
                    },
                    bookedCar: {
                        select: {
                            id: true,
                            model: true,
                            type: true,
                            fuel: true,
                            seats: true,
                            pricePerDay: true,
                            images: true,
                            transmission: true,
                            mileage: true,
                            color: true,
                            registrationNo: true,
                        }
                    },
                    invoice: true
                }
            })

            if (!bookings || bookings.length === 0) {
                throw new NotFoundException("Bookings Not Found")
            }

            return {
                meesage: "Bookings Retrived Succesfully",
                data: bookings
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("Something Went Wrong")
        }
    }


    // for Delivery car
    //for return car
}