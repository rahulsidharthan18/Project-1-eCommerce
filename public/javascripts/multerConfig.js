const multer = require('multer');

const multerStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/product-images')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const uploadMultiple = multer({ storage: multerStorage }).fields([{name :'image1', maxCount : 1}, {name :'image2', maxCount : 1}, {name :'image3', maxCount : 1}, {name :'image4', maxCount : 1}])

module.exports = {uploadMultiple};