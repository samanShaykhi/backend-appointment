const mongoose = require('mongoose')

const ReservationSchema = new mongoose.Schema({
    date: { type: String, required: true },
    hourse: { type: String, required: true },
    userCreator: { type: Object , required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    consoltant: { type: mongoose.Schema.Types.ObjectId, required: true },
      expireAt: {
        type: Date,
        expires: 0, // یعنی خود تاریخ دقیق حذف‌کننده است
    },
})
ReservationSchema.index({ date: 1 }, { hourse: 1 }, { unique: true })
ReservationSchema.index({ user: 1 }, { consoltant: 1 })
const Reservation = mongoose.model('reservation', ReservationSchema)

module.exports = Reservation