import { Controller, Get, Param, Patch, Post, Body, UseInterceptors, UploadedFile } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUserDto } from "./dto/user-create.dto";
import { UpdateUserDto } from "./dto/user-update.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { storage } from '../claudinary/claudinary.config';
import { Express } from "express";

@Controller('user') // ✅ No leading slash
export class UserController {
  constructor(private userService: UserService) {}


  @Get()
  get(@Param('userId') userId: string) {
    return this.userService.test();
  }

  @Get(':userId') // ✅ Correct route
  getUserByID(@Param('userId') userId: string) {
    return this.userService.get(userId);
  }

  @Get('welcome/:user')
  getWelcome(@Param('user') user: string) {
    return this.userService.getWelcome(user);
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.userService.create(createUserDto);
  }

  @Patch(':userId') // ✅ Include param
  update(@Body() updateUserDto: UpdateUserDto, @Param('userId') userId: string) {
    return this.userService.update(updateUserDto, userId);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    return {
      message: 'Upload successful',
      url: file?.path,
    };
  }
}
