import puppeteer from 'puppeteer-core';
import path from 'path';

export const generatePDF = async (html: string): Promise<Buffer> => {
    try {
        const browser = await puppeteer.launch({
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            headless: true,
        });
    
        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: 'networkidle0' });
    
        const buffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();
        return Buffer.from(buffer); 
    } catch (error) {
        console.error('PDF Generation failed:', error);
    throw new Error('Could not generate PDF');
    }
};
