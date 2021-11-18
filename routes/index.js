const express = require('express');
const router = express.Router();
const request = require('sync-request');

const cityModel = require('../models/cities')

//HOME PAGE
router.get('/', function (req, res, next) {
  res.render('login');
});

//AFFICHAGE DE LA METEO DES VILLES
router.get('/weather', async function (req, res, next) {
  if (req.session.user == null) {
    res.redirect('/')
  } else {
    const cityList = await cityModel.find();

    res.render('weather', { cityList })
  }
});

//AJOUT D'UNE VILLE
router.post('/add-city', async function (req, res, next) {
  const data = request("GET", `https://api.openweathermap.org/data/2.5/weather?q=${req.body.newcity}&units=metric&lang=fr&appid=b312bec590edc9a175a0500e533c1384`)
  const dataAPI = JSON.parse(data.body)

  let alreadyExist = await cityModel.findOne({ name: req.body.newcity.toLowerCase() });

  if (alreadyExist == null && dataAPI.name) {
    const newCity = new cityModel({
      name: req.body.newcity.toLowerCase(),
      desc: dataAPI.weather[0].description,
      img: "http://openweathermap.org/img/wn/" + dataAPI.weather[0].icon + ".png",
      temp_min: dataAPI.main.temp_min,
      temp_max: dataAPI.main.temp_max,
      lon: dataAPI.coord.lon,
      lat: dataAPI.coord.lat,
    });

    await newCity.save();
  }

  const cityList = await cityModel.find();

  res.render('weather', { cityList })
});

//SUPPRIMER UNE VILLE
router.get('/delete-city', async function (req, res, next) {

  await cityModel.deleteOne({
    _id: req.query.id
  })

  const cityList = await cityModel.find();

  res.render('weather', { cityList })
});

//METTRE A JOUR
router.get('/update-cities', async function (req, res, next) {
  const cityList = await cityModel.find();

  for (let i = 0; i < cityList.length; i++) {
    const data = request("GET", `https://api.openweathermap.org/data/2.5/weather?q=${cityList[i].name}&units=metric&lang=fr&appid=b312bec590edc9a175a0500e533c1384`)
    const dataAPI = JSON.parse(data.body)

    await cityModel.updateOne({
      _id: cityList[i].id
    }, {
      name: cityList[i].name,
      desc: dataAPI.weather[0].description,
      img: "http://openweathermap.org/img/wn/" + dataAPI.weather[0].icon + ".png",
      temp_min: dataAPI.main.temp_min,
      temp_max: dataAPI.main.temp_max,
    })
  }

  cityList = await cityModel.find();

  res.render('weather', { cityList })
});


module.exports = router;
