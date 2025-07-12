import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { generateInvoiceId } from '../common/utils/generate-invoice-id.util';
import { generateCarRentalInvoiceTemplate } from './invoice-template/customer-in-template';
import { generatePDF } from '../common/utils/generatePDF';
import { uploadBuffer } from 'src/claudinary/claudinary.config';

@Injectable()
export class InvoiceService {
    constructor(
        private readonly prisma: PrismaService,
    ) { }

    async createInvoiceForBooking(bookingId: string) {
        const booking = await this.prisma.booking.findUnique({
            where: { id: bookingId },
            include: {
                bookedBy: true,
                bookedCar: true,
            },
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        const existingInvoice = await this.prisma.invoice.findUnique({
            where: { bookingId: booking.id },
        });

        if (existingInvoice) {
            return { message: 'Invoice already exists', invoiceId: existingInvoice.invoiceId };
        }

        const invoiceId = generateInvoiceId();

        const invoiceData = {
            invoiceNumber: invoiceId,
            issueDate: new Date().toLocaleDateString('en-IN'),
            customer: {
                name: booking.bookedBy.firstName,
                phone: booking.contact,
            },
            car: {
                model: booking.bookedCar.model,
                pickup: booking.pickupLocation,
                drop: booking.dropupLocation,
                pickupDate: booking.pickupDt,
                dropDate: booking.dropupDt,
            },
            price: booking.price,
            gst: booking.gst,
            gstAmount: booking.gstAmount,
            logistic: booking.logisticCharge,
            totalAmount: booking.totalAmount,
        };

        const htmlTemplate = generateCarRentalInvoiceTemplate(invoiceData);
        const pdfBuffer = await generatePDF(htmlTemplate);



        const uploadResult = await uploadBuffer(pdfBuffer, {
            folder: 'driveeasy/invoices',
            public_id: `invoice-${invoiceId}.pdf`, // ✅ Add `.pdf` here
            resource_type: 'raw',
            type: 'upload',               // ✅ Ensure it's of type "upload"
            access_mode: 'public',        // ✅ Make the file publicly accessible
        });

        const newInvoice = await this.prisma.invoice.create({
            data: {
                invoiceId,
                bookingId: booking.id,
                invoiceDate: new Date(),
                invoiceUrl: uploadResult.secure_url,
                status: 'PAID',
            },
        });

        return newInvoice;
    }
}
