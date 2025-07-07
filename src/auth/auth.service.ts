// auth.service.ts
import { BadRequestException, ConflictException, HttpException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChangePasswordDto, ResetForgotPasswordDto, SigninDto, SignupDto, UpdateProfileDto } from './dtos/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto'
import { MailService } from 'src/mail/mail.service';
import { error } from 'console';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
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
          throw new BadRequestException("Email Already Exists")
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
            role: dto.role || UserRole.USER,
          }
        });
      }

      await this.mailService.sendVerificationEmail(dto.email, code, `${dto.firstName} ${dto.lastName}`);

      const payload = {
        id: user.id,
        email: user.email,
      }

      const token = await this.jwtService.signAsync(payload, {
        expiresIn: '15m',
      })

      return {
        message: 'User Registered Successfully',
        data: { user, token }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException("Something Went Wrong")
    }
  }


  async verifyOtp(token: string, otp: string) {
    try {
      let payload: any;
      try {
        payload = await this.jwtService.verifyAsync(token);
      } catch (err) {
        throw new err;
      }

      const email = payload.email;

      const user = await this.prisma.user.findUnique({ where: { email } });

      if (!user) {
        throw new NotFoundException("User Not Found")
      }

      if (user.isVerify) {
        throw new BadRequestException("User Already Verified")
      }

      if (user.otp !== otp) {
        throw new BadRequestException("Invalid OTP")
      }

      if (!user.expiryTime || user.expiryTime < new Date()) {
        throw new BadRequestException("OTP Has Expired")
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
        message: 'Account verified successfully'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new InternalServerErrorException("Something Went Wrong")
    }
  }


  async resendOTP(token: string) {
    try {
      let payload: any;
      try {
        payload = await this.jwtService.verifyAsync(token);
      } catch (err) {
        throw new err;
      }

      const email = payload.email;

      const user = await this.prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        throw new NotFoundException("If your email is registered, an OTP has been sent.")
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
        message: 'OTP Resend Successful'
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException("Something Went Wrong")
    }
  }


  async signin(dto: SigninDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email }
      })

      if (!user) {
        throw new NotFoundException("User Not Found")
      }

      if (!user.isVerify) {
        throw new BadRequestException("Not A Verify User, Please Verify Your Email First")
      }

      const isPasswordMatch = await bcrypt.compare(dto.password, user.password)

      if (!isPasswordMatch) {
        throw new BadRequestException("Invalid Credentials")
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

      const { id, firstName, lastName, email, role, agentProfileComplete } = user

      return {
        message: "Signin Successful",
        data: {
          user: { id, firstName, lastName, email, role, agentProfileComplete },
          accessToken,
          refreshToken
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException("Something Went Wrong")
    }
  }


  async refreshToken(token: string) {
    try {
      if (!token) {
        throw new BadRequestException("Refresh Toke Required")
      }

      const decode = await this.jwtService.decode(token)

      const user = await this.prisma.user.findUnique({
        where: { id: decode.id },
      })

      if (!user || !user.rtHash) {
        throw new NotFoundException("User Not Found")
      }

      const isMatch = await bcrypt.compare(token, user.rtHash)
      if (!isMatch) {
        throw new BadRequestException("Invalid Refresh Token")
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
        where: { id: user.id },
        data: { rtHash: hashedToken }
      })

      const { id, firstName, lastName, email, role } = user

      return {
        message: "Access Token Generated",
        data: {
          user: { id, firstName, lastName, email, role },
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException("Something Went Wrong")
    }
  }


  async logout(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw new NotFoundException("User Not Found")
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: {
          rtHash: ""
        }
      })

      return {
        message: "Signout Successful"
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException("Something Went Wrong")
    }
  }


  async changePassword(userId: string, dto: ChangePasswordDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        return {
          error: 1,
          status: 'failed',
          message: 'User Not Found'
        }
      }

      const passwordMatch = await bcrypt.compare(dto.oldPassword, user.password)

      if (!passwordMatch) {
        return {
          error: 1,
          status: 'failed',
          message: 'Inavlid Credential'
        }
      }

      const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

      await this.prisma.user.update({
        where: { id: userId },
        data: {
          password: hashedPassword
        }
      })

      return {
        error: 0,
        status: 'success',
        message: "Reset Password Successful",
      }
    } catch (error) {
      console.log(error)
      return {
        error: 1,
        status: 'failed',
        message: 'Intetnal Server Error',
        data: error
      }
    }
  }


  // forgot password
  async forgotPassword(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email }
      })

      if (!user) {
        throw new NotFoundException("User Not Found")
      }

      if (!user.isVerify) {
        throw new BadRequestException("Please Verify Your Email First")
      }

      const payload = {
        id: user.id,
        email: user.email,
      }

      const token = await this.jwtService.signAsync(payload, {
        secret: process.env.FORGOT_SECRET,
        expiresIn: '15m',
      })

      const resetLink = `${process.env.FRONT_END_URL}/reset-password/${token}`;

      await this.mailService.sendResetPasswordEmail(email, `${user.firstName} ${user.lastName}`, resetLink);

      return {
        message: 'Reset Password Link Sent To Your Registered Email'
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException("Something Went Wrong")
    }
  }


  // reset password
  async resetPassword(dto: ResetForgotPasswordDto, token: string) {
    try {
      const { newPassword } = dto;

      let payload: any;

      try {
        payload = this.jwtService.verify(token, {
          secret: process.env.FORGOT_SECRET,
        });

      } catch (err) {
        throw new BadRequestException("Invalid or Expired Token");
      }

      const hashed = await bcrypt.hash(newPassword, 10);

      await this.prisma.user.update({
        where: { email: payload.email },
        data: { password: hashed },
      });

      return { message: 'Password reset successful' };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException("Something Went Wrong")
    }
  }


  // update user data
  async update(id: string, dto: UpdateProfileDto, profileImg, identityProof) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });

      if (!user) {
        throw new NotFoundException("User Not Found")
      }

      const updatedData: any = {};

      if (dto.email) updatedData.email = dto.email;
      if (dto.firstName) updatedData.firstName = dto.firstName;
      if (dto.lastName) updatedData.lastName = dto.lastName;
      if (dto.phone) updatedData.phone = dto.phone;
      if (dto.licenseNo) updatedData.licenseNo = dto.licenseNo;
      if (dto.experience) updatedData.experience = dto.experience;
      if (dto.isActive !== undefined) updatedData.isActive = dto.isActive;


      if (profileImg) updatedData.profileImg = profileImg.path || profileImg.url;

      if (identityProof) updatedData.identityProof = identityProof.path || identityProof.url;

      if (
        updatedData.licenseNo || user.licenseNo &&
        updatedData.experience || user.experience &&
        (identityProof || user.identityProof) &&
        (profileImg || user.profileImg)
      ) {
        updatedData.agentProfileComplete = true;
      }
      const updatedUser = await this.prisma.user.update({
        where: { id },
        data: updatedData,
      });

      return {
        message: 'Profile Updated Successfully',
        data: updatedUser,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException("Something Went Wrong");
    }
  }

  // get all user
  async getAll() {
    try {
      const users = await this.prisma.user.findMany({
        select: {
          password: false,
          otp: false,
          expiryTime: false,
          rtHash: false,
          tcAgree: false,
        }
      });

      return {
        message: 'Users Retrived Successfully',
        data: users
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException("Something Went Wrong")
    }
  }

  // get user by id
  async get(id: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id },
        select: {
          password: false,
          otp: false,
          expiryTime: false,
          rtHash: false,
          tcAgree: false,
        }
      });

      if (!user) {
        throw new NotFoundException("User Not Found")
      }

      return {
        message: 'User Found',
        data: user
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new InternalServerErrorException("Something Went Wrong")

    }
  }

}
