const express = require('express')
const { deleteRlatedExpertise, updateRlatedExpertise, getRlatedExpertise, addRlatedExpertise, getRlatedExpertiseSearchPage, FilterFromSerchPage } = require('../controllers/RlatedExpertise')
const userControl = require('../middlewares/userControl')
const router = express.Router()


router.post('/addrlatedexpertise', userControl, addRlatedExpertise)
router.get('/getrlatedexpertise', userControl, getRlatedExpertise)
router.get('/getrlatedexpertisesearchpage', getRlatedExpertiseSearchPage)
router.post('/filterserchpage', FilterFromSerchPage)
router.put('/updaterlatedexpertise/:id', userControl, updateRlatedExpertise)
router.delete('/deleterlatedexpertise/:id', userControl, deleteRlatedExpertise)


module.exports = router