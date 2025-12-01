import express from 'express';
import jwt from 'jsonwebtoken';
import 'dotenv/config.js';

export const authRouter = express.Router();

// POST /token
authRouter.post('/token', (req, res) => {
    try {
        const { pennkey } = req.body;

        if (!pennkey || typeof pennkey !== 'string') {
            return res.status(400).json({
                code: 'BAD_REQUEST',
                message: 'Missing or invalid pennkey',
            });
        }

        // Get JWT secret
        const JWT_SECRET = process.env.JWT_SECRET || 'my_secret_dont_steal_pls';
        if (!JWT_SECRET) {
            return res.status(500).json({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'No JWT_SECRET provided',
            });
        }

        const token = jwt.sign({ pennkey: pennkey }, JWT_SECRET, {
            expiresIn: '24h',
        });
        res.json({ token });
    } catch {
        res.status(500).json({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate JWT token',
        });
    }
});
