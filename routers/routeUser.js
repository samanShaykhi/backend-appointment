const express = require('express')
const { loginUser, SinIn, RefreshToken, RefreshGetUser, updateUser, logout, vrifyOTP } = require('../controllers/userCon')
const router = express.Router()
const userControl = require('../middlewares/userControl')
const userControlStatus = require('../middlewares/userControlStatus')

router.post('/loginuser', loginUser)
router.post('/sinin', SinIn)
router.post('/vrifyotp', vrifyOTP)
router.get('/refreshuser', RefreshToken)
router.get('/logout', logout)
router.get('/refreshgetuser', userControlStatus, RefreshGetUser)
router.put('/updateusers',userControl, updateUser)

module.exports = router