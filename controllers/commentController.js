const Comment = require("../models/comment");
const jwt = require('jsonwebtoken');
const Notification = require("../models/notification");
const User = require('../models/user')
const Consultant = require('../models/consultant');
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");

exports.getCommentsFromUser = asyncHandler(async (req, res, next) => {
    const { idconsultant } = req.params
    const { refresValidatToken } = req
    if (!idconsultant) return next(new AppError('درخواست نا معتبر', 404))

    const findComments = await Comment.find({ creatorId: refresValidatToken, consultantId: idconsultant, sendUser: false })
    res.status(200).json({ comments: findComments })
})
exports.CommentUserFromConsultant = asyncHandler(async (req, res, next) => {
    const { idcomment } = req.params
    const { textBody, score } = req.body
    if (!idcomment || !textBody || !score) return next(new AppError('ورودی ها ناقص هستند.', 400))

    const comment = await Comment.findById(idcomment)
    comment.textBody = textBody
    comment.score = score
    comment.status = false
    comment.sendUser = true
    await comment.save()
    res.status(200).json('ok!')

})
exports.getComentsUnValid = asyncHandler(async (req, res, next) => {
    const findComment = await Comment.find({ status: false })
    return res.status(200).json({ comments: findComment })

})

exports.CommentStatus = asyncHandler(async (req, res, next) => {
    const { idcomment } = req.params
    const { refresValidatToken } = req

    const findUser = await User.findById(refresValidatToken)
    if (findUser.role !== 'admin') return next(new AppError('شما دسترستی ندارید', 403))

    const findComment = await Comment.findById(idcomment)
    findComment.status = true
    findComment.date = Date.now()
    await findComment.save()

    // Average score
    const findConsultant = await Consultant.findById(findComment.consultantId)
    if (findConsultant) {
        if (!findConsultant.score) {
            findConsultant.score = findComment.score
        } else {
            const total_score_befor = findConsultant.score * findConsultant.numberClients
            const total_score_befor_new = findComment.score + total_score_befor
            const newAverage = total_score_befor_new / findConsultant.numberClients
            findConsultant.score = newAverage
        }
    }
    await findConsultant.save()
    // Average score

    await Notification.create({
        text: `کاربر عزیز ممنون از درمیون گذاشتن نظر خود با ما. نظر شما ثبت شد`,
        user: findComment.creatorId,
    })
    await Notification.create({
        text: ` مشاور گرامی کاربر ${findComment.creator.firstName} ${findComment.creator.lastName} یک دیگاه برای شما گذاشت `,
        user: findComment.consultantId,
    })
    return res.sendStatus(200)
})
exports.CommentStatusDelete = asyncHandler(async (req, res, next) => {
    const { idcomment } = req.params
    const { refresValidatToken } = req

    const findUser = await User.findById(refresValidatToken)
    if (findUser.role !== 'admin') return next(new AppError('شما دسترستی ندارید', 403))
    await Comment.findByIdAndDelete(idcomment)
    return res.sendStatus(200)

})
exports.getCommentFromConsultant = asyncHandler(async (req, res, next) => {
    const { idconsultant } = req.params
    if (!idconsultant) return next(new AppError('چیزی یافت نشد', 404))
    const comments = await Comment.find({ consultantId: idconsultant, status: true })
    return res.status(200).json({ comments })

}) 