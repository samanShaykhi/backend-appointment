const express = require('express')
const { Addappointment, getAppointments, getDataFromSingleConsultant } = require('../controllers/appointmentController')
const userControl = require('../middlewares/userControl')
const router = express.Router()

router.post('/addappointment', userControl, Addappointment)
router.get('/appointmentget', userControl, getAppointments)
router.get('/getdays/:id', getDataFromSingleConsultant)

module.exports = router