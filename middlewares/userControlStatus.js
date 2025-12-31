const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
    if (!req.cookies) return res.sendStatus(200)
    const refreshToken = req.cookies.auth_token;
    if (!refreshToken) return res.sendStatus(200)

    try {
        const refresValidatToken = jwt.verify(refreshToken, process.env.PASS_JWT)
        if (!refresValidatToken.id) return res.sendStatus(200)
        req.refresValidatToken = refresValidatToken.id
        next()
    } catch (error) {
        res.clearCookie("auth_token", {
            httpOnly: true, // 🚫 قابل دسترسی از جاوااسکریپت نیست
            secure: true, // فقط HTTPS
            sameSite: "strict", // محافظت در برابر CSRF
            // secure: false, // چون لوکال هستی و HTTPS نداری
            // sameSite: "lax", // برای تست لوکال ok هست
        });
        return res.sendStatus(200)
    }

}