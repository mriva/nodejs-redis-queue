const { promisify } = require('util');
const redis = require('redis');

const redisClient = redis.createClient();

module.exports = {
    rpush: promisify(redisClient.rpush).bind(redisClient),
    lpop: promisify(redisClient.lpop).bind(redisClient)
}
