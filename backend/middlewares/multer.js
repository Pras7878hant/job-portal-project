// Path: backend/middlewares/multer.js

import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({ storage });

function getDataUri(file) {

     if (!file || !file.buffer) {
          console.error("getDataUri received an invalid file object:", file);
          throw new Error("Cannot convert to Data URI: Missing file or file buffer.");
     }

     const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;
     return {
          content: dataUri,
          mimetype: file.mimetype
     };
}


export { upload, getDataUri };