const jsonbody = require('../lib/jsonbody.js');
const predis = require('../lib/predis');

exports.handlePublish = handlePublish;
exports.handleConsume = handleConsume;

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
