const multer = require("multer")

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`); 
    }
  });

  // file filter
  const fileFilter = (req, file, cb) => {
    const allowedtypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedtypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('only .jpeg, .jpg and .png format allowed!'));
    }
  };

  const upload = multer({
    storage: storage,
    fileFilter: fileFilter
  });

  module.exports = upload  