const multer = require("multer");
const { v4: uuidv4 } = require('uuid');

const storageThumbnail = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/images/portfolio/thumbnail");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + file.originalname);
  },
});
const storageGallery = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/images/portfolio/gallery");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + file.originalname);
  },
});

const fileFilter = async (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "فرمت فایل معتبر نیست"));
  }
  cb(null, true);
}

const uploadThumbnail = multer({
  storage: storageThumbnail,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});
const uploadGallery = multer({
  storage: storageGallery,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter,
});

const portfolioThumbnail = (fieldName) => {
  return async (req, res, next) => {
    uploadThumbnail.single(fieldName)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "حجم پوستر نباید بیشتر از ۲MB باشد" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({ message: "فرمت پوستر معتبر نیست (jpg, png, webp)" });
        }
        return res.status(400).json({ message: "خطای آپلود پوستر", details: err.message });
      } else if (err) {
        return res.status(500).json({ message: "مشکل داخلی سرور", details: err.message });
      }
      next();
    });
  };
};

const portfolioGallery = (fieldName) => {
  return async (req, res, next) => {
    uploadGallery.array(fieldName, 8)(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "حجم پوستر نباید بیشتر از ۲MB باشد" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          console.log(err)
          return res.status(400).json({ message: "فرمت پوستر معتبر نیست (jpg, png, webp)" });
        }
        return res.status(400).json({ message: "خطای آپلود پوستر", details: err.message });
      } else if (err) {
        console.log(err)
        return res.status(500).json({ message: "مشکل داخلی سرور", details: err.message });
      }
      next();
    });
  };
};

module.exports = { portfolioThumbnail, portfolioGallery };
