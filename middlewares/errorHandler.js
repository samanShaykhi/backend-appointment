// middlewares/errorHandler.js
const AppError = require('../utils/AppError')
const logger = require('../utils/logger')

module.exports = (err, req, res, next) => {
    console.log(err)
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'error'

    // Erors Mongoose
    if (err.name === 'CastError') {
        err = new AppError('آیدی نامعتبر است', 503)
    }

    if (err.code === 11000) {
        err = new AppError('داده تکراری است', 503)
    }

    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message)
        err = new AppError(messages.join(' | '), 503)
    }

    // Production vs Development
    if (process.env.NODE_ENV !== 'development') {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message,
            stack: err.stack,
            error: err
        })
    } else {
        if (err.isOperational) {
            res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        } else {
            logger.error({
                message: err.message,
                stack: err.stack,
                route: req.originalUrl,
                method: req.method
            })
            console.error('💥 ERROR:', err)
            res.status(500).json({
                status: 'error',
                message: 'مشکلی در سرور رخ داده است'
            })
        }
    }
}
