import {
    Controller,
    Post,
    Body,
    Get,
    Param,
    Patch,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { AddressService } from './address.service';
import { CreateAddressDto, UpdateAddressDto } from './dtos/address.dto';
import { ApiTags, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { AtGuard } from 'src/common/guards/at.guard';
import { GetUserId } from 'src/common/decorators/get-user-id.decorator';

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller({
    path: 'address',
    version: '1',
})
export class AddressController {
    constructor(private readonly addressService: AddressService) { }

    @Post()
    @UseGuards(AtGuard)
    @ApiResponse({ status: 200, description: 'Address Created Successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async createAddress(
        @GetUserId() userId: string,
        @Body() dto: CreateAddressDto,
    ) {
        return this.addressService.create(userId, dto);
    }

    @Get()
    @UseGuards(AtGuard)
    @ApiResponse({ status: 200, description: 'Address Retrived Successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async getUserAddresses(@GetUserId() userId: string) {
        return this.addressService.getByUser(userId);
    }

    @Get(':id')
    @UseGuards(AtGuard)
    @ApiResponse({ status: 200, description: 'Address Retrived Successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async get(
        @Param('id') id: string
    ) {
        return this.addressService.get(id);
    }

    @Patch(':id')
    @UseGuards(AtGuard)
    @ApiResponse({ status: 200, description: 'Address Updated Successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async updateAddress(
        @Param('id') addressId: string,
        @GetUserId() userId: string,
        @Body() dto: UpdateAddressDto,
    ) {
        return this.addressService.update(userId, addressId, dto);
    }

    @Delete(':id')
    @UseGuards(AtGuard)
    @ApiResponse({ status: 200, description: 'Address Deleted Successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async deleteAddress(
        @Param('id') addressId: string,
        @GetUserId() userId: string,
    ) {
        return this.addressService.delete(userId, addressId);
    }
}
