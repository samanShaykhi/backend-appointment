const { createClient } = require("redis")

const client = createClient()
client.on('error', error => console.log(`error redis: ${error}`))
const conectRedis = async () => {
    if (!client.isOpen) {
        await client.connect();
        console.log('✅ Connected to Redis');

    }
}
module.exports = { client, conectRedis }

