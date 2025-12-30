const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!req.files) return
    if (req.files.video) {
      cb(null, 'public/consultant/video');
      } else if (req.files.images) {
      cb(null, 'public/consultant/images');
      }else{
        cb(null, 'public/consultant/images');
    }
  },
  filename: (req, file, cb) => {
    if (!req.files) return
    const getTypeFile = file.mimetype.split('/')[1]
    cb(null, `${uuidv4()}.${getTypeFile}`);
  }
});

// Create the multer instance
const upload = multer({ storage: storage });

module.exports = upload;