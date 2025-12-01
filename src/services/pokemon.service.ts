import Pokedex from 'pokedex-promise-v2';
import type { Pokemon, PokemonType, PokemonMove } from '../types/types.js';

const pokedex = new Pokedex();

const cache = new Map<string, Pokemon>();

// Pokemon type color mapping
const TYPE_COLORS: Record<string, string> = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
}; // Found https://gist.github.com/apaleslimghost/0d25ec801ca4fc43317bcff298af43c3

async function getPokemonByName(name: string): Promise<Pokemon> {
    const cached = cache.get(name.toLowerCase());
    if (cached) {
        return cached;
    }
    try {
        const pokemonData = await pokedex.getPokemonByName(name);
        const speciesData = await pokedex.getPokemonSpeciesByName(name);

        const description = speciesData.flavor_text_entries
            .find((entry) => entry.language.name === 'en')
            ?.flavor_text.replace(/\n|\f/g, ' ');

        const englishName =
            speciesData.names.find((name) => name.language.name === 'en')
                ?.name || pokemonData.name;

        const types: PokemonType[] = pokemonData.types.map((t) => ({
            name: t.type.name.toUpperCase(),
            color: TYPE_COLORS[t.type.name] || '#ffffff',
        }));

        const moveNames = pokemonData.moves.map((m) => m.move.name);
        const movesData = await Promise.all(
            moveNames.map((name) => pokedex.getMoveByName(name)),
        );
        const moves: PokemonMove[] = movesData.map((m) => ({
            name: m.names.find((n) => n.language.name === 'en')?.name || m.name,
            power: m.power || 0,
            type: {
                name: m.type.name.toUpperCase(),
                color: TYPE_COLORS[m.type.name] || '#ffffff',
            },
        }));

        const sprites = {
            front_default: pokemonData.sprites.front_default || '',
            back_default: pokemonData.sprites.back_default || '',
            front_shiny: pokemonData.sprites.front_shiny || '',
            back_shiny: pokemonData.sprites.back_shiny || '',
        };

        const stats = {
            hp:
                pokemonData.stats.find((s) => s.stat.name === 'hp')
                    ?.base_stat || 0,
            speed:
                pokemonData.stats.find((s) => s.stat.name === 'speed')
                    ?.base_stat || 0,
            attack:
                pokemonData.stats.find((s) => s.stat.name === 'attack')
                    ?.base_stat || 0,
            defense:
                pokemonData.stats.find((s) => s.stat.name === 'defense')
                    ?.base_stat || 0,
            specialAttack:
                pokemonData.stats.find((s) => s.stat.name === 'special-attack')
                    ?.base_stat || 0,
            specialDefense:
                pokemonData.stats.find((s) => s.stat.name === 'special-defense')
                    ?.base_stat || 0,
        };

        const pokemon = {
            id: pokemonData.id,
            name: englishName,
            description: description || '',
            types,
            moves,
            sprites,
            stats,
        };
        cache.set(name.toLowerCase(), pokemon);
        return pokemon;
    } catch {
        throw new Error(`Pokemon '${name}' not found`);
    }
}

async function listPokemon(limit: number, offset: number): Promise<Pokemon[]> {
    try {
        const pokemonList = await pokedex.getPokemonsList({ limit, offset });
        const pokemonPromises: Promise<Pokemon>[] = pokemonList.results.map(
            (p) => getPokemonByName(p.name),
        );

        return Promise.all(pokemonPromises);
    } catch {
        throw new Error('Failed to list Pokemon');
    }
}

export { getPokemonByName, listPokemon };
