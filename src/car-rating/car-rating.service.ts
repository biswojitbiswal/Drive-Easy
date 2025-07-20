import { BadRequestException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CarRatingDto } from "./dtos/car-rating.dto";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";

@Injectable({})
export class CarRatingService {
    constructor(private readonly prisma: PrismaService) { }

    async create(dto: CarRatingDto, userId: string) {
        try {
            const car = await this.prisma.car.findUnique({
                where: { id: dto.carId }
            })

            if (!car) {
                throw new NotFoundException("Car Not Found");
            }


            const BookedByUser = await this.prisma.booking.findMany({
                where: {
                    bookedById: userId,
                    bookedCarId: dto.carId,
                    status: "COMPLETED"
                }
            })

            if (BookedByUser.length === 0) {
                throw new BadRequestException("You have not booked this car yet!");
            }

            const existingReview = await this.prisma.carRating.findFirst({
                where: {
                    userId,
                    carId: dto.carId
                }
            });

            if (existingReview) {
                throw new BadRequestException("You have already reviewed this car");
            }

            const carRating = await this.prisma.carRating.create({
                data: {
                    userId,
                    carId: dto.carId,
                    rating: dto.rating,
                    comment: dto.comment
                }
            })

            return {
                message: "Review Added Successfully",
                data: carRating
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("Internal Server Error")
        }
    }


    async get(carId: string) {
        try {
            const ratings = await this.prisma.carRating.findMany({
                where: {carId}
            })

            if(ratings.length === 0){
                throw new NotFoundException("No Review Found")
            }

            return {
                message: "Get Review Successfully",
                data: ratings
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("Internal Server Error")
        }
    }


    @Pagination(['rating', 'comment', 'userId', 'carId'])
    async getAll(
        dto: PaginationDto,
        modelName: string,
        queryOptions: any
    ): Promise<{
        total: number;
        page?: number;
        limit?: number;
        data: any[];
    }> {
        return {
            total: 0,
            page: 0,
            limit: 0,
            data: [],
        };
    }


    async delete(ratingId: string){
        try {
            const rating = await this.prisma.carRating.findUnique({
                where: {id: ratingId}
            })

            if(!rating){
                throw new NotFoundException("Rating Not Found")
            }

            await this.prisma.carRating.delete({
                where: {id: ratingId}
            })

            return {
                message: "Review Deleted Successfully",
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new InternalServerErrorException("Internal Server Error")
        }
    }
}