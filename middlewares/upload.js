const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: path.join(__dirname, "../tmp"),
  filename: (req, file, cb) => {
    cb(null, uuidv4() + file.originalname);
  },
});

const upload = multer({
  storage,
});

module.exports = { upload };
