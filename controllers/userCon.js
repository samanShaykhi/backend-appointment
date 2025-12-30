const Consultant = require("../models/consultant")
const User = require("../models/user")
const { schemaProfileEdite } = require("../secureYup/validatinInps")

const jwt = require('jsonwebtoken')
const AppError = require("../utils/AppError")
const asyncHandler = require("../middlewares/asyncHandler")

exports.loginUser = asyncHandler(async (req, res, next) => {
    const {
        phoneNumber,
    } = req.body
    try {
        await schemaProfileEdite.validate({ phoneNumber }, { abortEarly: false })
    } catch (error) {
        return next(new AppError({ errors: error.errors }, 301))
    }
    const findUserFromPhoneNumber = await User.findOne({ phoneNumber })
    if (findUserFromPhoneNumber) {
        const token = jwt.sign({ userId: findUserFromPhoneNumber._id }, process.env.PASS_JWT, {
            expiresIn: "60d",
        });
        return res.status(200).json({ token, user: findUserFromPhoneNumber })
    }
    const findConsultantFromPhoneNumber = await Consultant.findOne({ phoneNumber })
    if (findConsultantFromPhoneNumber) {
        const token = jwt.sign({ userId: findConsultantFromPhoneNumber._id }, process.env.PASS_JWT, {
            expiresIn: "60d",
        });
        return res.status(200).json({ token, user: findConsultantFromPhoneNumber })
    }
    const createNewUser = await User.create({
        phoneNumber,
    })
    if (createNewUser) {
        const token = jwt.sign({ userId: createNewUser._id }, process.env.PASS_JWT, {
            expiresIn: "60d",
        });
        return res.status(200).json({ token, user: createNewUser })
    }

})

exports.SinIn = asyncHandler(async (req, res, next) => {
    const { phoneNumber } = req.body
    try {
        await schemaProfileEdite.validate({ phoneNumber }, { abortEarly: false })
    } catch (error) {
        return next(new AppError({ errors: error.errors }, 301))
    }
    const AreTheyAnyUser = await User.findOne({ phoneNumber })
    if (AreTheyAnyUser) {
        const createUserFromToken = { id: AreTheyAnyUser._id }
        const refreshToken = jwt.sign(createUserFromToken, process.env.PASS_JWT, { expiresIn: "7d" });
        const accessToken = jwt.sign(createUserFromToken, process.env.PASS_JWT, { expiresIn: "15m" });
        res.cookie("auth_token", refreshToken, {
            httpOnly: true, // 🚫 قابل دسترسی از جاوااسکریپت نیست
            // secure: process.env.NODE_ENV === "production", // فقط HTTPS
            // sameSite: "strict", // محافظت در برابر CSRF
            secure: false, // چون لوکال هستی و HTTPS نداری
            sameSite: "lax", // برای تست لوکال ok هست
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 روز
        });
        return res.status(200).json({ accessToken, user: AreTheyAnyUser })
    }
    const findConsultantFromPhoneNumber = await Consultant.findOne({ phoneNumber })
    if (findConsultantFromPhoneNumber) {
        const createUserFromToken = { id: findConsultantFromPhoneNumber._id }
        const refreshToken = jwt.sign(createUserFromToken, process.env.PASS_JWT, { expiresIn: "7d" });
        const accessToken = jwt.sign(createUserFromToken, process.env.PASS_JWT, { expiresIn: "15m" });

        res.cookie("auth_token", refreshToken, {
            httpOnly: true, // 🚫 قابل دسترسی از جاوااسکریپت نیست
            // secure: process.env.NODE_ENV === "production", // فقط HTTPS
            // sameSite: "strict", // محافظت در برابر CSRF
            secure: false, // چون لوکال هستی و HTTPS نداری
            sameSite: "lax", // برای تست لوکال ok هست
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 روز
        });
        return res.status(200).json({ accessToken, user: findConsultantFromPhoneNumber })
    }
    if (!AreTheyAnyUser && !findConsultantFromPhoneNumber) {
        const UserCreate = new User({
            phoneNumber
        })
        await UserCreate.save()
        const createUserFromToken = { id: UserCreate._id }
        const refreshToken = jwt.sign(createUserFromToken, process.env.PASS_JWT, { expiresIn: "7d" });
        const accessToken = jwt.sign(createUserFromToken, process.env.PASS_JWT, { expiresIn: "15m" });
        res.cookie("auth_token", refreshToken, {
            httpOnly: true, // 🚫 قابل دسترسی از جاوااسکریپت نیست
            // secure: process.env.NODE_ENV === "production", // فقط HTTPS
            // sameSite: "strict", // محافظت در برابر CSRF
            secure: false, // چون لوکال هستی و HTTPS نداری
            sameSite: "lax", // برای تست لوکال ok هست
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 روز
        });
        return res.status(200).json({ accessToken, user: UserCreate })
    }
})
exports.RefreshToken = asyncHandler(async (req, res, next) => {
    try {
        if (!req.cookies) return res.sendStatus(200)
        const refreshToken = req.cookies.auth_token;
        if (!refreshToken) return res.sendStatus(200)
        const refresValidatToken = jwt.verify(refreshToken, process.env.PASS_JWT)
        const accessToken = jwt.sign({ id: refresValidatToken.id }, process.env.PASS_JWT, { expiresIn: "15m" });
        return res.status(200).json({ accessToken })
    } catch (error) {
        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
            res.clearCookie("auth_token", {
                httpOnly: true, // 🚫 قابل دسترسی از جاوااسکریپت نیست
                // secure: process.env.NODE_ENV === "production", // فقط HTTPS
                // sameSite: "strict", // محافظت در برابر CSRF
                secure: false, // چون لوکال هستی و HTTPS نداری
                sameSite: "lax", // برای تست لوکال ok هست
            });
            return res.sendStatus(200);
        }
        return next(new AppError('مشکلی در سرور رخ داده', 500))
    }
})
exports.RefreshGetUser = asyncHandler(async (req, res, next) => {
    const { refresValidatToken } = req
    let user
    user = await Consultant.findById(refresValidatToken)
    if (!user) user = await User.findById(refresValidatToken)
    if (!user) return next(new AppError('همچین چیزی وجود ندارد', 404))

    return res.status(200).json({ curentUser: user })

})
exports.logout = asyncHandler(async (req, res, next) => {

    res.clearCookie("auth_token", {
        httpOnly: true, // 🚫 قابل دسترسی از جاوااسکریپت نیست
        // secure: process.env.NODE_ENV === "production", // فقط HTTPS
        // sameSite: "strict", // محافظت در برابر CSRF
        secure: false, // چون لوکال هستی و HTTPS نداری
        sameSite: "lax", // برای تست لوکال ok هست
    });
    return res.sendStatus(200)

})
exports.updateUser = asyncHandler(async (req, res, next) => {
    const { firstName, lastName, email, role } = req.body

    const { refresValidatToken } = req

    let user

    if (role === "user" || role === "admin") {
        user = await User.findByIdAndUpdate(refresValidatToken,
            {
                $set: {
                    firstName,
                    lastName,
                    email
                }
            },
            {
                runValidators: false
            }

        )
    }
    if (role === "consultant") {
        user = await Consultant.findByIdAndUpdate(refresValidatToken,
            {
                $set: {
                    firstName,
                    lastName,
                    email
                }
            },
            {
                runValidators: false
            }
        )
    }
    if (!user) return next(new AppError('همچین چیزی وجود ندارد', 404))
    user.firstName = firstName
    user.lastName = lastName
    user.email = email
    await user.save()
    return res.status(200).json({user})
})
// exports.Register = async