const express = require('express'); 
const mongoose = require('mongoose');
const path = require('path');
const campground = require('./models/campground');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
}

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/', (req, res) => {
    res.render('home');
});

app.get('/campgrounds', async(req, res) => {
    const camp = new campground({title: 'My Backyard', description: 'Cheap camping!'});
    await camp.save();
    res.send(camp)
})

app.listen(3000, () => {
    console.log('Serving on port 3000')
});