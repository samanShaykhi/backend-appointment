const jwt = require('jsonwebtoken')
const AppError = require("../utils/AppError");
const User = require('../models/user')
module.exports = async (req, res, next) => {
    if (!req.cookies) return next(new AppError('ورود شما منقضی شده', 401))
    const refreshToken = req.cookies.auth_token;
    if (!refreshToken) return next(new AppError('ورود شما منقضی شده', 401))

    try {
        const refresValidatToken = jwt.verify(refreshToken, process.env.PASS_JWT)
        if (!refresValidatToken.id) return next(new AppError('ورود شما منقضی شده', 401))
        const findUser = await User.findById(refresValidatToken.id)
        if (!findUser) return next(new AppError('موردی یاغت نشد.', 404))
        if (findUser.role !== 'admin') return next(new AppError('شما دسترستی ندارید.', 403))
        req.user = findUser

        next()
    } catch (error) {
        res.clearCookie("auth_token", {
            httpOnly: true, // 🚫 قابل دسترسی از جاوااسکریپت نیست
            // secure: process.env.NODE_ENV === "production", // فقط HTTPS
            // sameSite: "strict", // محافظت در برابر CSRF
            secure: false, // چون لوکال هستی و HTTPS نداری
            sameSite: "lax", // برای تست لوکال ok هست
        });
        return next(new AppError('ورود شما منقضی شده', 401))
    }

}