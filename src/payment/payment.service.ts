import { Injectable, InternalServerErrorException } from '@nestjs/common';
const Razorpay = require('razorpay');
import * as crypto from 'crypto';
import { InvoiceService } from 'src/invoice/invoice.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { assignAgent } from 'src/common/utils/assigned-agent.util';
import { generateOtp } from '../common/utils/generate-otp'
import { PaymentStatus } from '@prisma/client';


@Injectable()
export class PaymentService {
    private razorpay: any;

    constructor(
        private readonly invoiceService: InvoiceService,
        private readonly prisma: PrismaService,
    ) {
        this.razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }

    async createOrder(amount: number, currency = 'INR') {
        try {
            const options = {
                amount: Math.round(amount * 100),
                currency,
                receipt: `rcpt_${Date.now()}`,
            };

            const order = await this.razorpay.orders.create(options);

            return {
                message: "Order Created",
                data: order
            };
        } catch (error) {
            console.log(error)
            throw new InternalServerErrorException("Something Went Wrong")
        }
    }


    async verifyPaymentSignature(
        bookingId: string,
        orderId: string,
        paymentId: string,
        razorpaySignature: string
    ) {
        try {
            const secret = process.env.RAZORPAY_KEY_SECRET;
            if (!secret) throw new Error('Missing Razorpay secret');

            const generatedSignature = crypto
                .createHmac('sha256', secret)
                .update(`${orderId}|${paymentId}`)
                .digest('hex');

            const isValid = generatedSignature === razorpaySignature;
            if (!isValid) return false;

            const assignedAgentId = await assignAgent();

            const customerOTP = generateOtp();

            const booking = await this.prisma.booking.update({
                where: { id: bookingId },
                data: {
                    paymentId,
                    paymentSignature: razorpaySignature,
                    paymentStatus: 'SUCCESS',
                    status: 'CONFIRM',
                    deliveryStatus: 'PENDING',
                    customerOTP,
                    customerOtpVerified: false,
                    assignedAgentId,
                },
            });

            const invoice = await this.invoiceService.createInvoiceForBooking(booking.id);

            return {
                message: 'Payment Successful',
                data: { booking, invoice }
            }

        } catch (error) {
            console.error(error);
            throw new InternalServerErrorException('Payment verification failed');
        }
    }


    async refundPayment(bookingId: string) {
        try {
            const booking = await this.prisma.booking.findUnique({
                where: { id: bookingId },
            });

            if (!booking) throw new Error("Booking not found");
            if (!booking.paymentId) throw new Error("No payment ID found for this booking");
            if (booking.paymentStatus === 'REFUNDED') throw new Error("Already Refunded");

            const refund = await this.razorpay.payments.refund(booking.paymentId);

            const updatedBooking = await this.prisma.booking.update({
                where: { id: bookingId },
                data: {
                    paymentStatus: 'REFUNDED',
                    refundId: refund.id,
                    refundAmount: refund.amount / 100,
                    refundDate: new Date(refund.created_at * 1000),
                },
            });

            return refund;
        } catch (error) {
            console.error("Refund Error:", error);
            throw new InternalServerErrorException("Refund failed: " + error.message);
        }
    }


}
