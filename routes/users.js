const express = require('express');
const router = express.Router();

const userModel = require('../models/users')

//SIGN-UP
router.post('/sign-up', async function (req, res, next) {

  const searchUser = await userModel.findOne({
    email: req.body.emailFromFront
  })

  if (!searchUser) {
    const newUser = new userModel({
      username: req.body.usernameFromFront,
      email: req.body.emailFromFront,
      password: req.body.passwordFromFront,
    })

    const newUserSave = await newUser.save();

    req.session.user = {
      name: newUserSave.username,
      id: newUserSave._id,
    }

    console.log(req.session.user)

    res.redirect('/weather')
  } else {
    res.redirect('/')
  }

})

//SIGN-IN
router.post('/sign-in', async function (req, res, next) {

  const searchUser = await userModel.findOne({
    email: req.body.emailFromFront,
    password: req.body.passwordFromFront
  })

  if (searchUser != null) {
    req.session.user = {
      name: searchUser.username,
      id: searchUser._id
    }
    res.redirect('/weather')
  } else {
    res.render('login')
  }
})

router.get('/logout', function (req, res, next) {
  req.session.user = null;
  res.redirect('/')
})

module.exports = router;
