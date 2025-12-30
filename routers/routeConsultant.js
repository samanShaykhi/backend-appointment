const express = require('express')
const { addConsultant, getDataFromSingleConsultant, getConsultantPageCenter, getConsultant } = require('../controllers/consultantCon')
const upload = require('../middlewares/uploadImageConsultant')
const userControl = require('../middlewares/userControl')
const AdminControll = require('../middlewares/AdminControll')
const router = express.Router()

router.post('/addconsultant', AdminControll, upload.fields([{ name: 'video' }, { name: 'image' }]), addConsultant)
router.get('/getdatafromsingleconsultant/:id', getDataFromSingleConsultant)
router.get('/getconsultantpagecenter', getConsultantPageCenter)
router.get('/getconsultant', getConsultant)

module.exports = router