import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.resolve(process.cwd(), "uploads", "relatorios");
fs.mkdirSync(uploadDir, { recursive: true });

export const relatorioUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (req: any, file, cb) => {
      const aulaId = req.params?.id || "aula";
      const ext = path.extname(file.originalname) || "";
      const safe = file.fieldname.replace(/\W+/g, "");
      cb(null, `${aulaId}-${safe}-${Date.now()}${ext}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});
