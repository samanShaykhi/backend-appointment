const express = require('express')
const { ArtAdd, uploadGallery, getImages, ArticlesGet, ArticleEdite, ArticleFromPageCenter, ArticleSingePage, ArticlesAll } = require('../controllers/article')
const imgUloadGallery = require('../middlewares/imageUploder/imgUloadGallery')
const { ImgArtUploadEdite, ImgArtUpload } = require('../middlewares/imageUploder')
const AdminControll = require('../middlewares/AdminControll')
const app = express()

app.post('/artadd', AdminControll, ImgArtUpload('thumbnail'), ArtAdd)
app.post('/uploadimggallery', AdminControll, imgUloadGallery('image'), uploadGallery)
app.get('/getimages', AdminControll, getImages)
app.get('/articlesget', ArticlesGet)
app.put('/articleedite/:id', AdminControll, ImgArtUploadEdite('thumbnail'), ArticleEdite)
app.get('/articlefrompagecenter', ArticleFromPageCenter)
app.get('/articlesinglepage/:title', ArticleSingePage)
app.get('/getallarticles', ArticlesAll)


module.exports = app