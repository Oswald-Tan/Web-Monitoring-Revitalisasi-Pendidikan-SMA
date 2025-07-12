import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fungsi untuk membuat middleware upload dinamis
const createUploader = (folderName, fileSizeLimit = 10 * 1024 * 1024) => {
  // Buat direktori jika belum ada
  const uploadDir = path.join(__dirname, `../../uploads/${folderName}`);
  
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      // Generate nama file unik dengan hash
      const uniquePrefix = crypto.randomBytes(8).toString('hex');
      const ext = path.extname(file.originalname);
      const basename = path.basename(file.originalname, ext);
      
      // Format: [timestamp]-[hash]-[originalname]
      cb(null, `${Date.now()}-${uniquePrefix}-${basename}${ext}`);
    }
  });

  const fileFilter = (req, file, cb) => {
    const allowedTypes = [
      'application/pdf', 
      'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Jenis file tidak diizinkan. Hanya dokumen dan gambar yang diperbolehkan`), false);
    }
  };

  return multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
      fileSize: fileSizeLimit
    }
  });
};

// Buat middleware upload khusus untuk setiap jenis
export const suratUpload = createUploader('surat'); // Tambahkan ini
export const dokumenUpload = createUploader('documents');
export const arsipUpload = createUploader('arsip');

// Ekspor fungsi untuk penggunaan khusus
export default createUploader;