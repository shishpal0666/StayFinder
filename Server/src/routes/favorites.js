const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { addFavorite, getFavorites, deleteFavorite } = require('../controllers/favoriteController');

router.post('/', auth, addFavorite);
router.get('/', auth, getFavorites);
router.delete('/:propertyId', auth, deleteFavorite);

module.exports = router;