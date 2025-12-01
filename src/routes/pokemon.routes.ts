import express from 'express';
import { listPokemon, getPokemonByName } from '../services/pokemon.service.js';

export const pokemonRouter = express.Router();

// GET /pokemon/
pokemonRouter.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit as string, 10);
        const offset = parseInt(req.query.offset as string, 10);

        // validation
        if (isNaN(limit) || isNaN(offset) || limit <= 0 || offset < 0) {
            return res.status(400).json({
                code: 'BAD_REQUEST',
                message: 'Invalid limit or offset parameters',
            });
        }

        const pokemon = await listPokemon(limit, offset);
        res.json(pokemon);
    } catch {
        res.status(500).json({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to fetch Pokemon list',
        });
    }
});

// GET /pokemon/:name
pokemonRouter.get('/:name', async (req, res) => {
    try {
        const { name } = req.params;
        if (!name || typeof name !== 'string') {
            return res.status(400).json({
                code: 'BAD_REQUEST',
                message: 'Invalid name parameter',
            });
        }
        const pokemon = await getPokemonByName(name);
        res.json(pokemon);
    } catch (error) {
        if (error instanceof Error && error.message.includes('not found')) {
            res.status(404).json({
                code: 'NOT_FOUND',
                message: 'Pokemon not found',
            });
        } else {
            res.status(500).json({
                code: 'INTERNAL_SERVER_ERROR',
                message: 'An error occurred while fetching the pokemon',
            });
        }
    }
});
