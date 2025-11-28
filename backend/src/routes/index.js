const express = require('express');
const auth = require('../middleware/auth');
const authController = require('../controllers/authController');
const festivalController = require('../controllers/festivalController');
const favoriteController = require('../controllers/favoriteController');
const cloudinaryController = require('../controllers/cloudinaryController');

const router = express.Router();

// Debug: connected DB name
router.get('/debug/db', async (_req, res) => {
	const mongoose = require('mongoose');
	const name = mongoose.connection?.name;
	const host = mongoose.connection?.host;
	return res.json({ dbName: name, host });
});

// Auth
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.get('/auth/me', auth, authController.me);

// Cloudinary
router.post('/cloudinary/signature', cloudinaryController.getUploadSignature);

// Festivals
router.get('/festivals', festivalController.list);
router.get('/festivals/:id', festivalController.getById);
router.post('/festivals', auth, festivalController.create);

// Favorites
router.get('/me/favorites', auth, favoriteController.getFavorites);
router.post('/me/favorites/:festivalId/toggle', auth, favoriteController.toggleFavorite);

module.exports = router;

