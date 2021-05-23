const http = require('http');
const responsebody = require('./jsonbody.js');

let options = {
    host: 'localhost',
    path: '/publish',
    port: 3030,
    method: 'POST',
    headers: {
        'Accept': 'application/json'
    }
};

let req = http.request(options, (res) => {
    console.log(res.headers);
    console.log(res.statusCode);
    responsebody(res).then((body) => {
        console.log(body);
    });
});

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

// req.write('a' + JSON.stringify({"command": "pay", "amount": getRandomInt(500000)}));
req.write(JSON.stringify({"command": "pay", "amount": getRandomInt(500000)}));
req.end();
