import { Injectable, Param } from "@nestjs/common";
import { Request } from "express";
import { CreateUserDto } from "./dto/user-create.dto";
import { UpdateUserDto } from "./dto/user-update.dto";

@Injectable()
export class UserService{
    create(createUserDto: CreateUserDto){
        return createUserDto;
    }

    update(updateUserDto: UpdateUserDto, userId: string){
        return updateUserDto;
    }

    get(userId: string) {
        return { userID: `${userId}`, name: 'Biswojit Biswal', email: "biswojitb474@gmail.com" };
    }

    getWelcome(user: string) {
        return `Hii ${user}, Welcome Back`;
    }
}