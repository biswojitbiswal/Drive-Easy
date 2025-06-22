// auth.service.ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordDto, SigninDto, SignupDto } from './dtos/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'
import { MailService } from 'src/mail/mail.service';
import { error } from 'console';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService
  ) { }

  async signup(dto: SignupDto) {
    try {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: dto.email }
      });

      const hashedPassword = await bcrypt.hash(dto.password, 10);
      const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      let user: any;
      if (existingUser) {
        if (existingUser.isVerify) {
          return {
            error: 1,
            status: 'failed',
            message: 'Email Already Exists'
          }
        }

        user = await this.prisma.user.update({
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
        user = await this.prisma.user.create({
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

      const payload = {
        sub: user.id,
        email: user.email,
      }

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      })

      return {
        error: 0,
        status: 'success',
        message: 'User Registered Successfully',
        data: { user, token }
      }
    } catch (error) {
      return {
        error: 0,
        status: 'failed',
        message: error.message || 'Error User Registration'
      }
    }
  }


  async verifyOtp(token: string, otp: string) {
    try {
      let payload: any;
      try {
        payload = await this.jwtService.verifyAsync(token);
      } catch (err) {
        return {
          error: 1,
          status: 'failed',
          message: err.message || 'Invalid or Expired Token'
        }
      }

      const email = payload.email;

      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        return {
          error: 1,
          status: 'failed',
          message: 'User Not Found'
        }
      }

      if (user.isVerify) {
        return {
          error: 1,
          status: 'failed',
          message: 'User Already Verified'
        }
      }

      if (user.otp !== otp) {
        return {
          error: 1,
          status: 'failed',
          message: 'Invalid OTP'
        }
      }

      if (!user.expiryTime || user.expiryTime < new Date()) {
        return {
          error: 1,
          status: 'failed',
          message: 'OTP Has Expired'
        }
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

      return {
        error: 0,
        status: 'success',
        message: 'Account verified successfully'
      };
    } catch (error) {
      return {
        error: 1,
        status: 'failed',
        message: error.message || 'Internal Server Error'
      }
    }
  }


  async resendOTP(token: string) {
    try {
      let payload: any;
      try {
        payload = await this.jwtService.verifyAsync(token);
      } catch (err) {
        return {
          error: 1,
          status: 'failed',
          message: 'Invalid or expired token'
        }
      }

      const email = payload.email;

      const user = await this.prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        return {
          error: 1,
          status: 'failed',
          message: 'If your email is registered, an OTP has been sent.'
        }
      }

      const code = crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
      const expiryTime = new Date(Date.now() + 10 * 60 * 1000);


      const updatedUser = await this.prisma.user.update({
        where: { id: user.id },
        data: {
          otp: code,
          expiryTime,
        },
      });

      await this.mailService.sendVerificationEmail(email, code, `${user.firstName} ${user.lastName}`);

      return {
        error: 0,
        status: 'success',
        message: 'OTP Resend Successful'
      }
    } catch (error) {
      return {
        error: 1,
        status: 'failed',
        message: error.message || 'Internal Server Error'
      }
    }
  }


  async signin(dto: SigninDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email }
      })

      if (!user) {
        return {
          error: 1,
          status: 'failed',
          message: "User Not Found"
        }
      }

      if (!user.isVerify) {
        return {
          error: 1,
          status: 'failed',
          message: "Not A Verify User, Please Verify Your Email First"
        }
      }

      const isPasswordMatch = await bcrypt.compare(dto.password, user.password)

      if (!isPasswordMatch) {
        return {
          error: 1,
          status: 'failed',
          message: "Inavlid Credentials"
        }
      }

      const payload = {
        id: user.id,
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

      const { id, firstName, lastName, email, role } = user

      return {
        error: 0,
        status: 'success',
        message: "Signin Successful",
        data: {
          user: { id, firstName, lastName, email, role },
          accessToken,
          refreshToken
        }
      }
    } catch (error) {
      return {
        error: 1,
        status: 'failed',
        message: error.message || "Internal Server Error"
      }
    }
  }


  async refreshToken(token: string) {
    try {
      if(!token){
        return {
          error: 1,
        status: 'failed',
        message: 'Refresh Token Required'
        }
      }

      const decode = await this.jwtService.decode(token)

      const user = await this.prisma.user.findUnique({
        where: {id: decode.id},
      })

      if(!user || !user.rtHash){
        return {
          error: 1,
          status: 'failed',
          message: 'User Not Found'
        }
      }

      const isMatch = await bcrypt.compare(token, user.rtHash)
      if(!isMatch){
        return {
          error: 1,
          status: 'failed',
          message: 'Invalid Refresh Token'
        }
      }

      const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
      }
      const newAccessToken = await this.jwtService.signAsync(payload, { expiresIn: '1d' })
      const newRefreshToken = await this.jwtService.signAsync(payload, { expiresIn: '7d' })

      const hashedToken = await bcrypt.hash(newRefreshToken, 10);

      await this.prisma.user.update({
        where: {id: user.id},
        data: {rtHash: hashedToken}
      })
      
      const { id, firstName, lastName, email, role } = user

      return {
        error: 0,
        status: 'success',
        message: "Access Token Generated",
        data: {
          user: { id, firstName, lastName, email, role },
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      }
    } catch (error) {
      console.log(error)
      return {
        error: 1,
        status: 'failed',
        message: error.message || 'Internal Server Error'
      }
    }
  }

}
