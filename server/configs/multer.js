import multer from 'multer';

/**
 * files are stored in the OS temp directory by default.
 * Used for uploading product images before sending to Cloudinary.
 */
export const upload = multer({ storage: multer.diskStorage({}) });
