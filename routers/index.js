const express = require('express')
const router = express.Router()
const userRouter = require('./user');
const courseRouter = require('./course');
const shopRouter = require('./shop');

router.use(userRouter)
router.use(courseRouter)
router.use(shopRouter)

module.exports = router