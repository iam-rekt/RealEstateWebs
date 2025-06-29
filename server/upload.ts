import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { RequestHandler } from 'express';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Image processing middleware
export const processImage: RequestHandler = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const timestamp = Date.now();
    const originalName = path.parse(req.file.originalname).name;
    const filename = `${originalName}-${timestamp}`;

    // Process and save the main image
    const mainImagePath = path.join(uploadDir, `${filename}.webp`);
    await sharp(req.file.buffer)
      .resize(1200, 800, { 
        fit: 'cover', 
        position: 'center' 
      })
      .webp({ quality: 85 })
      .toFile(mainImagePath);

    // Create thumbnail
    const thumbnailPath = path.join(uploadDir, `${filename}-thumb.webp`);
    await sharp(req.file.buffer)
      .resize(400, 300, { 
        fit: 'cover', 
        position: 'center' 
      })
      .webp({ quality: 80 })
      .toFile(thumbnailPath);

    // Create small thumbnail for cards
    const smallThumbPath = path.join(uploadDir, `${filename}-small.webp`);
    await sharp(req.file.buffer)
      .resize(200, 150, { 
        fit: 'cover', 
        position: 'center' 
      })
      .webp({ quality: 75 })
      .toFile(smallThumbPath);

    // Return the URLs
    const baseUrl = '/uploads';
    res.json({
      imageUrl: `${baseUrl}/${filename}.webp`,
      thumbnailUrl: `${baseUrl}/${filename}-thumb.webp`,
      smallThumbnailUrl: `${baseUrl}/${filename}-small.webp`,
      originalName: req.file.originalname,
      size: req.file.size,
    });

  } catch (error) {
    console.error('Image processing error:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
};

// Clean up old images
export const cleanupOldImage = (imageUrl: string) => {
  try {
    if (imageUrl && imageUrl.startsWith('/uploads/')) {
      const filename = path.basename(imageUrl, '.webp');
      const files = [
        path.join(uploadDir, `${filename}.webp`),
        path.join(uploadDir, `${filename}-thumb.webp`),
        path.join(uploadDir, `${filename}-small.webp`),
      ];

      files.forEach(file => {
        if (fs.existsSync(file)) {
          fs.unlinkSync(file);
        }
      });
    }
  } catch (error) {
    console.error('Error cleaning up old image:', error);
  }
};