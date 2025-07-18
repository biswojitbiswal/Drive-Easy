import * as dotenv from 'dotenv';
dotenv.config();
import { Readable } from 'stream';


import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

console.log('Cloudinary config:', {
  name: process.env.CLOUDINARY_CLOUD_NAME,
  key: process.env.CLOUDINARY_API_KEY,
  secret: process.env.CLOUDINARY_API_SECRET ? '****' : 'undefined',
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: 'driveeasy',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'pdf'],
    transformation: [{ width: 800, height: 600, crop: 'limit' }],
  }),
});

export async function uploadBuffer(buffer: Buffer, options: any): Promise<any> {
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      });

      Readable.from(buffer).pipe(stream);
    });
  }
