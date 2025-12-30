const mongoose = require('mongoose')
const schema = mongoose.Schema
const schemarelatedExpertise = new schema({
    name: { type: String, required: true },
    nameLatin: { type: String, required: true },
    date: { type: Date, default: Date.now },
})
const RlatedExpertise = mongoose.model('relatedExpertise', schemarelatedExpertise)

module.exports = RlatedExpertise