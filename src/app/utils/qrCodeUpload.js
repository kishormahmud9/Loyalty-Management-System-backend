import multer from "multer";
import path from "path";
import fs from "fs";

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = "uploads/qrcodes/";

        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        // Use the numeric qrCode as the filename if provided in req.body, 
        // otherwise use a unique name. Note: QR codes generated on server side 
        // usually won't go through Multer as a 'file' upload from the client, 
        // but this config provides the directory and storage logic.
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, "qrcode-" + uniqueSuffix + ".png");
    },
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpeg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Invalid file type. Only images are allowed for QR codes."), false);
    }
};

export const qrCodeUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 2 * 1024 * 1024, // 2MB limit for QR codes
    },
});

export const QR_CODE_DIR = "uploads/qrcodes/";
