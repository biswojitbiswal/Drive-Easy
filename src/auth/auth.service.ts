// auth.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto, SigninDto, SignupDto } from './dtos/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'
import { MailService } from 'src/mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) { }

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email }
    });

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
    const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    if (existingUser) {
      if (existingUser.isVerify) {
        throw new ConflictException('Email Already Exists');
      }

      await this.prisma.user.update({
        where: { email: dto.email },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          password: hashedPassword,
          otp: code,
          expiryTime,
        }
      });

    } else {
      await this.prisma.user.create({
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          email: dto.email,
          password: hashedPassword,
          otp: code,
          expiryTime,
          tcAgree: true,
          isVerify: false,
          rtHash: '',
          role: 'USER',
        }
      });
    }

    await this.mailService.sendVerificationEmail(dto.email, code, `${dto.firstName} ${dto.lastName}`);

    return { message: 'OTP Sent To Registered Email.' };
  }


  async verifyOtp(email: string, otp: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.isVerify) {
      throw new BadRequestException('User is already verified');
    }

    if (user.otp !== otp) {
      throw new BadRequestException('Invalid OTP');
    }

    if (!user.expiryTime || user.expiryTime < new Date()) {
      throw new BadRequestException('OTP has expired');
    }

    await this.prisma.user.update({
      where: { email },
      data: {
        isVerify: true,
        otp: '',
        expiryTime: new Date(0),
      }
    });

    const fullname = `${user.firstName} ${user.lastName}`

    await this.mailService.sendWelcomeEmail(email, fullname)

    return { message: 'Account verified successfully' };
  }


  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email }
    })

    if (!user) {
      throw new NotFoundException('User Not Found');
    }

    if (!user.isVerify) {
      throw new BadRequestException('Not A Verify User, Please Verify Yor Email First');
    }

    const isPasswordMatch = await bcrypt.compare(dto.password, user.password)

    if (!isPasswordMatch) {
      throw new BadRequestException("Invalid Credentials");
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    }

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '1d',
    })

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    })

    const hashedRt = await bcrypt.hash(refreshToken, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { rtHash: hashedRt }
    })

    return {
      message: 'Signin Successful',
      accessToken,
      refreshToken,
    };
  }

}
