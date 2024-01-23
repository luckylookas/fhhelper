export type Rank = 0|1;
export type Level = 1 | 2 | 3 | 4 | 5 | 6 | 7

export const NORMAL: Rank = 0;
export const ELITE: Rank = 1;
export const COLORS = ['#EE7A5C', '#92F499', '#80C6F0', '#B17AB8']


export function getId(monster: Monster): string {
    return `${monster.name.toLowerCase().replace(" ", "")}`
}

export interface FireBaseMonster extends Monster {
    ftsTokens: string[]
}

export interface FirebaseSession {
    round: number
    level: Level
    fire: number
    ice: number
    light: number
    dark: number
    earth: number
    wind: number
    monstersRef: string
}


export interface Monster {
    id: string
    name: string
    hp: number[]
    tokens: number
    attack: number[]
    armor: number[]
    retaliate: number[]
    speed: number[]
    special: string[]
}

export interface SessionMonster extends FirebaseSessionMonster{
    monster: Monster
    tokens: Token[]
}

interface Token {
    hp: number
    maxHp: number
    armor: number
    retaliate: number
    rank: Rank
}


export interface FirebaseSessionMonster {
    id: string
    level: number,
    color: string
    tokenHp: number[]
    rank: Rank[]
    monsterRef: string
}

export function newSessionMonster(monster: Monster, level: Level): SessionMonster {
    return hydrateSessionMonster(monster,
    {
        id: monster.id,
        level,
        color: '#000000',
        tokenHp: Array(monster.tokens).fill(0),
        rank: Array(monster.tokens).fill(NORMAL),
        monsterRef: `monsters/${monster.id}`,
    })
}

export function hydrateSessionMonster(monster: Monster, sessionMonster: FirebaseSessionMonster): SessionMonster {
    const {level} = sessionMonster
    return {
       ...sessionMonster,
        monster,
        tokens: sessionMonster.rank.map((rank, token) => ({
            maxHp: monster.hp[2*level+rank],
            rank: rank,
            hp: sessionMonster.tokenHp[token],
            armor: monster.armor[2*level+rank],
            retaliate: monster.retaliate[2*level+rank],
        } as Token))
    } as SessionMonster
}

