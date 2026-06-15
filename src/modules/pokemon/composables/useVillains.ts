// modules/pokemon/composables/useVillains.ts

export interface Villain {
  id: string
  name: string
  organization: 'Rocket' | 'Magma' | 'Aqua' | 'Galaxia'
  isBoss: boolean
  introDialog: string
  sprite: string      // URL de la imagen del villano
  pokemonIds: number[] // Los 3 Pokémon fijos que usará
}

export const VILLAINS: Villain[] = [
  // --- TEAM ROCKET ---
  {
    id: 'rocket_recruit',
    name: 'Recluta Team Rocket',
    organization: 'Rocket',
    isBoss: false,
    introDialog: '¡Entréganos tus Pokémon o atente a las consecuencias!',
    sprite: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/b/b3/latest/20180210190137/Recluta_Team_Rocket_M_LGPE.png/200px-Recluta_Team_Rocket_M_LGPE.png',
    pokemonIds: [19, 41, 109] // Rattata, Zubat, Koffing
  },
  {
    id: 'giovanni',
    name: 'Líder Giovanni',
    organization: 'Rocket',
    isBoss: true,
    introDialog: 'Bienvenidos a mi guarida. Soy el líder del Team Rocket, ¡y conocerás el verdadero poder de la tierra!',
    sprite: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/d/d4/latest/20190829215033/Giovanni_Masters.png/200px-Giovanni_Masters.png',
    pokemonIds: [31, 34, 112] // Nidoqueen, Nidoking, Rhydon
  },
  
  // --- TEAM MAGMA ---
  {
    id: 'magma_recruit',
    name: 'Recluta Team Magma',
    organization: 'Magma',
    isBoss: false,
    introDialog: '¡Expandiremos la tierra para el avance de la humanidad!',
    sprite: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/2/22/latest/20141014161625/Recluta_Team_Magma_M_ORAS.png/200px-Recluta_Team_Magma_M_ORAS.png', // URL real arreglada
    pokemonIds: [261, 322, 41] // Poochyena, Numel, Zubat
  },
  {
    id: 'maxie',
    name: 'Líder Magno',
    organization: 'Magma',
    isBoss: true,
    introDialog: 'El mar es una distracción. ¡Solo la tierra firme nos llevará a la evolución con el poder de Groudon!',
    sprite: 'https://images.wikidexcdn.net/mwuploads/wikidex/thumb/e/e5/latest/20141128193245/Magno_ROZA.png/200px-Magno_ROZA.png', // URL real arreglada
    pokemonIds: [262, 323, 169] // Mightyena, Camerupt, Crobat
  }
]

// Añadimos la función composable por defecto de Vue por si necesitas usarla
export function useVillains() {
  const getVillainById = (id: string) => {
    return VILLAINS.find(v => v.id === id)
  }

  const getVillainsByOrganization = (org: 'Rocket' | 'Magma' | 'Aqua' | 'Galaxia') => {
    return VILLAINS.filter(v => v.organization === org)
  }

  return {
    VILLAINS,
    getVillainById,
    getVillainsByOrganization
  }
}