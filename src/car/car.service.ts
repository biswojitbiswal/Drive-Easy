import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { AddCarDto, UpdateCarDto } from "./dtos/car.dto";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { Pagination } from "src/common/decorators/pagination.decorator";

@Injectable({})
export class CarService {
    constructor(
        private readonly prisma: PrismaService
    ) { }

    async add(dto: AddCarDto, files: Express.Multer.File[]) {
        try {
            const imagePaths = files.map((file) => file.path)
            const car = await this.prisma.car.create({
                data: {
                    ...dto,
                    pricePerDay: Number(dto.pricePerDay),
                    seats: Number(dto.seats),
                    gst: Number(dto.gst),
                    logistic: Number(dto.logistic),
                    images: imagePaths
                }
            })

            return {
                message: "New Car Added",
                data: car
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new InternalServerErrorException("Something Went Wrong")
        }
    }


    @Pagination(['model', 'price', 'mileage', 'seats', 'color', 'registrationNo', 'pricePerDay'])
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

    async get(id: string) {
        try {
            const car = await this.prisma.car.findUnique({
                where: { id }
            })

            if (!car) {
                throw new NotFoundException("Car Not Found")
            }

            return {
                message: "Car Retrived Successfully",
                data: car
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new InternalServerErrorException("Something Went Wrong")
        }
    }

    async delete(id: string) {
        try {
            const car = await this.prisma.car.delete({
                where: { id }
            })

            if (!car) {
                throw new NotFoundException("Car Not Found")
            }

            return {
                message: "Car Deleted Successfully",
                data: car
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new InternalServerErrorException("Something Went Wrong")
        }
    }

    async update(id: string, dto: UpdateCarDto, files: Express.Multer.File[]) {
        try {
            const car = await this.prisma.car.findUnique({
                where: { id }
            });

            if (!car) {
                throw new NotFoundException("Car Not Found");
            }

            console.log(files);

            const imagePaths = files.map((file) => file?.path);

            const updatedData: any = {
                ...dto,
                images: imagePaths.length > 0 ? imagePaths : car.images,
            };

            if (dto.gst !== undefined) updatedData.gst = dto.gst;
            if (dto.logistic !== undefined) updatedData.logistic = dto.logistic;

            const updatedCar = await this.prisma.car.update({
                where: { id },
                data: updatedData,
            });

            return {
                message: "Car Updated Successfully",
                data: updatedCar,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            console.log(error);
            throw new InternalServerErrorException("Something Went Wrong");
        }
    }


    async carStats() {
        try {
            const activeCars = await this.prisma.car.count({
                where: { isAvailable: true }
            });

            const inactiveCars = await this.prisma.car.count({
                where: { isAvailable: false },
            })

            const avgPrice = await this.prisma.car.aggregate({
                _avg: {
                    pricePerDay: true,
                }
            })

            return {
                message: 'Car Statistics Retrives Successfully',
                data: {
                    activeCars,
                    inactiveCars,
                    avgPrice
                }
            }
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new InternalServerErrorException("Something Went Wrong")
        }
    }
}