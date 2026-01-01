const express = require('express')
const conectToMongose = require('./config/db')
const appRoot = require('app-root-path')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')
//*get custom Route
const routerUser = require('./routers/routeUser')
const routerConsultant = require('./routers/routeConsultant')
const routeAppointment = require('./routers/routeAppointment')
const routeReservation = require('./routers/routeReservation')
const rlatedexpertise = require('./routers/RlatedExpertise')
const routerNotification = require('./routers/RouterNot')
const routerComment = require('./routers/routerComment')
const routerArticle = require('./routers/routerArticle')
const logger = require('./utils/logger')
const { conectRedis } = require('./redis/redice')
const errorHandler = require('./middlewares/errorHandler')
const AppError = require('./utils/AppError')
//* 

const app = express()
// Handeler Erorr cors
// conect Mongodb 
conectToMongose()
// conect Mongodb

// aplication JSON
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use('/public', express.static(`${appRoot.path}/public`))
// End aplication JSON
//* Cookie Parser
app.use(cookieParser())
//* Cookie Parser
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', '*')
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization')
//     res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE')
//     next()
// })

app.use(cors({
    origin: "https://nivato.ir",
    credentials: true,
}))

//* custom router
app.use('/user', routerUser)
app.use('/consultant', routerConsultant)
app.use('/appointment', routeAppointment)
app.use('/reservation', routeReservation)
app.use('/rlatedexpertise', rlatedexpertise)
app.use('/not', routerNotification)
app.use('/comment', routerComment)
app.use('/article', routerArticle)
//* custom router 

app.all('*', (req, res, next) => {
    next(new AppError(`مسیر ${req.originalUrl} پیدا نشد`, 404))
})

app.use(errorHandler)




app.listen(process.env.PORT, (err) => {
    // conectRedis() 
    console.log(`conect to port::${process.env.PORT}  `)
})
//* End Handeler Erorr cors  

// global errors
process.on('unhandledRejection', err => {
    logger.error('UNHANDLED REJECTION', err)
    server.close(() => process.exit(1))
})