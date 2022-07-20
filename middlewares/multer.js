const multer = require('multer')
const upload = multer({
    storage: multer.diskStorage({}),
    // here we can take a filter option that which type of image a user can upload on cloudinary..
});
module.exports = upload