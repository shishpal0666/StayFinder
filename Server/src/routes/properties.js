const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { createProperty, getProperty, updateProperty, deleteProperty, searchProperties } = require('../controllers/propertyController');

router.post('/', auth, createProperty);
router.get('/:id', getProperty);
router.put('/:id', auth, updateProperty);
router.delete('/:id', auth, deleteProperty);
router.get('/', searchProperties);

module.exports = router;