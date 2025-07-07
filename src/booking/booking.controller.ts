import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { BookingService } from "./booking.service";
import { AtGuard } from "src/common/guards/at.guard";
import { GetUserId } from "src/common/decorators/get-user-id.decorator";
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
}