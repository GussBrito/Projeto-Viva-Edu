import path from 'path';
import multer from 'multer';

const tutorsDir = path.resolve(process.cwd(), 'uploads', 'tutors');

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, tutorsDir),

  filename: (req: any, file, cb) => {
    // req.user.id vem do seu middleware authenticate
    const userId = req.user?.id || 'unknown';
    const ext = path.extname(file.originalname || '');
    const safeExt = ext ? ext.toLowerCase() : '';

    const stamp = Date.now();
    const name = `${userId}-${file.fieldname}-${stamp}${safeExt}`;
    cb(null, name);
  }
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
  if (!allowed.includes(file.mimetype)) return cb(new Error('Arquivo inválido. Envie PDF/PNG/JPG.'));
  cb(null, true);
}

export const uploadTutorDocs = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});
