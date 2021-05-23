const http = require('http');
const redis = require('redis');
const Router = require('router');
const jsonbody = require('./jsonbody.js');
const { promisify } = require("util");

const hostname = '127.0.0.1';
const port = 3030;
const redisClient = redis.createClient();
const predis = {
    'rpush': promisify(redisClient.rpush).bind(redisClient),
    'lpop': promisify(redisClient.lpop).bind(redisClient)
}

let router = Router();

router.post('/publish', handlePublish);
router.get('/consume', handleConsume);

function handlePublish(req, res, fallback) {
    jsonbody(req).then(body => {
        predis.rpush('base_queue', JSON.stringify(body)).then(() => {
            sendJsonResponse(res, {'status': 'ok'});
        });
    }).catch(err => {
        return fallback(err.message);
    });
}

function handleConsume(req, res, fallback) {
    predis.lpop('base_queue').then(message => {
        sendJsonResponse(res, message ? JSON.parse(message) : null);
    }).catch(err => {
        console.log(err);
        return fallback(err.message);
    });
}

function sendJsonResponse(res, data) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
}

function fallback(req, res) {
    return err => {
        res.setHeader('Content-Type', 'application/json');

        if (!err) {
            res.statusCode = 404;
            res.end(JSON.stringify({'status': 'invalid URL'}));
        } else {
            res.statusCode = 500;
            res.end(JSON.stringify({'status': 'error', 'message': err}));
        }
    }
}

const server = http.createServer((req, res) => {
    router(req, res, fallback(req, res));
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

