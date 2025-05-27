const Favorite = require('../models/Favorite');

exports.addFavorite = async (req, res) => {
  try {
    const { propertyId } = req.body;
    const favorite = new Favorite({ user: req.user.id, property: propertyId });
    await favorite.save();
    res.status(201).json(favorite);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getFavorites = async (req, res) => {
  try {
    const favorites = await Favorite.find({ user: req.user.id }).populate('property');
    res.json(favorites);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteFavorite = async (req, res) => {
  try {
    const favorite = await Favorite.findOne({ user: req.user.id, property: req.params.propertyId });
    if (!favorite) return res.status(404).json({ error: 'Favorite not found' });
    await favorite.remove();
    res.json({ message: 'Favorite removed' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};