import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { CarService } from "./car.service";
import { Roles } from "src/common/decorators/role.decorator";
import { UserRole } from "@prisma/client";
import { AddCarDto, UpdateCarDto } from "./dtos/car.dto";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { storage } from "src/claudinary/claudinary.config";
import { AtGuard } from "src/common/guards/at.guard";
import { RolesGuard } from "src/common/guards/roles.guard";
import { Public } from "src/common/decorators/public.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";


@ApiTags('Car')
@ApiBearerAuth()
@Controller({
    path: 'car',
    version: '1'
})
export class CarController {
    constructor(
        private readonly carService: CarService,
    ) { }

    @Post()
    @Roles(UserRole.ADMIN)
    @UseInterceptors(FilesInterceptor('images', 10, { storage }))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: "Add New Car" })
    @ApiResponse({ status: 200, description: 'New Car Added' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async add(
        @Body() dto: AddCarDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        return this.carService.add(dto, files ?? [])
    }

    @Public()
    @Get()
    @ApiOperation({ summary: "Get All Car" })
    @ApiResponse({ status: 200, description: 'Cars Retrived Successfully' })
    @ApiResponse({ status: 404, description: 'Car Not Found' })
    async getAll(@Query() dto: PaginationDto) {
        try {
            const cars = await this.carService.getAll(dto, 'car', {
                where: {}
            })

            return {
                error: 0,
                status: 'success',
                message: "Cars Retrieved Successfully",
                ...cars
            }
        } catch (error) {
            return {
                error: 1,
                status: 'failed',
                message: error.message || "Something Went Wrong"
            }
        }
    }


    @Roles(UserRole.ADMIN)
    @Get('stats')
    @ApiOperation({ summary: "Get Statistics Of Cars" })
    @ApiResponse({ status: 200, description: 'Car Statistics Retrived Successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    async carStats(){
        return await this.carService.carStats()
    }


    @Public()
    @Get(':id')
    @ApiOperation({ summary: "Get Car By ID" })
    @ApiResponse({ status: 200, description: 'Car Retrived Successfully' })
    @ApiResponse({ status: 404, description: 'Car Not Found' })
    async get(@Param('id') id: string){
        return this.carService.get(id)
    }


    @Roles(UserRole.ADMIN)
    @Delete(':id')
    @ApiOperation({ summary: "Delete Car By ID" })
    @ApiResponse({ status: 200, description: 'Car Deleted Successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Car Not Found' })
    async delete(@Param('id') id: string){
        return this.carService.delete(id)
    }

    @Roles(UserRole.ADMIN)
    @Patch(':id')
    @UseInterceptors(FilesInterceptor('images', 10, { storage }))
    @ApiConsumes('multipart/form-data')
    @ApiOperation({ summary: "Update Car By ID" })
    @ApiResponse({ status: 200, description: 'Car Updated Successfully' })
    @ApiResponse({ status: 403, description: 'Forbidden' })
    @ApiResponse({ status: 404, description: 'Car Not Found' })
    async update(
        @Param('id') id: string,
        @Body() dto: UpdateCarDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ){
        console.log(files)
        return this.carService.update(id, dto, files ?? [])
    }

    
}