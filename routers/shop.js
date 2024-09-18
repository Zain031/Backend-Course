const express = require('express')
const router = express.Router()
const Controller = require('../controllers/shop');
const authentication = require('../middlewares/authentication');

// router.post('/shop/buy', Controller.buyAvatar)

console.log("ENTER");

router.post('/shop/add-coin', authentication, Controller.addCoin)

router.post('/payment-notification-handler', Controller.paymentNotificationHandler)

module.exports = router