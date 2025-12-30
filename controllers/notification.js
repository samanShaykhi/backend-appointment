const jwt = require('jsonwebtoken');
const Consultant = require('../models/consultant');
const User = require('../models/user');
const Notification = require('../models/notification');
const AppError = require('../utils/AppError');
const asyncHandler = require('../middlewares/asyncHandler');
exports.getNotifications = asyncHandler(async (req, res, next) => {
    const { role } = req.params
    const { refresValidatToken } = req
    let user
    if (role === 'consultant') {
        user = await Consultant.findById(refresValidatToken)
    } else if (role === 'user' || role === 'admin') {
        user = await User.findById(refresValidatToken)
    } else {
        return next(new AppError('شما دسترستی ندارید.', 403))
    }
    if (!user) return next(new AppError('درخواست وجود ندارد.', 404))
    await Notification.updateMany({ user: user._id }, { $set: { reading: true } })

    const findNot = await Notification.find({ user: user._id }).sort({ _id: -1 })
    const findNotNum = await Notification.countDocuments({ user: user._id, reading: false })
    res.status(200).json({ notification: findNot, notNum: findNotNum })
})
exports.getNotificationsNumber = asyncHandler(async (req, res, next) => {
    const { role } = req.params
    const { refresValidatToken } = req
    let user
    if (role === 'consultant') {
        user = await Consultant.findById(refresValidatToken)
    } else if (role === 'user' || role === 'admin') {
        user = await User.findById(refresValidatToken)
    } else {
        return next(new AppError('ورود شما منقضی شده', 401))
    }
    if (!user) return next(new AppError('ورود شما منقضی شده', 401))

    const findNot = await Notification.countDocuments({ user: user._id, reading: false })
    res.status(200).json({ notNum: findNot })
})
exports.deletNot = asyncHandler(async (req, res, next) => {

    const { idDel } = req.params

    if (!idDel) return next(new AppError('صفحه پیدا نشد.', 404))
    await Notification.findByIdAndDelete(idDel)
    res.status(200).json('ok!')
})