const mongoose = require('mongoose')
const schema = mongoose.Schema
const schemaComment = new schema({
    textBody: { type: String, },
    creatorId: { type: mongoose.Schema.Types.ObjectId, required: true },
    creator: { type: Object, required: true },
    consultant: { type: Object, required: true },
    consultantId: { type: mongoose.Schema.Types.ObjectId, required: true },
    status: { type: Boolean, },
    sendUser: { type: Boolean, default: false },
    score: { type: String, },
    date: { type: Date },
    meeting: { type: Number }
})
schemaComment.index({ creatorId: 1 })
const Comment = mongoose.model('comment', schemaComment)
module.exports = Comment