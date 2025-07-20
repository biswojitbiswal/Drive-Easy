import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsString } from "class-validator";

export class CarRatingDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    carId: string


    @ApiProperty()
    @IsInt()
    @IsNotEmpty()
    rating: number

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    comment: string
}