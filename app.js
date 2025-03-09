const express = require('express'); 
const mongoose = require('mongoose');
const path = require('path');
const mate = require('ejs-mate');
const joi = require('joi');
const wrapAsync = require('./utils/wrapAsync');  
const {campgroundSchema, reviewSchema} = require('./utils/joiSchema');
const ExpressError = require('./utils/ExpressError');
const methodOverride = require('method-override');  
const Campground = require('./models/campground');
const Review = require('./models/review');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
}

const app = express();

app.engine('ejs', mate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true })); 
app.use(methodOverride('_method')); 

const validateCamp = (req, res, next) => {
    
    const result = campgroundSchema.validate(req.body);
    if(result.error){
        const msg = result.error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
}

const validateReview = (req, res, next) => {

    const result = reviewSchema.validate(req.body);
    if(result.error){
        const msg = result.error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    next();
}

app.get('/', (req, res) => {
    res.render('home');
}); 

app.get('/campgrounds', wrapAsync(async(req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}))

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');    
})

app.post('/campgrounds', validateCamp, wrapAsync(async (req, res) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}))

app.get('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id).populate('reviews');
    res.render('campgrounds/show', { camp });
}))

app.get('/campgrounds/:id/edit', wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    res.render('campgrounds/edit', { camp });
}))

app.put('/campgrounds/:id', validateCamp, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {... req.body.campground}); 
    res.redirect(`/campgrounds/${campground._id}`);
}))

app.delete('/campgrounds/:id', wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}))

app.post('/campgrounds/:id/reviews', validateReview, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    const review = new Review(req.body.review);
    camp.reviews.push(review);
    await review.save();
    await camp.save(); 
    res.redirect(`/campgrounds/${id}`);
}))

app.delete('/campgrounds/:id/reviews/:reviewId', wrapAsync(async (req, res) => {
    const { reviewId, id } = req.params; 
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));    
})

app.use((err, req, res, next) => {
    const { statusCode = 500} = err;
    if(!err.message) err.message = "Something went wrong";
    res.status(statusCode).render('error', {err});
})

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Serving on port ${PORT}`);
});