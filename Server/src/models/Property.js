const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  price: { type: Number, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  areaSqFt: { type: Number, required: true },
  bedrooms: { type: Number, required: true },
  bathrooms: { type: Number, required: true },
  amenities: [{ type: String }],
  furnished: { type: String, required: true },
  availableFrom: { type: Date, required: true },
  listedBy: { type: String, required: true },
  tags: [{ type: String }],
  colorTheme: { type: String, required: true },
  rating: { type: Number, required: true },
  isVerified: { type: Boolean, required: true },
  listingType: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
});

module.exports = mongoose.model('Property', propertySchema);