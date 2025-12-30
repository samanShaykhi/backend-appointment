const Appointment = require("../models/appointment")
const jalaali = require('jalaali-js');
const { deleteQueue } = require("../redis/queue");
const asyncHandler = require("../middlewares/asyncHandler");
const AppError = require("../utils/AppError");
exports.Addappointment = asyncHandler(async (req, res, next) => {
    const { appointment } = req.body
    const { refresValidatToken } = req
    if (!appointment) return next(new AppError('ورودی ها ناقص هستند.', 400))
    if (typeof appointment !== 'string') return next(new AppError('ورودی ها ناقص هستند.', 400))
    const parseAppointment = JSON.parse(appointment)
    if (!parseAppointment) return next(new AppError('ورودی ها ناقص هستند.', 400))
    if (typeof parseAppointment !== 'object') return next(new AppError('ورودی ها ناقص هستند.', 400))

    await Promise.all(
        parseAppointment.map(async (item) => {
            const [jy, jm, jd] = item.date.split("/").map(Number);
            const g = jalaali.toGregorian(jy, jm, jd);
            const expireAt = new Date(Date.UTC(
                g.gy,
                g.gm - 1,
                g.gd,
                20,
                0,
                0
            ));
            const delay = expireAt.getTime() - Date.now();
            console.log(delay)
            const doc = new Appointment({
                date: item.date,
                horse: item.hours,
                consultant: refresValidatToken
            });
            doc.save();
            return deleteQueue.add("delete-doc", { id: doc._id }, { delay });
        })
    );
    return res.status(201).json('ok')

})
exports.getAppointments = asyncHandler(async (req, res, next) => {
    const { refresValidatToken } = req
    const findDates = await Appointment.find({ consultant: refresValidatToken })
    res.status(200).json({ dates: findDates })
})
exports.getDataFromSingleConsultant = asyncHandler(async (req, res, next) => {
    // Is valid User?
    const { id } = req.params
    if (!id) return next(new AppError('ورودی ها ناقص هستند.', 400))
    const findDates = await Appointment.find({ consultant: id }).sort({ date: 1 })
    res.status(200).json({ dates: findDates })
})