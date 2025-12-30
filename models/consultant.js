const mongoose = require('mongoose')

const consultantSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    image: { type: String, required: true },
    education: { type: String, required: true }, // تحصیلات
    relatedCategories: [{ name: { type: String }, nameLatin: { type: String } }],
    star: [Number],
    numberOfClients: { type: Number, required: false },
    experience: { type: String, required: true },
    psychologicalSystemNumber: { type: String, required: true, default: '۱۹۶۷۰۰۷' }, // شماره نظام روانشاسی
    comments: [{ date: Date, opinion: String, numberOfStars: Number, fullName: String, sessionNumber: String }],
    video: { type: String, required: true },
    email: { type: String, required: false },
    AboutMe: { type: String, required: true },
    // رفتار صمیمانه و دلنشین1
    // 2همراهی و همدلی
    // 3 دو طرفه بودن فضای گفت و گو
    strengths: [{ sincereAndPleasantBehavior: { type: Number } }, { companionshipAndEmpathy: { type: Number } }, { TwoWayDialogueSpace: { type: Number } }],
    role: { type: String, default: 'consultant' },
    amount: { type: String, required: false },
    score: { type: String },
    numberClients: { type: Number },
    turns: [{ date: { type: Date } }]
})
consultantSchema.index({ phoneNumber: 1 })
consultantSchema.index({ "relatedCategories.nameLatin": 1 })
consultantSchema.index({ firstName: 1 })
consultantSchema.index({ lastName: 1 })
consultantSchema.index({ experience: 1 })
const Consultant = mongoose.model('consultant', consultantSchema)

module.exports = Consultant