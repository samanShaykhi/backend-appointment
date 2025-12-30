
const mongoose = require("mongoose");
const reservationSchema = new mongoose.Schema({
    consultant: { type: mongoose.Schema.Types.ObjectId, ref: "Consultant", required: false },
    appointment: {
        date: { type: String, required: false },
        hours: { type: String, required: false }
    }
});
const userSchema = new mongoose.Schema({
    firstName: { type: String, required: false },
    lastName: { type: String, required: false },
    email: { type: String, required: false },
    phoneNumber: { type: String, required: true },
    reservations: {
        type: [reservationSchema],
        default: undefined
    },
    role: { type: String, default: 'user' },
})

const User = mongoose.model('user', userSchema)

module.exports = User