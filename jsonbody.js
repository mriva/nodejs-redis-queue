module.exports = stream => new Promise((resolve, reject) => {
    let rawbody = [];

    stream.on('data', (chunk) => {
        rawbody.push(chunk);
    }).on('end', () => {
        rawbody = Buffer.concat(rawbody).toString();

        try {
            let jsonbody = JSON.parse(rawbody);
            resolve(jsonbody);
        } catch (e) {
            reject(e);
        }
    });
});
