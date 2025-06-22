import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SignupDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    firstName: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    lastName: string

    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string
}

export class VerifyOTPDto{
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    code: string
}



export class SigninDto{
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string
}


export class ResetPasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string
}
