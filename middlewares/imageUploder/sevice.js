const multer = require("multer");
const { v4: uuidv4 } = require('uuid');

const storageThumbnail = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "public/uploads/images/service/thumbnail");
    },
    filename: (req, file, cb) => {
        cb(null, uuidv4() + file.originalname);
    },
});

const fileFilter = async (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp", "image/svg+xml"];
    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "فرمت آیکون معتبر نیست"));
    }
    cb(null, true);
}

const uploadThumbnail = multer({
    storage: storageThumbnail,
    limits: { fileSize: 2 * 1024 * 1024 },
    fileFilter,
});
const serviceUpluderThumbnail = (fieldName) => {
    return async (req, res, next) => {
        uploadThumbnail.single(fieldName)(req, res, (err) => {
            if (!req.file) return res.status(400).json({ message: 'خدمت باید آیکون داشته باشد' });
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ message: "حجم آیکون نباید بیشتر از ۲MB باشد" });
                }
                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({ message: "فرمت آیکون معتبر نیست (jpg, png, webp)" });
                }
                return res.status(400).json({ message: "خطای آپلود آیکون", details: err.message });
            } else if (err) {
                return res.status(500).json({ message: "مشکل داخلی سرور", details: err.message });
            }
            next();
        });
    };
};
const serviceUpluderThumbnailEdite = (fieldName) => {
    return async (req, res, next) => {
        uploadThumbnail.single(fieldName)(req, res, (err) => {
            if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                    return res.status(400).json({ message: "حجم آیکون نباید بیشتر از ۲MB باشد" });
                }
                if (err.code === "LIMIT_UNEXPECTED_FILE") {
                    return res.status(400).json({ message: "فرمت آیکون معتبر نیست (jpg, png, webp)" });
                }
                return res.status(400).json({ message: "خطای آپلود آیکون", details: err.message });
            } else if (err) {
                return res.status(500).json({ message: "مشکل داخلی سرور", details: err.message });
            }
            next();
        });
    };
};



module.exports = {serviceUpluderThumbnail, serviceUpluderThumbnailEdite};
