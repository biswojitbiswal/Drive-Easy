import { ApiProperty } from "@nestjs/swagger";
import { IsDateString, IsNotEmpty, isNotEmpty, IsString } from "class-validator";

export class BookingDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    bookingName: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    bookedCarId: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    contact: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    dlNo: string

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    dob: string

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    pickupDt: string

    @ApiProperty()
    @IsDateString()
    @IsNotEmpty()
    dropupDt: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    pickupLocation: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    dropupLocation: string
}