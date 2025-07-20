import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from "@nestjs/common";
import { CarRatingService } from "./car-rating.service";
import { AtGuard } from "src/common/guards/at.guard";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CarRatingDto } from "./dtos/car-rating.dto";
import { GetUserId } from "src/common/decorators/get-user-id.decorator";
import { Roles } from "src/common/decorators/role.decorator";
import { UserRole } from "@prisma/client";
import { PaginationDto } from "src/common/dto/pagination.dto";

@ApiTags("Car Rating")
@Controller({
    path: "car-rating",
    version: "1"
})
export class CarRatingController{
    constructor(private readonly carRatingService: CarRatingService){}

    @UseGuards(AtGuard)
    @Post()
    @ApiOperation({summary: "Car Rating by Validate Customer"})
    @ApiResponse({status: 200, description: "Review Added Successfully"})
    @ApiResponse({status: 401, description: "Unauthorized"})
    async create(@Body() dto: CarRatingDto, @GetUserId() userId: string){
        return await this.carRatingService.create(dto, userId)
    }


    @Get(":carId")
    @ApiOperation({summary: "Car Rating by Car ID"})
    @ApiResponse({status: 200, description: "All Review Retrived Successfully"})
    @ApiResponse({status: 500, description: "Something Went Wrong"})
    async get(@Param('carId') carId: string){
        return await this.carRatingService.get(carId)
    }

    @UseGuards(AtGuard)
    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({summary: "Get All Ratings"})
    @ApiResponse({status: 200, description: "All Review Retrived Successfully"})
    @ApiResponse({status: 500, description: "Something Went Wrong"})
    async getAll(@Query() dto: PaginationDto){
        const ratings =  await this.carRatingService.getAll(dto, 'carRating', {
            where: {},
            include: {
                car: true,
                user: true,
            }
        })

        return {
            message: "Get All Reviews",
            data: ratings
        }
    }

    @UseGuards(AtGuard)
    @Delete(":ratingId")
    @Roles(UserRole.ADMIN)
    @ApiOperation({summary: "Car Rating by Car ID"})
    @ApiResponse({status: 200, description: "All Review Retrived Successfully"})
    @ApiResponse({status: 500, description: "Something Went Wrong"})
    async delete(@Param('ratingId') ratingId: string){
        return await this.carRatingService.delete(ratingId)
    }
}