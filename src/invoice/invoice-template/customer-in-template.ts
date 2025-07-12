export function generateCarRentalInvoiceTemplate(invoiceData: any): string {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>Car Rental Invoice</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
      body {
        font-family: 'Inter', sans-serif;
      }
    </style>
  </head>
  <body class="bg-white text-gray-800 text-sm p-8">
    <div class="max-w-3xl mx-auto border shadow-md p-6 rounded-lg">
      
      <!-- Header -->
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-bold uppercase text-gray-900">Invoice</h1>
          <p class="text-base font-semibold mt-1">DriveEasy Rentals</p>
          <p class="text-sm text-gray-600">New Delhi, India</p>
          <p class="text-sm text-gray-600">GSTIN: 07ABCDE1234F1Z5</p>
        </div>
        <div class="text-right">
          <p class="text-sm font-semibold">Invoice No:</p>
          <p class="mb-2">${invoiceData.invoiceNumber}</p>
          <p class="text-sm font-semibold">Date:</p>
          <p>${invoiceData.issueDate}</p>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="mb-6">
        <p class="font-semibold text-lg mb-2">Billed To:</p>
        <div class="bg-gray-100 p-4 rounded">
          <p class="text-base font-medium">${invoiceData.customer.name}</p>
          <p class="text-sm">${invoiceData.customer.phone}</p>
        </div>
      </div>

      <!-- Car Rental Details -->
      <div class="mb-6">
        <p class="font-semibold text-lg mb-2">Rental Details:</p>
        <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
          <div>
            <p class="font-semibold">Car Model:</p>
            <p>${invoiceData.car.model}</p>
          </div>
          <div>
            <p class="font-semibold">Pickup Location:</p>
            <p>${invoiceData.car.pickup}</p>
          </div>
          <div>
            <p class="font-semibold">Drop Location:</p>
            <p>${invoiceData.car.drop}</p>
          </div>
          <div>
            <p class="font-semibold">Pickup Date:</p>
            <p>${invoiceData.car.pickupDate}</p>
          </div>
          <div>
            <p class="font-semibold">Drop Date:</p>
            <p>${invoiceData.car.dropDate}</p>
          </div>
        </div>
      </div>

      <!-- Cost Breakdown -->
      <div class="mb-6">
        <p class="font-semibold text-lg mb-2">Payment Summary:</p>
        <div class="w-full bg-white border rounded divide-y">
          <div class="flex justify-between px-4 py-2">
            <span>Base Price</span>
            <span>₹${invoiceData.price}</span>
          </div>
          <div class="flex justify-between px-4 py-2">
            <span>GST (${invoiceData.gst}%)</span>
            <span>₹${invoiceData.gstAmount}</span>
          </div>
          <div class="flex justify-between px-4 py-2">
            <span>Logistic Charges</span>
            <span>₹${invoiceData.logistic}</span>
          </div>
          <div class="flex justify-between px-4 py-2 font-bold bg-gray-100">
            <span>Total Amount</span>
            <span>₹${invoiceData.totalAmount}</span>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <div class="mt-10">
        <p class="text-sm font-semibold mb-1">Payment Info:</p>
        <p>Bank: HDFC Bank | Account No: 12345678901234 | IFSC: HDFC0000566</p>
      </div>

      <div class="mt-10 border-t pt-6 text-right">
        <p class="font-semibold">Authorised Signatory</p>
        <p class="text-sm text-gray-600">DriveEasy Pvt Ltd</p>
      </div>
    </div>
  </body>
  </html>
  `;
}
