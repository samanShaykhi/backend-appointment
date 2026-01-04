// queue.js
const { Queue } = require("bullmq");

const connection = { path: process.env.REDIS_URL };


exports.deleteQueue = new Queue("delete-collection", { connection });
exports.deleteQueueReserv = new Queue("delete-collection-reserve", { connection });
