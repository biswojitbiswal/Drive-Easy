import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from "class-validator";
import { CarType, FuelType, TransmissionType } from "@prisma/client";
import { Transform, Type } from "class-transformer";


export class AddCarDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    model: string

    @ApiProperty({ enum: CarType })
    @IsEnum(CarType)
    @IsNotEmpty()
    type: CarType

    @ApiProperty({ enum: FuelType })
    @IsEnum(FuelType)
    @IsNotEmpty()
    fuel: FuelType

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    pricePerDay: number;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    seats: number;

    @ApiProperty({ enum: TransmissionType })
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

    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0)
    @Max(100)
    gst: number;

    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    @Type(() => Number)
    logistic: number;
}


export class UpdateCarDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    model?: string

    @ApiProperty({ enum: CarType })
    @IsEnum(CarType)
    @IsOptional()
    type?: CarType

    @ApiProperty({ enum: FuelType })
    @IsEnum(FuelType)
    @IsOptional()
    fuel?: FuelType

    @ApiProperty()
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    pricePerDay?: number;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    seats?: number;

    @ApiProperty({ enum: TransmissionType })
    @IsEnum(TransmissionType)
    @IsOptional()
    transmission?: TransmissionType

    @ApiProperty()
    @IsString()
    @IsOptional()
    mileage?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    color?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    registrationNo?: string

    @ApiProperty()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    })
    @IsBoolean()
    @IsOptional()
    isAvailable?: boolean;

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => parseFloat(value))
    @IsNumber()
    @Min(0)
    @Max(100)
    gst?: number;

    @ApiProperty()
    @IsInt()
    @IsOptional()
    @Type(() => Number)
    logistic?: number;
}