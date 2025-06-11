import { Controller, Get, Param, Patch, Post, Req, Body} from "@nestjs/common";
import { UserService } from "./user.service";
import { Request } from "express";
import { CreateUserDto } from "./dto/user-create.dto";
import { UpdateUserDto } from "./dto/user-update.dto";

@Controller('/user')
export class UserController {
    constructor(private userService: UserService){}

    @Get('/:userId')
    getUserByID(@Param('userId') userId: string) {
        return this.userService.get(userId);
    }


    @Get('/welcome/:user')
    getWelcome(@Param('user') user: string) {
        return this.userService.getWelcome(user);
    }

    @Post()
    create(@Body() createUserDto: CreateUserDto){
        return this.userService.create(createUserDto)
    }

    @Patch()
    update(@Body() updateUserDto: UpdateUserDto, @Param('userId') userId: string){
        return this.userService.update(updateUserDto, userId)
    }
}