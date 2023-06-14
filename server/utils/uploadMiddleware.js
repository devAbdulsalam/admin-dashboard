import multer from 'multer';
import path from 'path';
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, path.join(__dirname, 'public', 'uploads'));
	},
	filename: (req, file, cb) => {
		const fileName =
			new Date().getTime().toString() + path.extname(file.originalname);
		cb(null, fileName);
	},
});

export const uploadMiddleware = multer({ storage }).single('image');

