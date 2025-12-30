const jwt = require('jsonwebtoken')
const AppError = require("../utils/AppError");

module.exports = (req, res, next) => {
    if (!req.cookies) return next(new AppError('لطفا وارد شوید.', 401))
    const refreshToken = req.cookies.auth_token;
    if (!refreshToken) return next(new AppError('لطفا وارد شوید.', 401))

    try {
        const refresValidatToken = jwt.verify(refreshToken, process.env.PASS_JWT)
        if (!refresValidatToken.id) return next(new AppError('ورود شما منقضی شده', 401))
        req.refresValidatToken = refresValidatToken.id
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