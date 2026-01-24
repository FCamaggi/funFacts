// Test rápido del backend
// Ejecuta: node backend/test-connection.js

import fetch from 'node-fetch';

const API_URL = 'http://localhost:3001';

console.log('🧪 Probando Backend...\n');

async function test() {
    try {
        // Test 1: Health check
        console.log('1. Testing health endpoint...');
        const healthRes = await fetch(`${API_URL}/health`);
        const health = await healthRes.json();
        console.log('✅ Health:', health);

        // Test 2: Crear lobby
        console.log('\n2. Creating lobby...');
        const createRes = await fetch(`${API_URL}/api/lobby/create`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });
        const { lobbyCode } = await createRes.json();
        console.log('✅ Lobby created:', lobbyCode);

        // Test 3: Verificar lobby
        console.log('\n3. Checking lobby...');
        const checkRes = await fetch(`${API_URL}/api/lobby/${lobbyCode}`);
        const lobbyInfo = await checkRes.json();
        console.log('✅ Lobby info:', lobbyInfo);

        // Test 4: Verificar que el código inválido falle correctamente
        console.log('\n4. Testing invalid lobby...');
        const invalidRes = await fetch(`${API_URL}/api/lobby/INVALID99`);
        if (invalidRes.status === 404) {
            console.log('✅ Invalid lobby correctly rejected');
        } else {
            console.log('❌ Invalid lobby check failed');
        }

        console.log('\n🎉 Todos los tests pasaron!\n');
        console.log('Ahora puedes:');
        console.log('  1. Abrir http://localhost:5173');
        console.log('  2. Crear una sala');
        console.log('  3. Unirte desde otra pestaña/ventana');
        console.log('  4. ¡Jugar!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

test();
