const Consultant = require("../models/consultant")
const User = require("../models/user")
const { schemaProfileEdite } = require("../secureYup/validatinInps")

const jwt = require('jsonwebtoken')
const AppError = require("../utils/AppError")
const asyncHandler = require("../middlewares/asyncHandler")
const { redisClient } = require("../redis/redice")
const { default: axios } = require("axios")

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
    const key = `otp:${phoneNumber}`;
    const now = Date.now();

    const getData = await redisClient.get(key)

    if (getData) {
        const parsed = JSON.parse(getData);
        if (now - parsed.lastSentAt < 2 * 60 * 1000) {
            return next(new AppError('باید ۲ دقیقه صبر کنی', 429))
        }
    }

    // create Redis
    const expiresAt = now + 2 * 60 * 1000;
    await redisClient.set(
        key,
        JSON.stringify({
            expiresAt,
            lastSentAt: now,
            attempts: 0,
        }),
        {
            PX: 5 * 60 * 1000, // TTL
        }
    );
    // create Redis

    // Send code phone number
    const apiKey = process.env.APIKEY;
    const baseURL = "https://edge.ippanel.com/v1";
    try {
        await axios.post(
            `${baseURL}/api/send`,
            {
                code: process.env.PATERNCODE,
                recipient: phoneNumber,
                variables: { OTP: String(OTP) }
            },
            { headers: { Authorization: apiKey, "Content-Type": "application/json" } }
        );
    } catch (error) {
        return next(new AppError('عملیات ارسال رمز شکست خورد بعدا تلاش کنید', 430))
    }
    // Send code phone number
})

exports.vrifyOTP = asyncHandler(async (req, res, next) => {
    const { phoneNumber, codeOTP } = req.body
    const API_KEY = process.env.APIKEY;
    const PATTERN_CODE = process.env.PATERNCODE;
    try {
        await axios("https://edge.ippanel.com/v1/api/acl/auth/confirm_otp", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": API_KEY,
            },
            data: JSON.stringify({
                pattern_code: PATTERN_CODE,
                recipient: phoneNumber,
                values: { OTP: codeOTP },
            }),
        });
    } catch (error) {
        return next(new AppError('کد اشتباست', 430))
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
                secure: true, // فقط HTTPS
                sameSite: "strict", // محافظت در برابر CSRF
                // secure: false, // چون لوکال هستی و HTTPS نداری
                // sameSite: "lax", // برای تست لوکال ok هست
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
        secure: true, // فقط HTTPS
        sameSite: "strict", // محافظت در برابر CSRF
        // secure: false, // چون لوکال هستی و HTTPS نداری
        // sameSite: "lax", // برای تست لوکال ok هست
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
    return res.status(200).json({ user })
})
// exports.Register = async