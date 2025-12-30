const express = require('express')
const { AddReservation, getReservationFromSingle, getReserveationsFromConsultant, getReserveationsUser } = require('../controllers/reservation')
const userControl = require('../middlewares/userControl')
const router = express.Router()

router.post('/addreservation', userControl, AddReservation)
router.get('/getressinglecunsul/:consultantid', getReservationFromSingle)
router.get('/reserveationsconsultant', userControl, getReserveationsFromConsultant)
router.get('/reserveationsuser', userControl, getReserveationsUser)

module.exports = router