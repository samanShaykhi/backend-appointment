const { createClient } = require("redis")
const client = createClient({
    socket: {
        path: process.env.REDIS_URL
    }

})
client.on('error', error => console.log(`error redis: ${error}`))
const conectRedis = async () => {
    if (!client.isOpen) {
        await client.connect();
        console.log('✅ Connected to Redis');

    }
}
module.exports = { redisClient: client, conectRedis }

