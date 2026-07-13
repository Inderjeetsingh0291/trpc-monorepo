const https = require('https');

https.get('https://in.pinterest.com/pin/973762750662318302/', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        const matches = data.match(/https:\/\/[^"'\s]+\.mp4/g);
        console.log(matches ? matches : 'NOT FOUND');
    });
});
