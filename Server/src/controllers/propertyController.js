const Property = require('../models/Property');
const redis = require('redis');
const client = redis.createClient({ url: process.env.REDIS_URL });
client.connect();

exports.searchProperties = async (req, res) => {
  try {
    const query = req.query;
    const cacheKey = `properties:${JSON.stringify(query)}`;

    // Check cache
    const cached = await client.get(cacheKey);
    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Build MongoDB query
    const match = {};
    if (query.type) match.type = query.type;
    if (query.city) match.city = query.city;
    if (query.state) match.state = query.state;
    if (query.priceMin) match.price = { $gte: Number(query.priceMin) };
    if (query.priceMax) match.price = { ...match.price, $lte: Number(query.priceMax) };
    if (query.areaSqFtMin) match.areaSqFt = { $gte: Number(query.areaSqFtMin) };
    if (query.areaSqFtMax) match.areaSqFt = { ...match.areaSqFt, $lte: Number(query.areaSqFtMax) };
    if (query.bedrooms) match.bedrooms = Number(query.bedrooms);
    if (query.bathrooms) match.bathrooms = Number(query.bathrooms);
    if (query.amenities) match.amenities = { $all: query.amenities.split(',') };
    if (query.furnished) match.furnished = query.furnished;
    if (query.listedBy) match.listedBy = query.listedBy;
    if (query.tags) match.tags = { $all: query.tags.split(',') };
    if (query.listingType) match.listingType = query.listingType;
    if (query.isVerified) match.isVerified = query.isVerified === 'true';

    const pipeline = [
      { $match: match },
      { $sort: { [query.sortBy || 'price']: Number(query.order || 1) } },
      { $skip: Number(query.skip || 0) },
      { $limit: Number(query.limit || 10) },
    ];

    const properties = await Property.aggregate(pipeline);

    // Cache result
    await client.setEx(cacheKey, 3600, JSON.stringify(properties));
    res.json(properties);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ id: req.params.id });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    res.json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.createProperty = async (req, res) => {
  try {
    const property = new Property({ ...req.body, createdBy: req.user.id });
    await property.save();
    await client.flushAll(); // Invalidate cache
    res.status(201).json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ id: req.params.id });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (property.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    Object.assign(property, req.body);
    await property.save();
    await client.flushAll(); // Invalidate cache
    res.json(property);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findOne({ id: req.params.id });
    if (!property) return res.status(404).json({ error: 'Property not found' });
    if (property.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await property.remove();
    await client.flushAll(); // Invalidate cache
    res.json({ message: 'Property deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
