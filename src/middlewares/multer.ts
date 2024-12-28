import { Request } from "express";
import multer, { Multer } from "multer";


const storage = multer.diskStorage({
    destination:(req:Request, file, cb) => {
        cb(null, "./public");
    },
    filename:(req:Request, file,cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload:Multer = multer({storage});

export default upload;