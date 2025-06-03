const multer = require("multer");

// Store in memory for direct Cloudinary upload
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;
