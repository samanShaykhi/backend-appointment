const express = require('express')
const { getNotifications, getNotificationsNumber, deletNot } = require('../controllers/notification')
const userControl = require('../middlewares/userControl')
const userControlStatus = require('../middlewares/userControlStatus')
const router = express.Router()

router.get('/getnot/:role', userControl, getNotifications)
router.get('/getnotnum/:role', userControlStatus, getNotificationsNumber)
router.delete('/deletenot/:idDel', userControl, deletNot)

module.exports = router