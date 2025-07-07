// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseInterceptors, UploadedFile, HttpStatus, HttpCode, Param, Req, UseGuards, Patch, UploadedFiles } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client'
import { AnyFilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/claudinary/claudinary.config';
import { ChangePasswordDto, ResetForgotPasswordDto, SigninDto, SignupDto, UpdateProfileDto, VerifyOTPDto } from './dtos/auth.dto';
import { ApiBearerAuth, ApiConsumes, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Tokens } from './types';
import { Request } from 'express';
import { GetUserId } from 'src/common/decorators/get-user-id.decorator';
import { AtGuard } from 'src/common/guards/at.guard';



@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1'
})
export class AuthController {
  constructor(private readonly authService: AuthService) { }


  @UseGuards(AtGuard)
  @Patch()
  @UseInterceptors(AnyFilesInterceptor({ storage }))
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 200, description: 'Users Updated Successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async update(
    @GetUserId() id: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const profileImg = files.find(file => file.fieldname === 'profileImg');
    const identityProof = files.find(file => file.fieldname === 'identityProof');

    return this.authService.update(id, dto, profileImg, identityProof);
  }

  @Public()
  @Post('signup')
  @HttpCode(201)
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Public()
  @Post('verify-code/:token')
  @HttpCode(200)
  @ApiResponse({ status: 201, description: 'OTP Verification successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  verifyOtp(
    @Param('token') token: string,
    @Body() dto: VerifyOTPDto) {
    return this.authService.verifyOtp(token, dto.code);
  }


  @Public()
  @Post('resend-code/:token')
  @HttpCode(200)
  @ApiResponse({ status: 201, description: 'Resend OTP successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  resendOtp(
    @Param('token') token: string,) {
    return this.authService.resendOTP(token);
  }


  @Public()
  @Post('signin')
  @HttpCode(200)
  @ApiResponse({ status: 201, description: 'User Signin successfull' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto)
  }

  @Public()
  @Post('refresh-token')
  @HttpCode(200)
  @ApiResponse({ status: 200, description: 'Access Token Generated' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  refreshToken(@Req() req: Request) {
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


  @UseGuards(AtGuard)
  @Post("logout")
  @HttpCode(200)
  @ApiResponse({ status: 201, description: 'User Signout Successfull' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  logout(
    @GetUserId() userId: string,
  ) {
    return this.authService.logout(userId)
  }


  @UseGuards(AtGuard)
  @Patch("change-password")
  @HttpCode(200)
  @ApiResponse({ status: 201, description: 'Password Reset Successfull' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  changePassword(
    @GetUserId() userId: string,
    @Body() dto: ChangePasswordDto) {
    return this.authService.changePassword(userId, dto)
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(200)
  @ApiResponse({ status: 201, description: 'Reset Password Link Sent To Your Registered Email' })
  @ApiResponse({ status: 404, description: 'User Not Found' })
  forgotPassword(
    @Body('email') email: string
  ) {
    return this.authService.forgotPassword(email);
  }

  @Public()
  @Post('reset-password/:token')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Password Reset Successful' })
  @ApiResponse({ status: 500, description: 'Inavlid Token' })
  async resetForgotPassword(
    @Param('token') token: string,
    @Body() dto: ResetForgotPasswordDto) {
    return this.authService.resetPassword(dto, token);
  }

  @UseGuards(AtGuard)
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'User Retrived Successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async get(@Param('id') id: string) {
    return this.authService.get(id);
  }


  @UseGuards(AtGuard)
  @Get()
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({ status: 200, description: 'Users Retrived Successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getAll() {
    return this.authService.getAll();
  }

  

}
