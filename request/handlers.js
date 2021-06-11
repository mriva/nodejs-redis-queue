const jsonbody = require('../lib/jsonbody.js');
const predis = require('../lib/predis');
const config = require('../config.js');

module.exports = {
    handlePublish,
    handleConsume
}

function handlePublish(req, res, fallback) {
    jsonbody(req).then(body => {
        let message = {
            'timestamp': new Date(),
            'payload': body.payload
        }

        return predis.rpush(config.queue_prefix + req.params.queue, JSON.stringify(message));
    }).then(() => {
        res.statusCode = 201;
        sendJsonResponse(res, {'status': 'ok'});
    }).catch(err => {
        return fallback(err);
    });
}

function handleConsume(req, res, fallback) {
    predis.lpop(config.queue_prefix + req.params.queue).then(message => {
        res.statusCode = 200;
        sendJsonResponse(res, message ? JSON.parse(message) : null);
    }).catch(err => {
        return fallback(err);
    });
}

function sendJsonResponse(res, data) {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));
}
