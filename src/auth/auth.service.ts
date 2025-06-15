// auth.service.ts
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SignupDto } from './dtos/auth.dto';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) { }

  async signup(dto: SignupDto){
    
  }
}
