// 1. Interfaz estática (La plantilla del personaje)
export interface Character {
  id: string
  name: string
  sprite: string        // sprite de entrenador de frente
  backSprite: string    // sprite de espaldas para la batalla
  description: string
  color: string         // color accent del personaje
  storageKey: string    // prefijo para localStorage
}

// 2. NUEVA: Interfaz del Progreso de la Historia
export interface StoryProgress {
  rocketRecruitsDefeated: number
  rocketBossBeaten: boolean
  magmaRecruitsDefeated: number
  magmaBossBeaten: boolean
  aquaRecruitsDefeated: number
  aquaBossBeaten: boolean
  galaxiaRecruitsDefeated: number
  galaxiaBossBeaten: boolean
}

// 3. NUEVA: Interfaz completa de la Partida Guardada (Save Slot)
export interface CharacterSaveData {
  characterId: string
  level: number
  exp: number
  hp: number
  maxHp: number
  coins: number
  pokedex: number[] // Array de IDs de Pokémon desbloqueados
  storyProgress: StoryProgress
}

// Lista estática de personajes disponibles (Se queda igual, pero corregida)
export const CHARACTERS: Character[] = [
  {
    id: 'red',
    name: 'RED',
    description: 'El legendario campeón de Pallet.',
    sprite: new URL('../../../assets/img/red.webp', import.meta.url).href,
    backSprite: new URL('../../../assets/img/red.webp', import.meta.url).href,
    color: '#e3350d',
    storageKey: 'red',
  },
  {
    id: 'leaf',
    name: 'LEAF',
    description: 'La rival silenciosa de Pallet.',
    sprite: new URL('../../../assets/img/leaf.png', import.meta.url).href,
    backSprite: new URL('../../../assets/img/leaf.png', import.meta.url).href,
    color: '#4caf50',
    storageKey: 'leaf',
  },
  {
    id: 'gold',
    name: 'GOLD',
    description: 'El sucesor de Red desde Johto.',
    sprite: new URL('../../../assets/img/gold.png', import.meta.url).href,
    backSprite: new URL('../../../assets/img/gold.png', import.meta.url).href,
    color: '#ffcb05',
    storageKey: 'gold',
  },
  {
    id: 'lyra',
    name: 'LYRA',
    description: 'La enérgica entrenadora de la región Johto.',
    sprite: new URL('../../../assets/img/lyra.png', import.meta.url).href,
    backSprite: new URL('../../../assets/img/lyra.png', import.meta.url).href,
    color: '#ff65a3',
    storageKey: 'lyra',
  },
  {
    id: 'brendan',
    name: 'BRENDAN',
    description: 'Entrenador de la región Hoenn.',
    sprite: new URL('../../../assets/img/brendan.webp', import.meta.url).href,
    backSprite: new URL('../../../assets/img/brendan.webp', import.meta.url).href,
    color: '#a040a0',
    storageKey: 'brendan',
  },
  {
    id: 'may',
    name: 'MAY',
    description: 'La rival de Brendan en Hoenn.',
    sprite: new URL('../../../assets/img/may.png', import.meta.url).href,
    backSprite: new URL('../../../assets/img/may.png', import.meta.url).href,
    color: '#F08030',
    storageKey: 'may',
  },
]

// 4. NUEVA: Función helper para crear una partida desde cero
export function createNewSave(characterId: string): CharacterSaveData {
  return {
    characterId,
    level: 1,
    exp: 0,
    hp: 100,
    maxHp: 100,
    coins: 0,
    pokedex: [1, 4, 7], // Pokémon iniciales por defecto (Bulbasaur, Charmander, Squirtle) como ejemplo
    storyProgress: {
      rocketRecruitsDefeated: 0,
      rocketBossBeaten: false,
      magmaRecruitsDefeated: 0,
      magmaBossBeaten: false,
      aquaRecruitsDefeated: 0,
      aquaBossBeaten: false,
      galaxiaRecruitsDefeated: 0,
      galaxiaBossBeaten: false
    }
  }
}