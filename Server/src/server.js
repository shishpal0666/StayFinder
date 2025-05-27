const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const propertyRoutes = require('./routes/properties');
const authRoutes = require('./routes/auth');
const favoriteRoutes = require('./routes/favorites');

dotenv.config();
const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use('/api/properties', propertyRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/favorites', favoriteRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .then(() => app.listen(PORT, () => console.log(`Server running on port ${PORT}`)))
  .catch(err => console.error(err));


