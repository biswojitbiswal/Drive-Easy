// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseInterceptors, UploadedFile, HttpStatus, HttpCode, Param, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client'
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/claudinary/claudinary.config';
import { ResetPasswordDto, SigninDto, SignupDto, VerifyOTPDto } from './dtos/auth.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Tokens } from './types';
import { Request } from 'express';



@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1'
})
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post('signup')
  @HttpCode(201)
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  signup(@Body() dto: SignupDto){
    return this.authService.signup(dto);
  }

  @Public()
  @Post('verify-code/:token')
  @HttpCode(200)
  @ApiResponse({ status: 201, description: 'OTP Verification successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  verifyOtp(
    @Param('token') token: string,
    @Body() dto: VerifyOTPDto){
    return this.authService.verifyOtp(token, dto.code);
  }


  @Public()
  @Post('resend-code/:token')
  @HttpCode(200)
  @ApiResponse({ status: 201, description: 'Resend OTP successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  resendOtp(
    @Param('token') token: string,){
    return this.authService.resendOTP(token);
  }


  @Public()
  @Post('signin')
  @HttpCode(200)
  @ApiResponse({ status: 201, description: 'User Signin successfull' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  signin(@Body() dto: SigninDto){
    return this.authService.signin(dto)
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Access Token Generated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  refreshToken(@Req() req: Request){
    const token = req.cookies.refreshToken;

    if (!token) {
      return {
        error: 1,
        status: 'failed',
        message: 'No Refresh Token Found in Cookie'
      }
    }

    return this.authService.refreshToken(token)
  }

  // @Public()
  // @Post(':id')
  // @HttpCode(200)
  // @ApiResponse({ status: 201, description: 'Password Reset Successfull' })
  // @ApiResponse({ status: 403, description: 'Forbidden' })
  // resetPassword(
  //   @Body() dto: ResetPasswordDto){
  //   return this.authService.resetPassword(dto)
  // }


}
