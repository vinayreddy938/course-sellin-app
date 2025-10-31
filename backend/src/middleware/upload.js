const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      console.log("Uploaded file type:", file.mimetype);
    const allowedTypes = ["image/jpeg","image/png","image/webp","video/mp4","video/mkv","video/x-matroska","application/pdf"]
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }
    cb(null, true);
  },
})  
module.exports = upload;
