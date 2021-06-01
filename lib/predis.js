const { promisify } = require('util');
const redis = require('redis');

const redisClient = redis.createClient();

exports.rpush = promisify(redisClient.rpush).bind(redisClient);
exports.lpop = promisify(redisClient.lpop).bind(redisClient);
