import { Injectable, NotFoundException, ForbiddenException, HttpException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service'; // adjust path
import { CreateAddressDto, UpdateAddressDto } from './dtos/address.dto';

@Injectable()
export class AddressService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateAddressDto) {
        try {
            const address = await this.prisma.address.create({
                data: {
                    ...dto,
                    userId,
                },
            });

            return {
                message: 'Address created successfully',
                data: address,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new InternalServerErrorException("Something Went Wrong")
        }
    }

    async getByUser(userId: string) {
        try {
            const addresses = await this.prisma.address.findMany({
                where: { userId },
            });

            return {
                message: 'Addresses retrieved successfully',
                data: addresses,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new InternalServerErrorException("Something Went Wrong")
        }
    }

    async get(id: string) {
        try {
            const address = await this.prisma.address.findUnique({
                where: { id },
            });

            if (!address) {
                throw new NotFoundException("Address Not Found")
            }

            return {
                message: 'Address retrieved successfully',
                data: address,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new InternalServerErrorException("Something Went Wrong")
        }
    }

    async update(userId: string, addressId: string, dto: UpdateAddressDto) {
        try {
            const address = await this.prisma.address.findUnique({
                where: { id: addressId },
            });

            if (!address) {
                throw new NotFoundException('Address not found');
            }

            if (address.userId !== userId) {
                throw new ForbiddenException('You cannot update this address');
            }

            const updated = await this.prisma.address.update({
                where: { id: addressId },
                data: dto,
            });

            return {
                message: 'Address updated successfully',
                data: updated,
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new InternalServerErrorException("Something Went Wrong")

        }
    }

    async delete(userId: string, addressId: string) {
        try {
            const address = await this.prisma.address.findUnique({
                where: { id: addressId },
            });

            if (!address) {
                throw new NotFoundException('Address not found');
            }

            if (address.userId !== userId) {
                throw new ForbiddenException('You cannot delete this address');
            }

            await this.prisma.address.delete({
                where: { id: addressId },
            });

            return {
                message: 'Address deleted successfully',
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error
            }
            throw new InternalServerErrorException("Something Went Wrong")
        }
    }
}
