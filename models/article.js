const mongoose = require('mongoose')

const schemaArticle = new mongoose.Schema({
    articleTitle:{type:String,require:true},
    thumbnail:{type:String,require:true},
    metaDiscription:{type:String,require:true},
    body:{type:String,require:true},
    date:{type:Date,default:Date.now}
})
const Article = mongoose.model('Article',schemaArticle)

module.exports = Article