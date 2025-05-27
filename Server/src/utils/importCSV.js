const fs = require('fs');
const { parse } = require('csv-parse');
const mongoose = require('mongoose');
const Property = require('../models/property');

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const importCSV = async () => {
  const defaultUserId = new mongoose.Types.ObjectId(); // Temporary user ID
  const properties = [];

  fs.createReadStream('path/to/csvfile.csv')
    .pipe(parse({ columns: true }))
    .on('data', (row) => {
      properties.push({
        ...row,
        amenities: row.amenities.split('|'),
        tags: row.tags.split('|'),
        availableFrom: new Date(row.availableFrom),
        createdBy: defaultUserId,
      });
    })
    .on('end', async () => {
      await Property.insertMany(properties);
      console.log('CSV imported successfully');
      mongoose.connection.close();
    })
    .on('error', (err) => console.error(err));
};

importCSV();