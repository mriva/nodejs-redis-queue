const http = require('http');
const redis = require('redis');
const Router = require('router');
const { promisify } = require('util');
const fs = require('fs');
const yaml = require('js-yaml');
const jsonbody = require('./jsonbody.js');

const config = yaml.load(fs.readFileSync('./config.yml', 'utf8'));

const hostname = config.server_hostname;
const port = config.server_port;
const redisClient = redis.createClient();
const predis = {
    'rpush': promisify(redisClient.rpush).bind(redisClient),
    'lpop': promisify(redisClient.lpop).bind(redisClient)
}

const router = Router();

router.post('/publish/:queue', handlePublish);
router.get('/consume/:queue', handleConsume);

function handlePublish(req, res, fallback) {
    jsonbody(req).then(body => {
        let message = {
            'timestamp': new Date(),
            'payload': body.payload
        }

        return predis.rpush('queue_' + req.params.queue, JSON.stringify(message));
    }).then(() => {
        sendJsonResponse(res, {'status': 'ok'});
    }).catch(err => {
        return fallback(err);
    });
}

function handleConsume(req, res, fallback) {
    predis.lpop('queue_' + req.params.queue).then(message => {
        sendJsonResponse(res, message ? JSON.parse(message) : null);
    }).catch(err => {
        return fallback(err);
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
            res.end(JSON.stringify({'status': 'error', 'message': err.message}));
        }
    }
}

const server = http.createServer((req, res) => {
    router(req, res, fallback(req, res));
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

