// queue.js
const { Queue } = require("bullmq");

const connection = { path: '/home/nivatoir/redis/redis.sock' };

exports.deleteQueue = new Queue("delete-collection", { connection });
exports.deleteQueueReserv = new Queue("delete-collection-reserve", { connection });
