const asyncHandler = require("../middlewares/asyncHandler");
const Appointment = require("../models/appointment");
const Consultant = require("../models/consultant");
const Reservation = require("../models/reservation");
const User = require("../models/user");
const { validationConsultant } = require("../secureYup/validatinInps");
const mongoose = require('mongoose');
const AppError = require("../utils/AppError");
const path = require('path')
const fs = require('fs');
exports.addConsultant = asyncHandler(async (req, res, next) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    education,
    relatedCategories,
    experience,
    psychologicalSystemNumber,
    AboutMe,
    amount
  } = req.body

  if (!req.files.image) return next(new AppError('عکس مشاور اجباری است', 400))
  if (!req.files.video) return next(new AppError('ویدیو مشاور اجباری است', 400))
  let getNameImage
  let getNameVideo
  if (req.files.image[0]) getNameImage = req.files.image[0].filename
  if (req.files.video[0]) getNameVideo = req.files.video[0].filename

  try {
    await validationConsultant.validate(req.body, { abortEarly: false })

  } catch (error) {
    const rootPath = path.resolve("./");
    const imagesDir = path.join(rootPath);
    if (req.files.image[0]) {
      fs.unlink(`${imagesDir}/public/consultant/images/${req.files.image[0]}`, (err) => {
        if (err) {
          return next(new AppError('حذف تصویر با خطا مواجع شد.', 400))
        }
      });
    }
    if (req.files.video[0]) {
      fs.unlink(`${imagesDir}/public/consultant/video/${req.files.video[0]}`, (err) => {
        if (err) {
          return next(new AppError('حذف ویدئو با خطا مواجع شد.', 400))
        }
      });
    }
    return next(new AppError(error.errors, 301))
  }

  // parse relatedCategories
  let parsRelatedCategories
  if (relatedCategories) parsRelatedCategories = JSON.parse(relatedCategories)
  // parse relatedCategories

  const haseAConsultant = await Consultant.findOne({ phoneNumber })
  const haseAUser = await User.findOne({ phoneNumber })
  if (haseAUser) return next(new AppError('این شماره تلفن قبلا به عنوان کاربر ثبت نام شده.', 409))
  if (haseAConsultant) return next(new AppError('این شماره تلفن قبلا ثبت نام شده.', 409))

  await Consultant.create({
    firstName,
    lastName,
    phoneNumber,
    image: getNameImage,
    video: getNameVideo,
    education,
    relatedCategories: parsRelatedCategories,
    experience,
    AboutMe,
    amount,
  })
  return res.status(201).json({ message: 'مشاور اضافه شد' })
})


exports.getDataFromSingleConsultant = asyncHandler(async (req, res, next) => {
  const { id } = req.params
  if (!id) return next(new AppError('صفحه پیدا نشد', 404))

  if (!mongoose.Types.ObjectId.isValid(id)) return next(new AppError('صفحه پیدا نشد', 404))
  const findDates = await Appointment.find({ consultant: id })
  const reservtions = await Reservation.find({ consoltant: id })
  const findConsultant = await Consultant.findById(id)
  if (!findConsultant) return next(new AppError('چیزی وجود نذارد', 404))
  res.status(200).json({ reservtions, dates: findDates, consultant: findConsultant })

})
exports.getConsultantPageCenter = asyncHandler(async (req, res, next) => {
  const consultant = await Consultant.find().limit(4).sort({ _id: -1 })
  res.status(200).json({ consultant })
})
exports.getConsultant = asyncHandler(async (req, res, next) => {
  const consultant = await Consultant.find().limit(12).sort({ _id: -1 })
  res.status(200).json({ consultant })
})
