
const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
    date: { type: String, require: false },
    horse: [String],
    // expireAt: {
    //     type: Date,
    //     required: true,
    //     expires: 0 ,
    // },
    consultant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'consultant'
    }
})

const Appointment = mongoose.model('appointment', appointmentSchema)

module.exports = Appointment