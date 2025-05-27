const fs = require('fs');
const { parse } = require('csv-parse');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected for CSV import'))
  .catch(err => console.error('MongoDB connection error:', err));

const importCSV = async () => {
  const defaultUserId = new mongoose.Types.ObjectId(); // Temporary user ID
  const properties = [];

  fs.createReadStream('data.csv') // Update with correct path
    .pipe(parse({ columns: true }))
    .on('data', (row) => {
      properties.push({
        ...row,
        amenities: row.amenities.split('|'),
        tags: row.tags.split('|'),
        availableFrom: new Date(row.availableFrom),
        isVerified: row.isVerified === 'True' ? true : false, // Convert string to boolean
        createdBy: defaultUserId,
      });
    })
    .on('end', async () => {
      try {
        await Property.insertMany(properties);
        console.log('CSV imported successfully');
      } catch (err) {
        console.error('Error importing CSV:', err);
      } finally {
        mongoose.connection.close();
      }
    })
    .on('error', (err) => console.error('CSV parsing error:', err));
};

importCSV();