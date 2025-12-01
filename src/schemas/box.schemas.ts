import { z } from 'zod';

// New box entry schema
export const insertBoxEntrySchema = z.object({
    createdAt: z.string().datetime(),
    level: z.number().min(1).max(100),
    location: z.string().min(1),
    notes: z.string().optional(),
    pokemonId: z.number().min(1).max(1025),
});

// Updating box entry schema
export const updateBoxEntrySchema = z.object({
    createdAt: z.string().datetime().optional(),
    level: z.number().min(1).max(100).optional(),
    location: z.string().min(1).optional(),
    notes: z.string().optional(),
    pokemonId: z.number().min(1).max(1025).optional(),
});

export const boxEntrySchema = z.object({
    id: z.string(),
    createdAt: z.string().datetime(),
    level: z.number().min(1).max(100),
    location: z.string().min(1),
    notes: z.string().optional(),
    pokemonId: z.number().min(1).max(1025),
});
