import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { UserModule } from "./user/user.module";
import { PrismaService } from './prisma/prisma.service';

@Module({
    imports: [UserModule],
    controllers: [AppController],
    providers: [PrismaService],
})
export class AppModule {}