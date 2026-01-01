const path = require('path')
const fs = require('fs');
const { ValidationInpArtEdite } = require('../secureYup/validatinInps');
const Article = require('../models/article');
const asyncHandler = require("../middlewares/asyncHandler");

exports.ArtAdd = asyncHandler(async (req, res, next) => {
    const { articleTitle, metaDiscription, body } = req.body

    try {
        await ValidationInpArtEdite.validate({ articleTitle, metaDiscription, body }, { abortEarly: false })
    } catch (error) {
        if (req.file) {
            const rootPath = path.resolve("./");
            const imagesDir = path.join(rootPath);
            fs.unlink(`${imagesDir}/public/uploads/images/article/thumbnail/${req.file.filename}`, (err) => {
                if (err) {
                    return next(new AppError('حذف تصویر با خطا مواجع شد.', 400))
                }
            });
        }
        return next(new AppError({ errors: error.errors }, 301))
    }

    await Article.create({
        body,
        articleTitle,
        thumbnail: `public/uploads/images/article/thumbnail/${req.file.filename}`,
        metaDiscription
    })
    return res.status(201).json('create article')

})

exports.uploadGallery = asyncHandler(async (req, res, next) => {
    return res.status(200).json('فایل آپلود شد');
})

exports.getImages = asyncHandler(async (req, res, next) => {
    const rootPath = path.resolve("./");
    const imagesDir = path.join(rootPath, "public", 'uploads', "images","article");
    fs.readdir(imagesDir, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "خطا در خواندن فولدر" });
        }
        return res.status(200).json({ images: files.reverse() });
    });
})

exports.ArticlesGet = asyncHandler(async (req, res, next) => {
    const getData = await Article.find().sort({ date: -1 })
    res.status(200).json({ articles: getData })
})

exports.ArticleEdite = asyncHandler(async (req, res, next) => {
    const paramsId = req.params.id
    const { articleTitle, metaDiscription, body } = req.body

    try {
        await ValidationInpArtEdite.validate({ articleTitle, metaDiscription, body }, { abortEarly: false })
    } catch (error) {
        if (req.file) {
            const rootPath = path.resolve("./");
            const imagesDir = path.join(rootPath);
            fs.unlink(`${imagesDir}/public/uploads/images/article/thumbnail/${req.file.filename}`, (err) => {
                if (err) {
                    return next(new AppError('حذف تصویر با خطا مواجع شد.', 400))
                }
            });
        }
        return next(new AppError({ errors: error.errors }, 301))
    }

    const getArticle = await Article.findById(paramsId)
    getArticle.articleTitle = req.body.articleTitle
    getArticle.metaDiscription = req.body.metaDiscription
    if (req.file) {
        const rootPath = path.resolve("./");
        const imagesDir = path.join(rootPath, getArticle.thumbnail);
        if (req.file.filename) {
            fs.unlink(imagesDir, (err) => {
                return next(new AppError('حذف تصویر با خطا مواجع شد.', 400))
            });
        }
    }
    getArticle.thumbnail = `public/uploads/images/article/thumbnail/${req.file.filename}`
    getArticle.body = req.body.body
    await getArticle.save()
    res.status(200).json('Edite Article')
})

exports.ArticleFromPageCenter = asyncHandler(async (req, res, next) => {
    const getData = await Article.find().limit(4).sort({ date: -1 })
    return res.status(200).json({ articles: getData })
})

exports.ArticleSingePage = asyncHandler(async (req, res, next) => {
    let GetParamsTitel = req.params.title

    if (!GetParamsTitel) return next(new AppError('موردی یافت نشد.', 404))

    if (GetParamsTitel) GetParamsTitel = GetParamsTitel.trim().replace(/-+/g, " ");
    const getData = await Article.findOne({ articleTitle: GetParamsTitel })
    if (!getData) return next(new AppError('موردی یافت نشد.', 404))
    res.status(200).json({ article: getData })
})
exports.ArticlesAll = asyncHandler(async (req, res, next) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1)
    const limit = Math.min(parseInt(req.query.limit) || 10, 100)
    const skip = (page - 1) * limit
    const [article, totalCount] = await Promise.all([
        Article.find().skip(skip).limit(limit),
        Article.countDocuments()
    ])
    return res.status(200).json({
        articles: article,
        pagination: {
            page,
            limit,
            totalCount,
            totalPages: Math.ceil(totalCount / limit)
        }
    })
})