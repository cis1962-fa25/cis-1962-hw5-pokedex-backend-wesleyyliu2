import { createClient } from 'redis';
import 'dotenv/config.js';

// Create Redis client
const client = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379',
});

// Connection error
client.on('error', (err) => {
    console.error('Redis Client Error:', err);
});

// Connect to Redis
export async function connectRedis() {
    if (!client.isOpen) {
        await client.connect();
        console.log('Connected to Redis');
    }
}

// Disconnect from Redis
export async function disconnectRedis() {
    if (client.isOpen) {
        await client.quit();
        console.log('Disconnected from Redis');
    }
}

export { client };
