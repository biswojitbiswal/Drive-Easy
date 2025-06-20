import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNotEmpty, IsString } from "class-validator";
import { CarType, FuelType, TransmissionType } from "src/common/enums";


export class AddCarDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    model: string
    
    @ApiProperty({enum: CarType})
    @IsEnum(CarType)
    @IsNotEmpty()
    type: CarType

    @ApiProperty({enum: FuelType})
    @IsEnum(FuelType)
    @IsNotEmpty()
    fuel: FuelType

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    pricePerDay: Number

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    seats: string

    @ApiProperty({enum: TransmissionType})
    @IsEnum(TransmissionType)
    @IsNotEmpty()
    transmission: TransmissionType

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    mileage: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    color: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    registrationNo: string
}