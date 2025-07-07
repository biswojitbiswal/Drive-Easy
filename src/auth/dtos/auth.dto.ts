import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import { IsArray, IsBoolean, IsDateString, IsEmail, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, ValidateNested } from "class-validator";
import { UserRole } from "src/common/enums";

export class SignupDto {
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

    @ApiProperty({ enum: UserRole })
    @IsEnum(UserRole)
    @IsNotEmpty()
    role: UserRole;
}

export class VerifyOTPDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    code: string
}

export class SigninDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    password: string
}


export class ChangePasswordDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    oldPassword: string

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    newPassword: string
}

export class ForgotDto {
    @ApiProperty()
    @IsEmail()
    @IsNotEmpty()
    email: string
}

export class ResetForgotPasswordDto {
    @ApiProperty()
    @IsString()
    newPassword: string;
}



export class UpdateProfileDto {
    @ApiProperty()
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty()
    @IsEmail()
    @IsOptional()
    email?: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    phone?: string;


    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    licenseNo?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    experience?: string;

    @ApiProperty()
    @Transform(({ value }) => {
        if (typeof value === 'string') {
            return value.toLowerCase() === 'true';
        }
        return Boolean(value);
    })
    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
