require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const movies = require('./moviedex');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(cors());

function validateBearerToken(req, res, next) {
  const authVal = req.get('Authorization');
  //validate the authorization header to be properly formatted
  if(!authVal.startsWith('Bearer')){
    return res.status(400).json({error: 'Missing or Malformed Authorization header'});
  }
  //validate the token is authorized 
  const bearerToken = authVal.split(' ')[1];
  const apiToken = process.env.API_TOKEN;

  if (bearerToken !== apiToken) {
    return res.status(401).json({error: 'Unauthorized User'});
  }
  //if validation passes, go to next middleware in piple
  next();
}

function handleGetMovies (req, res) {
  let response = movies;
  const { genre, country, avg_vote } = req.query;

  if (genre) {
    response = response.filter(m => m.genre.toLowerCase().includes(genre.toLowerCase()));
  }
  if (country) {
    response = response.filter(m => m.country.toLowerCase().includes(country.toLowerCase()));
  }
  if (avg_vote) {
    response = response.filter(m => Number(m.avg_vote) >= Number(avg_vote));
  }
  res.json(response);
}

app.get('/movie', validateBearerToken,handleGetMovies);

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
