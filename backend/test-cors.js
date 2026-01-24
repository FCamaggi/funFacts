// Test CORS simple
import { request } from 'http';

const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/lobby/create',
    method: 'POST',
    headers: {
        'Origin': 'http://localhost:5173',
        'Content-Type': 'application/json'
    }
};

console.log('Testing CORS...\n');

const req = request(options, (res) => {
    console.log('Status:', res.statusCode);
    console.log('\nHeaders:');
    Object.keys(res.headers).forEach(key => {
        if (key.includes('access-control') || key.includes('origin')) {
            console.log(`  ${key}: ${res.headers[key]}`);
        }
    });

    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        console.log('\nResponse:', data);
    });
});

req.on('error', (e) => {
    console.error('Error:', e);
});

req.end();
