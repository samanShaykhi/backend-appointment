const Consultant = require("../models/consultant")
const User = require("../models/user")
const { schemaProfileEdite } = require("../secureYup/validatinInps")

const jwt = require('jsonwebtoken')
const AppError = require("../utils/AppError")
const asyncHandler = require("../middlewares/asyncHandler")
const { redisClient } = require("../redis/redice")
const axios = require('axios');

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
        const refreshToken = jwt.sign({ id: findUserFromPhoneNumber._id }, process.env.PASS_JWT, { expiresIn: "7d" });
        const accessToken = jwt.sign({ id: findUserFromPhoneNumber._id }, process.env.PASS_JWT, { expiresIn: "15m" });
        res.cookie("auth_token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({ token: accessToken, user: findUserFromPhoneNumber })
    }
    const findConsultantFromPhoneNumber = await Consultant.findOne({ phoneNumber })
    if (findConsultantFromPhoneNumber) {
        const refreshToken = jwt.sign({ id: findConsultantFromPhoneNumber._id }, process.env.PASS_JWT, { expiresIn: "7d" });
        const accessToken = jwt.sign({ id: findConsultantFromPhoneNumber._id }, process.env.PASS_JWT, { expiresIn: "15m" });
        res.cookie("auth_token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({ token, user: findConsultantFromPhoneNumber })
    }
    const createNewUser = await User.create({
        phoneNumber,
    })
    if (createNewUser) {
        const refreshToken = jwt.sign({ id: createNewUser._id }, process.env.PASS_JWT, { expiresIn: "7d" });
        const accessToken = jwt.sign({ id: createNewUser._id }, process.env.PASS_JWT, { expiresIn: "15m" });
        res.cookie("auth_token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
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


    // Send code phone number
    const apiKey = process.env.APIKEY;
    const OTP = String(Math.floor(100000 + Math.random() * 900000));
    try {
        await axios.post("https://edge.ippanel.com/v1/api/send",
            {
                sending_type: "pattern",
                from_number: "+983000505",
                code: process.env.PATERNCODE,
                recipients: [`+98${Number(phoneNumber)}`],
                params: { OTP }
            },
            { headers: { Authorization: apiKey, "Content-Type": "application/json" } }
        );

        // create Redis
        const expiresAt = now + 2 * 60 * 1000;
        await redisClient.set(
            key,
            JSON.stringify({
                OTP,
                expiresAt,
                lastSentAt: now,
                attempts: 0,
            }),
            {
                EX: 120, // TTL
            }
        );
        // create Redis
        return res.sendStatus(200)

    } catch (error) {
        console.log(error)
        return next(new AppError('عملیات ارسال رمز شکست خورد بعدا تلاش کنید', 430))
    }
    // Send code phone number
})

exports.vrifyOTP = asyncHandler(async (req, res, next) => {
    const { phoneNumber, codeOTP } = req.body
    // vrifyOTP
    const key = `otp:${phoneNumber}`;
    const data = await redisClient.get(key);
    if (!data) {
        return next(new AppError('کد منقضی شده', 400));
    }
    const parsed = JSON.parse(data);

    if (parsed.attempts >= 5) {
        return next(new AppError('تعداد تلاش بیش از حد', 429));
    }

    if (parsed.OTP !== codeOTP) {
        parsed.attempts += 1;
        await redisClient.set(key, JSON.stringify(parsed), { EX: 120 });
        return next(new AppError('کد اشتباه است', 403));
    }
    await redisClient.del(key);
    // vrifyOTP

    const AreTheyAnyUser = await User.findOne({ phoneNumber })
    if (AreTheyAnyUser) {
        const createUserFromToken = { id: AreTheyAnyUser._id }
        const refreshToken = jwt.sign(createUserFromToken, process.env.PASS_JWT, { expiresIn: "7d" });
        const accessToken = jwt.sign(createUserFromToken, process.env.PASS_JWT, { expiresIn: "15m" });
        res.cookie("auth_token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        return res.status(200).json({ accessToken, user: AreTheyAnyUser })
    }
    const findConsultantFromPhoneNumber = await Consultant.findOne({ phoneNumber })
    if (findConsultantFromPhoneNumber) {
        const createUserFromToken = { id: findConsultantFromPhoneNumber._id }
        const refreshToken = jwt.sign(createUserFromToken, process.env.PASS_JWT, { expiresIn: "7d" });
        const accessToken = jwt.sign(createUserFromToken, process.env.PASS_JWT, { expiresIn: "15m" });

        res.cookie("auth_token", refreshToken, {
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
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
            httpOnly: true,
            secure: true,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000,
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
                httpOnly: true,
                secure: true,
                sameSite: "strict",
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
        httpOnly: true,
        secure: true,
        sameSite: "strict",

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