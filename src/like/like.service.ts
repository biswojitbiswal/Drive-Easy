import { HttpException, Injectable, InternalServerErrorException, NotFoundException } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { LikeDto } from "./dtos/like.dto";

@Injectable({})
export class LikeService {
    constructor(private readonly prisma: PrismaService) { }

    async toggleLike(userId: string, dto: LikeDto) {
        try {
            const { carId } = dto;

            const car = await this.prisma.car.findUnique({ where: { id: carId } });
            if (!car) throw new NotFoundException("Car Not Found");

            const existing = await this.prisma.like.findFirst({
                where: { userId, carId }
            });

            if (existing) {
                await this.prisma.like.deleteMany({ where: { userId, carId } });

                return {
                    message: "Car removed from your wishlist",
                    liked: false
                };
            } else {
                const like = await this.prisma.like.create({
                    data: { userId, carId }
                });

                return {
                    message: "Car added to your wishlist",
                    liked: true,
                    data: like
                };
            }
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException("Internal Server Error");
        }
    }



    async removeLike(id: string) {
        try {
            const like = await this.prisma.like.findUnique({ where: { id } });
            if (!like) throw new NotFoundException("Like Not Found");

            await this.prisma.like.delete({
                where: { id }
            });

            return {
                message: "Car removed from your wishlist",

            };
        } catch (error) {
            if (error instanceof HttpException) throw error;
            throw new InternalServerErrorException("Internal Server Error");
        }
    }

}