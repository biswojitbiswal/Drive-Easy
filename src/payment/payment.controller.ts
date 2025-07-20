import { Controller, Post, Body, UseGuards, BadRequestException } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AtGuard } from 'src/common/guards/at.guard';

@ApiTags('Payment')
@Controller({
    path: 'payment',
    version: "1"
})
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) { }

    @UseGuards(AtGuard)
    @ApiOperation({ summary: "Create Order For Payment" })
    @ApiResponse({ status: 200, description: "Payment Successfull" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    @Post('create-order')
    async createOrder(@Body() body: { amount: number }) {
        return await this.paymentService.createOrder(body.amount);

    }

    @Post('verify')
    @UseGuards(AtGuard)
    @ApiOperation({ summary: "Verify Payment" })
    @ApiResponse({ status: 200, description: "Payment Verified Successfull" })
    @ApiResponse({ status: 401, description: "Unauthorized" })
    async verifyPayment(@Body() body: any) {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = body;

        return await this.paymentService.verifyPaymentSignature(
            bookingId,
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        );
    }

    @Post('refund')
    @UseGuards(AtGuard)
    @ApiOperation({ summary: "Refund Payment" })
    @ApiResponse({ status: 200, description: "Refund Successful" })
    @ApiResponse({ status: 400, description: "Invalid Request" })
    async refundPayment(@Body() body: { bookingId: string }) {
        const { bookingId } = body;
        return await this.paymentService.refundPayment(bookingId);
    }

}
