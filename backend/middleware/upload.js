import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let upload;

if (process.env.CLOUDINARY_CLOUD_NAME) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });

  const storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "matcha-vouchers",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      transformation: [{ width: 800, height: 800, crop: "limit", quality: "auto" }],
    },
  });

  upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
} else {
  const localStorage = multer.diskStorage({
    destination: path.join(__dirname, "..", "uploads"),
    filename: (req, file, cb) => {
      const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, unique + path.extname(file.originalname));
    },
  });

  upload = multer({
    storage: localStorage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = /jpg|jpeg|png|webp/;
      const ext = allowed.test(path.extname(file.originalname).toLowerCase());
      const mime = allowed.test(file.mimetype.split("/")[1]);
      cb(null, ext && mime);
    },
  });
}

export { upload };
