const mongoose = require('mongoose');
const campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');
// const cities = require('./cities-american');
const cities = require('./cities-europe');
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
  console.log('Connection open for seeding');

  await campground.deleteMany({});

  for(let i=0; i<50; i++){
    const rand1000 = Math.floor(Math.random() * 106);
    const camp = new campground({
        location: `${cities[rand1000].city}, ${cities[rand1000].countryName}`,
        title: `${descriptors[Math.floor(Math.random() * descriptors.length)]} ${places[Math.floor(Math.random() * places.length)]}`,
    })
    await camp.save();
  }
 
  console.log('Seeded the database');
  mongoose.connection.close();
}


main().catch(err => console.log(err));




