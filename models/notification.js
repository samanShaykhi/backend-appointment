const mongoose = require('mongoose')
const schema = mongoose.Schema
const schemaNotification = new schema({
    text: { type: String, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, required: true },
    reading: { type: Boolean, default: false },
    link: { type: String,},

    date: { type: Date, default: Date.now },
})
const Notification = mongoose.model('notifications', schemaNotification)
schemaNotification.index({ user: 1 })
module.exports = Notification