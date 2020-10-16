'use strict';


// Bring in our dependencies
const express = require('express');
const cors = require('cors');

require('dotenv').config();

// Declare our port for our server to listen on
const PORT = process.env.PORT || 3000;

// start/instanciate Express
const app = express();

// Use CORS (cross origin resource sharing)
app.use(cors());

// Routes
app.get('/', (request, response) => {
  response.send('Hello World');
});

app.get('/location', (request, response) => {
  try {

    let city = request.query.city;
    // getting the data from a database or API, using a flat file
    let data = require('./data/location.json')[0];
    let location = new Location(data, city);
    console.log(location);
    response.send(location);
  }
  catch (error) {
    console.log('ERROR', error);
    response.status(500).send('Yikes. Something went wrong.');
  }
});

// app.get('/restaurants', (request, response) => {
//   let data = require('./data/restaurants.json');
//   let restaurantArray = [];
//   data.nearby_restaurants.forEach(value => {
//     let restaurant = new Restaurant(value);
//     restaurantArray.push(restaurant);
//   });
//   console.log(restaurantArray);
//   response.send(restaurantArray);

// });

app.get('/weather', (request, response) => {
  try {

    let data = require('./data/weather.json');
    let weatherArray = [];
    data.data.forEach(day => {
      // turining valid_date onto a string
      let everyDay = day.valid_date;
      // split everyDay at '-'
      let splitDay = everyDay.split('-');
      // covert split day to dateString
      let stringDay = new Date(splitDay).toDateString();
      console.log(stringDay);
      // each date is now a string in stringDay
      let weather = new Weather(day, stringDay);
      // console.log(day.weather.description);
      weatherArray.push(weather);
    });
    console.log(weatherArray);
    response.send(weatherArray);
  }
  catch (error) {
    console.log('ERROR', error);
    response.status(500).send('Yikes. Something went wrong.');
  }
});

// app.get('/location', (request, response) => {
//   let location =
// })


// Constructor to tailor our incoming raw data

function Location(obj, query) {
  this.latitude = obj.lat;
  this.longitude = obj.lon;
  this.search_query = query;
  this.formatted_query = obj.display_name;
}

// function Restaurant(obj) {
//   this.url = obj.restaurant.url;
//   this.name = obj.restaurant.name;
//   this.rating = obj.restaurant.user_rating.aggregate_rating;
//   this.cost = obj.price_range;
//   this.image_url = obj.restaurant.thumb;
// }

function Weather(obj, date) {
  this.forecast = obj.weather.description;
  this.time = date;
}

// Start our server!
app.listen(PORT, () => {
  console.log(`Server is now listening on port ${PORT}`);
});
