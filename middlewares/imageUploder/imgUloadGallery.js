const multer = require("multer");

// تنظیمات ذخیره‌سازی فایل‌ها
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/images/article"); // مسیر ذخیره‌سازی فایل
  },
  filename: (req, file, cb) => {
    // cb(null, Date.now() + path.extname(file.originalname)); // نام فایل + پسوند اصلی
    cb(null, Date.now() + file.originalname); // نام فایل + پسوند اصلی
  },
});

// فیلتر فایل برای ولیدیشن
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  if (!allowedTypes.includes(file.mimetype)) {
    // اینجا می‌فرستیم ارور به Multer
    return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "فرمت فایل معتبر نیست"));
  }

  cb(null, true);
}

// ساخت instance اصلی Multer
const upload = multer({
  storage,
//   limits: { fileSize: 12 * 1024 * 1024 }, // محدودیت حجم (۲MB)
//   fileFilter,
});

// middleware آماده برای استفاده
const imgUloadGallery = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      
      if (err instanceof multer.MulterError) {
        // ارورهای مخصوص multer (مثل حجم یا فرمت فایل)
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({ message: "حجم فایل نباید بیشتر از ۲MB باشد" });
        }
        if (err.code === "LIMIT_UNEXPECTED_FILE") {
          return res.status(400).json({ message: "فرمت فایل معتبر نیست (jpg, png, webp)" });
        }
        return res.status(400).json({ message: "خطای آپلود فایل", details: err.message });
      } else if (err) {
        // ارورهای عمومی
        return res.status(500).json({ message: "مشکل داخلی سرور", details: err.message });
      }
      next();
    });
  };
};

module.exports = imgUloadGallery;
