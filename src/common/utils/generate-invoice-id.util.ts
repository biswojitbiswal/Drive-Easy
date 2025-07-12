export function generateInvoiceId(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  const timestamp = now.getTime().toString().slice(-5); // Last 5 digits of timestamp

  return `INV-${year}${month}${day}-${timestamp}`;
}
