const jwt = require('jsonwebtoken')
const Reservation = require("../models/reservation");
const Consultant = require('../models/consultant');
const jalaali = require('jalaali-js');
const User = require('../models/user');
const Notification = require('../models/notification');
const { deleteQueueReserv } = require('../redis/queue');
const asyncHandler = require('../middlewares/asyncHandler');
const AppError = require('../utils/AppError');
exports.AddReservation = asyncHandler(async (req, res, next) => {
    const { date, hourse, consoltant, firstName, lastName } = req.body
    const { refresValidatToken } = req

    if (!hourse || !date || !consoltant || typeof date !== "string") return next(new AppError('ورودی ها ناقص هستند.', 400))
    let userCreator

    userCreator = await User.findById(refresValidatToken)
    // if (!findUser) return res.status(400).json({ message: 'درخواست نا معتبر' })
    if (!userCreator) {
        userCreator = await Consultant.findById(refresValidatToken)
    }
    if (!userCreator) return next(new AppError('موردی یافت نشد.', 404))
    const findConsultant = await Consultant.findById(consoltant)
    if (!findConsultant) return next(new AppError('موردی یافت نشد.', 404))
    // Expiret Colection

    let createFirstName = userCreator.firstName
    let createLastName = userCreator.lastName
    if (!createFirstName) createFirstName = firstName
    if (!createLastName) createLastName = lastName



    const [jy, jm, jd] = date.split("/").map(Number);
    const [hh, mm] = hourse.split(":").map(Number);
    const g = jalaali.toGregorian(jy, jm, jd);
    const expireAt = new Date(Date.UTC(
        g.gy,
        g.gm - 1,
        g.gd,
        hh - 3,
        mm - 30,
        0
    ));
    const delay = expireAt.getTime() - Date.now();
    // Expiret Colection
    let createReservation
    try {
        createReservation = await Reservation.create({
            date,
            hourse,
            userCreator: { firstName: createFirstName, lastName: createLastName },
            user: userCreator._id,
            consoltant: findConsultant._id,
            expireAt
        })

    } catch (error) {
        return next(new AppError('این نوبت قبلا رزرو شد.', 301))
    }
    await deleteQueueReserv.add("delete-docreserv", { id: createReservation._id }, { delay });
    // Not From Consultant
    await Notification.create({
        text: ` یک نوبت توسط ${createFirstName} ${createLastName} در  تاریخ ${date} و ساعت ${hourse} رزرو شد.`,
        user: findConsultant._id,
    })
    // Not From Consultant
    if (firstName && lastName) {
        userCreator.firstName = firstName
        userCreator.lastName = lastName
        await userCreator.save()
        return res.status(201).json({ user: userCreator })
    }
    return res.status(201).json('ok')

})
exports.getReservationFromSingle = asyncHandler(async (req, res, next) => {
    const getCosultantId = req.params.consultantid
    if (!getCosultantId) return next(new AppError('چنین صفحه های وجود نذارد', 404))
    const getReservations = await Reservation.find({ consoltant: getCosultantId })
    return res.status(200).json({ reservations: getReservations })
})
exports.getReserveationsFromConsultant = asyncHandler(async (req, res, next) => {
    const { refresValidatToken } = req
    const getReservations = await Reservation.find({ consoltant: refresValidatToken }).lean()
    let UsersReserv = [...getReservations]
    if (getReservations.length > 0) {
        await Promise.all(
            getReservations.map(async (item, index) => {
                const findUser = await User.findById(item.user)
                if (findUser) UsersReserv[index].user = findUser
            })
        );
    }
    res.status(200).json({ reservations: UsersReserv, })
})
exports.getReserveationsUser = asyncHandler(async (req, res, next) => {
    const { refresValidatToken } = req
    const getReservations = await Reservation.find({ user: refresValidatToken }).lean()
    let UsersReserv = [...getReservations]
    if (getReservations.length > 0) {
        await Promise.all(
            getReservations.map(async (item, index) => {
                const findConsultant = await Consultant.findById(item.consoltant)
                if (findConsultant) UsersReserv[index].consoltant = findConsultant
            })
        );
    }
    res.status(200).json({ resrvesMe: UsersReserv, })

})