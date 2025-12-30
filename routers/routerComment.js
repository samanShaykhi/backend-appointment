const userControl = require('../middlewares/userControl')
const express = require('express')
const { getCommentsFromUser, CommentUserFromConsultant, CommentStatus, CommentStatusDelete, getComentsUnValid, getCommentFromConsultant } = require('../controllers/commentController')
const AdminControll = require('../middlewares/AdminControll')
const router = express.Router()

router.get('/getcommentsfromuser/:idconsultant', userControl, getCommentsFromUser)
router.put('/comentuser/:idcomment', userControl, CommentUserFromConsultant)
router.get('/getcomentsunvalid', AdminControll, getComentsUnValid)
router.get('/comentgetunvalid/:idcomment', userControl, CommentStatus)
router.get('/getcommentsconsultant/:idconsultant', getCommentFromConsultant)
router.delete('/comentreject/:idcomment', userControl, CommentStatusDelete)

module.exports = router