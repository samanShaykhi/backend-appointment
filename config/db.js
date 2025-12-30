const mongogose = require('mongoose')

const conectToMongose = async () => {
    try {
        const dbConect = await mongogose.connect(process.env.MONGO_CONECTION)
        console.log(`conect to mongodb :: ${dbConect.connection.host}`)
    } catch (error) {
    }
}
module.exports = conectToMongose