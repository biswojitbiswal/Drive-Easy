import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BookingService } from "./booking.service";
import { AtGuard } from "src/common/guards/at.guard";
import { GetUserId } from "src/common/decorators/get-user-id.decorator";
import { Roles } from "src/common/decorators/role.decorator";
import { UserRole } from "@prisma/client";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { BookingDto } from "./dtos/booking.dto";

@ApiTags('Booking')
@ApiBearerAuth()
@Controller({
    path: 'booking',
    version: '1'
})
export class BookingController{
    constructor(private readonly bookingService: BookingService){}

    @Post()
    @UseGuards(AtGuard)
    @ApiOperation({summary: "Create Booking"})
    @ApiResponse({status: 200, description: 'Booking Created Successfully'})
    @ApiResponse({status: 401, description: "Unautorized"})
    async create(
        @GetUserId() userId: string,
        @Body() dto: BookingDto
    ){
        return await this.bookingService.create(userId, dto)
    }

    @Get('user/:userId')
    @UseGuards(AtGuard)
    @ApiOperation({summary: "Get Booking By User ID"})
    @ApiResponse({status: 200, description: 'User Bookings Retrived Successfully'})
    @ApiResponse({status: 401, description: "Unautorized"})
    async getBookingByUserId(@Param('userId') userId: string){
        return await this.bookingService.getBookingByUserId(userId)
    }


    @Get(':id')
    @UseGuards(AtGuard)
    @ApiOperation({summary: "Get Booking By ID"})
    @ApiResponse({status: 200, description: 'Booking Retrived Successfully'})
    @ApiResponse({status: 401, description: "Unautorized"})
    async get(@Param('id') id: string){
        return await this.bookingService.get(id)
    }

    @Get()
    @Roles(UserRole.ADMIN)
    @ApiOperation({summary: "Get All Bookings"})
    @ApiResponse({status: 200, description: 'Bookings Retrived Successfully'})
    @ApiResponse({status: 401, description: "Unautorized"})
    async getAll(@Query() dto: PaginationDto){
        const bookings = await this.bookingService.getAll(dto, 'booking', {
            where: {}
        })

        return bookings;
    }

    @Patch(':id')
    @UseGuards(AtGuard)
    @Roles(UserRole.ADMIN, UserRole.USER)
    @ApiOperation({summary: "Booking Cancel"})
    @ApiResponse({status: 200, description: 'Booking Cancelled Successfully'})
    @ApiResponse({status: 401, description: "Unautorized"})
    async cancelBooking(@Param('id') id: string){
        return await this.bookingService.cancelBooking(id)
    }



}