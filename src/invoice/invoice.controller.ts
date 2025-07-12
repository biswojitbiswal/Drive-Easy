import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { InvoiceService } from "./invoice.service";
import { UserRole } from "@prisma/client";
import { InvoiceDto } from "./dtos/invoice.dto";
import { Public } from "src/common/decorators/public.decorator";

@ApiTags('Invoice')
@ApiBearerAuth()
@Controller({
    path: 'invoice',
    version: '1'
})
export class InvoiceController{
    constructor(private readonly invoiceService: InvoiceService){}

    @Public()
    @Post()
    @ApiOperation({ summary: 'Invoice Generate' })
    @ApiResponse({ status: 200, description: 'Invoice Generated' })
    @ApiResponse({ status: 404, description: 'Order Not Found' })
    create(@Body() dto: InvoiceDto){
        return this.invoiceService.createInvoiceForBooking(dto.bookingId)
    }
}