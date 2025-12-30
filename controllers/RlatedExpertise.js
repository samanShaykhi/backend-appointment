const asyncHandler = require("../middlewares/asyncHandler");
const Consultant = require("../models/consultant");
const RlatedExpertise = require("../models/relatedExpertise");
const User = require("../models/user");
const jwt = require('jsonwebtoken');
const AppError = require("../utils/AppError");
exports.addRlatedExpertise = asyncHandler(async (req, res, next) => {
    const { refresValidatToken } = req

    const findUser = await User.findById(refresValidatToken)
    if (findUser.role !== 'admin') return next(new AppError('شما دسترستی ندارید.', 403))

    const { name, nameLatin } = req.body
    if (!name || !nameLatin) return next(new AppError('وردی ها ناقص هستند', 400))
    if (!name.length >= 3 || !nameLatin.length >= 3) return next(new AppError('وردی ها ناقص هستند', 400))
    const eductional = new RlatedExpertise({
        name,
        nameLatin
    })
    await eductional.save()
    res.status(201).json('ok')
})
exports.getRlatedExpertise = asyncHandler(async (req, res, next) => {
    const { refresValidatToken } = req

    const findUser = await User.findById(refresValidatToken)
    if (findUser.role !== 'admin') return next(new AppError('شما دسترستی ندارید.', 403))

    const fechData = await RlatedExpertise.find()

    res.status(200).json({ data: fechData })

})
exports.updateRlatedExpertise = asyncHandler(async (req, res,next) => {
    const id = req.params.id
    if (!id) return next(new AppError('همچین چیزی وجود ندارد', 404))
    const { refresValidatToken } = req

    const findUser = await User.findById(refresValidatToken)
    if (findUser.role !== 'admin') return next(new AppError('شما دسترستی ندارید.', 403))
    const { name } = req.body
    if (!name) return next(new AppError('وردی ها ناقص هستند', 400))
    if (!name.length >= 3) return next(new AppError('وردی ها ناقص هستند', 400))
    const fechData = await RlatedExpertise.findById(id)
    if (!fechData) return next(new AppError('وردی ها ناقص هستند', 400))
    fechData.name = name
    await fechData.save()
    res.status(200).json('ok')

})
exports.deleteRlatedExpertise = asyncHandler(async (req, res,next) => {
    const id = req.params.id
    if (!id) return next(new AppError('همچین چیزی وجود ندارد', 404))
    const { refresValidatToken } = req

    const findUser = await User.findById(refresValidatToken)
    if (findUser.role !== 'admin') return next(new AppError('شما دسترستی ندارید.', 403))

    RlatedExpertise.findByIdAndDelete(id)
    res.status(200).json('ok')

})
exports.getRlatedExpertiseSearchPage = asyncHandler(async (req, res,next) => {
    const fechData = await RlatedExpertise.find()
    res.status(200).json({ data: fechData })

})
exports.FilterFromSerchPage = asyncHandler(async (req, res,next) => {
        const { expertise, searchname, experience_desc } = req.body
        const query = {}
        // Sort
        let sortOption = { _id: -1 }
        if (experience_desc) {
            sortOption = { experience: -1 }
        }
        // Sort

        if (searchname) {
            const parts = searchname.trim().split(/\s+/)

            if (parts.length === 1) {
                query.$or = [
                    { firstName: new RegExp(parts[0], 'i') },
                    { lastName: new RegExp(parts[0], 'i') }
                ]
            } else {
                query.$and = [
                    { firstName: new RegExp(parts[0], 'i') },
                    { lastName: new RegExp(parts.slice(1).join(' '), 'i') }
                ]
            }
        }
        if (expertise?.length) {
            query['relatedCategories.nameLatin'] = { $all: expertise }
        }
        const getCunsltants = await Consultant.find(query).sort(sortOption)

        return res.status(200).json({ consultant: getCunsltants })


})