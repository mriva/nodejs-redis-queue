const http = require('http');
const jsonbody = require('./lib/jsonbody.js');

let options = {
    host: 'localhost',
    path: '/consume/payment',
    port: 3030,
    method: 'GET',
};

let req = http.request(options, (res) => {
    jsonbody(res).then((body) => {
        console.log(body);
    });
});

req.end();
