'use strict';


// Bring in our dependencies
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');
const pg = require('pg');
const { request } = require('express');
require('dotenv').config();


// Declare our port for our server to listen on
const PORT = process.env.PORT || 3000;

// start/instanciate Express
const app = express();

// Use CORS (cross origin resource sharing)
app.use(cors());

app.use(express.urlencoded());

// Create our postgres client
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', err => { throw err; });

// Routes
app.get('/', (request, response) => {
  response.send('Hello World');
});

app.get('/location', (request, response) => {

  let city = request.query.city;
  let key = process.env.LOCATIONIQ_API_KEY;

  // console.log('city', city);
  const URL = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;

  superagent.get(URL)
    .then(data => {
      let location = new Location(data.body[0], city);
      // console.log(location);
      response.status(200).json(location);
    })
    .catch((error) => {
      console.log('error', error);
      response.status(500).send('API is not working?');
    });
});



// getting the data from a database or API, using a flat file
// let data = require('./data/location.json')[0];
// console.log(location);
// response.send(location);


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
  let city = request.query.search_query;
  let key = process.env.WEATHER_API_KEY;
  const URL = `http://api.weatherbit.io/v2.0/forecast/daily/current?city=${city}&country=United%20States&key=${key}&days=7`;
  // let data = require('./data/weather.json');
  superagent.get(URL)
    .then(data => {
      let weatherArray = data.body.data.map(day => {
        let stringDay = new Date(day.ts * 1000).toDateString();

        let weather = new Weather(day, stringDay);
        // console.log(day.weather.description);
        return weather;
      });
      console.log(weatherArray);
      response.status(200).json(weatherArray);
      response.send(weatherArray);
    })
    .catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Yikes. Something went wrong.');
    });
});

app.get('/trails', trailHandler);

function trailHandler(request, response) {

  let lat = request.query.latitude;
  let lon = request.query.longitude;
  let key = process.env.TRAILS_API_KEY;

  const URL = `https://www.hikingproject.com/data/get-trails?lat=${lat}&lon=${lon}&key=${key}&days=10`;

  superagent.get(URL)
    .then(data => {
      let eachTrail = data.body.trails.map(trail => {
        // console.log(trail);
        let timeDateSplit = trail.conditionDate.split(' ');
        // console.log(timeDateSplit);

        return new Trails(trail, timeDateSplit);
      });
      response.status(200).json(eachTrail);
      response.send(eachTrail);
    })
    .catch((error) => {
      console.log('ERROR', error);
      response.status(500).send('Yikes. Something went wrong.');
    });
}

// app.get('/add', (request, response) => {
//   request.query
// });

// Copied from Class Demo 08
app.get('/add', (request, response) => {
  let SQL = 'SELECT * FROM location';
  client.query(SQL)
    .then(results => {
      console.log(results.rows[0]);
      response.status(200).json(results.rows);
    })
    .catch(error => {
      console.log('ERROR', error);
      response.status(500).send('So sorry, something went wrong.');
    });
});

//create an array
//create a loop to match the city name
//if there's a match retrieve the lat lon from the matching city
//otherwise, hit the API and store the new lat and lon to the database



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

function Trails(obj, dateTime) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.stars = obj.stars;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = obj.conditionStatus;
  this.condition_date = new Date(dateTime[0]).toDateString();
  this.condition_time = dateTime[1];
}

// Start our server!
client.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Now listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log('ERROR', err);
  });
