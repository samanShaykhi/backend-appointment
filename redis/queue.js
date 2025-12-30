// queue.js
const { Queue } = require("bullmq");

const connection = { host: "127.0.0.1", port: 6379 };

exports.deleteQueue = new Queue("delete-collection", { connection });
exports.deleteQueueReserv = new Queue("delete-collection-reserve", { connection });
