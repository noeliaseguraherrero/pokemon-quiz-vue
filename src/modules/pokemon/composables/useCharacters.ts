export interface Character {
  id: string
  name: string
  sprite: string        // sprite de entrenador de frente
  backSprite: string    // sprite de espaldas para la batalla
  description: string
  color: string         // color accent del personaje
  storageKey: string    // prefijo para localStorage
}

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
    color: '#ff65a3', // Un bonito color rosa/rojo pastel que le va genial
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