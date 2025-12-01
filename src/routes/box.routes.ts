import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import * as boxService from '../services/box.service.js';
import {
    insertBoxEntrySchema,
    updateBoxEntrySchema,
} from '../schemas/box.schemas.js';
import type { InsertBoxEntry, UpdateBoxEntry } from '../types/types.js';

export const boxRouter = express.Router();

// Use middleware
boxRouter.use(authMiddleware);

// POST /box/
boxRouter.post('/', async (req, res) => {
    try {
        const pennkey = req.user.pennkey;
        // Validate request body
        const result = insertBoxEntrySchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                code: 'BAD_REQUEST',
                message: 'Invalid Box entry data',
            });
        }

        const entry = await boxService.createEntry(
            pennkey,
            result.data as InsertBoxEntry,
        );
        res.status(201).json(entry);
    } catch {
        res.status(500).json({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to create Box entry',
        });
    }
});

// GET /box/:id
boxRouter.get('/:id', async (req, res) => {
    try {
        const pennkey = req.user.pennkey;
        const { id } = req.params;

        const entry = await boxService.getEntry(pennkey, id);

        if (!entry) {
            return res.status(404).json({
                code: 'NOT_FOUND',
                message: 'Box entry not found',
            });
        }

        res.json(entry);
    } catch {
        res.status(500).json({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to get Box entry',
        });
    }
});

// GET /box/
boxRouter.get('/', async (req, res) => {
    try {
        const pennkey = req.user.pennkey;
        const ids = await boxService.listEntries(pennkey);
        res.json(ids);
    } catch {
        res.status(500).json({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to list Box entries',
        });
    }
});

// PUT /box/:id
boxRouter.put('/:id', async (req, res) => {
    try {
        const pennkey = req.user.pennkey;
        const { id } = req.params;

        // Validate request body
        const result = updateBoxEntrySchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({
                code: 'BAD_REQUEST',
                message: 'Invalid update data',
            });
        }

        const entry = await boxService.updateEntry(
            pennkey,
            id,
            result.data as UpdateBoxEntry,
        );

        if (!entry) {
            return res.status(404).json({
                code: 'NOT_FOUND',
                message: 'Box entry not found',
            });
        }

        res.json(entry);
    } catch {
        res.status(500).json({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to update Box entry',
        });
    }
});

// DELETE /box/:id
boxRouter.delete('/:id', async (req, res) => {
    try {
        const pennkey = req.user.pennkey;
        const { id } = req.params;

        const deleted = await boxService.deleteEntry(pennkey, id);

        if (!deleted) {
            return res.status(404).json({
                code: 'NOT_FOUND',
                message: 'Box entry not found',
            });
        }

        res.status(204).send();
    } catch {
        res.status(500).json({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to delete Box entry',
        });
    }
});

// DELETE /box/
boxRouter.delete('/', async (req, res) => {
    try {
        const pennkey = req.user.pennkey;
        await boxService.clearEntries(pennkey);
        res.status(204).send();
    } catch {
        res.status(500).json({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to clear Box entries',
        });
    }
});
