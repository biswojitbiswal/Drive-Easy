// src/auth/auth.controller.ts
import { Controller, Post, Body, Get, UseInterceptors, UploadedFile } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/public.decorator';
import { Roles } from 'src/common/decorators/role.decorator';
import { UserRole } from '@prisma/client'
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/claudinary/claudinary.config';
import { SignupDto } from './dtos/auth.dto';
import { ApiBearerAuth, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Authentication')
@Controller({
  path: 'auth',
  version: '1'
})
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Post()
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  signup(
    @Body() dto: SignupDto
  ){
    return this.authService.signup(dto);
  }


}
