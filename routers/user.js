const express = require('express')
const router = express.Router()
const Controller = require('../controllers/user');
const authentication = require('../middlewares/authentication');

router.post('/login', Controller.login)

router.post('/register', Controller.register)

// router.patch('/update-avatar', Controller.userAvatar)

router.get('/profile', authentication, Controller.userProfile)

router.get('/leaderboard', authentication, Controller.leaderBoard)

module.exports = router