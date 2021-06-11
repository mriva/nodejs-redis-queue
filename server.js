const http = require('http');
const Router = require('router');
const moment = require('moment');
const { handlePublish, handleConsume } = require('./request/handlers');
const config = require('./config.js');

const router = Router();

router.post('/publish/:queue', handlePublish);
router.get('/consume/:queue', handleConsume);

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

function logRequest(req, res) {
    res.on('finish', () => {
        let timestamp = moment().format('YYYY-MM-DDTHH:mm:ss.SSSZZ');
        console.log(`[${timestamp}] ${req.socket.remoteAddress} ${req.method} ${req.url} ${res.statusCode}`);
    });
}

const server = http.createServer((req, res) => {
    router(req, res, fallback(req, res));
    logRequest(req, res);
});

server.listen(config.server_port, config.server_hostname, () => {
    console.log(`Server running at http://${config.server_hostname}:${config.server_port}/`);
});
