const http = require('http');

const data = JSON.stringify({
    username_or_email: "Test",
    password: "123",
    role: "student"
});

const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseData = '';
    
    res.on('data', (chunk) => {
        responseData += chunk;
    });

    res.on('end', () => {
        console.log(`STATUS: ${res.statusCode}`);
        console.log(`BODY: ${responseData}`);
    });
});

req.on('error', (error) => {
    console.error(`ERROR: ${error}`);
});

req.write(data);
req.end();
