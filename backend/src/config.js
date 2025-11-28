require('dotenv').config();

const getConfig = () => ({
	port: process.env.PORT || 4000,
	mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fiesta_finder',
	jwtSecret: process.env.JWT_SECRET || 'replace_me',
	cloudinary: {
		cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
		apiKey: process.env.CLOUDINARY_API_KEY || '',
		apiSecret: process.env.CLOUDINARY_API_SECRET || '',
		uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET || ''
	}
});

module.exports = getConfig();


