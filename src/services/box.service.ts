import { createId } from '@paralleldrive/cuid2';
import { client } from './redis.service.js';
import type {
    BoxEntry,
    InsertBoxEntry,
    UpdateBoxEntry,
} from '../types/types.js';
import { boxEntrySchema } from '../schemas/box.schemas.js';

// Create new box entry
async function createEntry(
    pennkey: string,
    data: InsertBoxEntry,
): Promise<BoxEntry> {
    const id = createId();

    const entry: BoxEntry = {
        id,
        ...data,
    };

    // Store in Redis
    const key = `${pennkey}:pokedex:${id}`;
    await client.set(key, JSON.stringify(entry));

    return entry;
}

// Get box entry
async function getEntry(pennkey: string, id: string): Promise<BoxEntry | null> {
    const key = `${pennkey}:pokedex:${id}`;
    const data = await client.get(key);

    if (!data) {
        return null;
    }

    return JSON.parse(data) as BoxEntry;
}

// List all box entries ids
async function listEntries(pennkey: string): Promise<string[]> {
    const pattern = `${pennkey}:pokedex:*`;
    const keys = await client.keys(pattern);

    // Extract IDs
    const ids = keys.map((key) => {
        const parts = key.split(':');
        return parts[parts.length - 1] as string;
    });

    return ids;
}

// Update Box entry
async function updateEntry(
    pennkey: string,
    id: string,
    updates: UpdateBoxEntry,
): Promise<BoxEntry | null> {
    const entry = await getEntry(pennkey, id);

    if (!entry) {
        return null;
    }

    const updated: BoxEntry = {
        ...entry,
        ...updates,
    };

    // Validate updated entry
    const result = boxEntrySchema.safeParse(updated);
    if (!result.success) {
        return null;
    }

    const key = `${pennkey}:pokedex:${id}`;
    await client.set(key, JSON.stringify(updated));

    return updated;
}

// Delete a Box entry
async function deleteEntry(pennkey: string, id: string): Promise<boolean> {
    const key = `${pennkey}:pokedex:${id}`;
    const result = await client.del(key);

    return result > 0;
}

// Clear all Box entries
async function clearEntries(pennkey: string): Promise<void> {
    const pattern = `${pennkey}:pokedex:*`;
    const keys = await client.keys(pattern);

    if (keys.length > 0) {
        await client.del(keys);
    }
}

export {
    createEntry,
    getEntry,
    listEntries,
    updateEntry,
    deleteEntry,
    clearEntries,
};
