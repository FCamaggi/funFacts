async function testCors() {
    try {
        console.log('🧪 Testing CORS with fetch...');

        const response = await fetch('http://localhost:3001/api/lobby/create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Origin': 'http://localhost:5173'
            }
        });

        console.log('✅ Status:', response.status);
        console.log('📋 Headers:');
        for (const [key, value] of response.headers) {
            if (key.includes('access-control')) {
                console.log(`  ${key}: ${value}`);
            }
        }

        const data = await response.json();
        console.log('📦 Response:', data);

    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testCors();
