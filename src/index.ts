import express from 'express';
import { connectRedis, disconnectRedis } from './services/redis.service.js';
import { pokemonRouter } from './routes/pokemon.routes.js';
import { boxRouter } from './routes/box.routes.js';
import { authRouter } from './routes/auth.routes.js';
import 'dotenv/config.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Routes
app.use('/', authRouter);
app.use('/pokemon', pokemonRouter);
app.use('/box', boxRouter);

// Start server
async function startServer() {
    try {
        // boot up redis
        await connectRedis();

        // start express
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// shutdown control-c
process.on('SIGINT', async () => {
    console.log('\nShutting down gracefully...');
    await disconnectRedis();
    process.exit(0);
});

// shutdown control-z
process.on('SIGTERM', async () => {
    console.log('\nShutting down gracefully...');
    await disconnectRedis();
    process.exit(0);
});

startServer();
