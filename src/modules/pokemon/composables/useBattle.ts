import { ref } from 'vue'
import type { Character } from './useCharacters'
import type { UnlockedPokemon } from './usePokemonGame'
import { VILLAINS } from './useVillains'
import type { Villain } from './useVillains'

export interface BattlePokemon {
  id:      number
  name:    string
  hp:      number
  maxHp:   number
  attack:  number
  defense: number
  speed:   number
  types:   string[]
  sprite:  string
}

export interface BattleLog {
  text: string
  type: 'info' | 'player' | 'enemy' | 'win' | 'lose'
}

const TYPE_TRANSLATIONS: Record<string, string> = {
  normal:'Normal', fire:'Fuego', water:'Agua', electric:'Eléctrico',
  grass:'Planta', ice:'Hielo', fighting:'Lucha', poison:'Veneno',
  ground:'Tierra', flying:'Volador', psychic:'Psíquico', bug:'Bicho',
  rock:'Roca', ghost:'Fantasma', dragon:'Dragón', dark:'Siniestro',
  steel:'Acero', fairy:'Hada',
}

// Tabla de efectividad simplificada
const TYPE_CHART: Record<string, Record<string, number>> = {
  Fuego:     { Planta: 2, Hielo: 2, Bicho: 2, Acero: 2, Agua: 0.5, Roca: 0.5, Dragón: 0.5, Fuego: 0.5 },
  Agua:      { Fuego: 2, Roca: 2, Tierra: 2, Planta: 0.5, Dragón: 0.5, Agua: 0.5 },
  Planta:    { Agua: 2, Roca: 2, Tierra: 2, Fuego: 0.5, Planta: 0.5, Veneno: 0.5, Volador: 0.5, Bicho: 0.5, Dragón: 0.5, Acero: 0.5 },
  Eléctrico: { Agua: 2, Volador: 2, Planta: 0.5, Eléctrico: 0.5, Dragón: 0.5, Tierra: 0 },
  Psíquico:  { Lucha: 2, Veneno: 2, Acero: 0.5, Psíquico: 0.5, Siniestro: 0 },
  Hielo:     { Planta: 2, Tierra: 2, Volador: 2, Dragón: 2, Fuego: 0.5, Agua: 0.5, Hielo: 0.5, Acero: 0.5 },
  Dragón:    { Dragón: 2, Acero: 0.5, Hada: 0 },
  Siniestro: { Psíquico: 2, Fantasma: 2, Lucha: 0.5, Siniestro: 0.5, Hada: 0.5 },
  Lucha:     { Normal: 2, Hielo: 2, Roca: 2, Siniestro: 2, Acero: 2, Veneno: 0.5, Bicho: 0.5, Psíquico: 0.5, Volador: 0.5, Hada: 0.5, Fantasma: 0 },
  Veneno:    { Planta: 2, Hada: 2, Veneno: 0.5, Tierra: 0.5, Roca: 0.5, Fantasma: 0.5, Acero: 0 },
  Tierra:    { Fuego: 2, Eléctrico: 2, Veneno: 2, Roca: 2, Acero: 2, Planta: 0.5, Bicho: 0.5, Volador: 0 },
  Roca:      { Fuego: 2, Hielo: 2, Volador: 2, Bicho: 2, Lucha: 0.5, Tierra: 0.5, Acero: 0.5 },
  Bicho:     { Planta: 2, Psíquico: 2, Siniestro: 2, Fuego: 0.5, Lucha: 0.5, Volador: 0.5, Fantasma: 0.5, Acero: 0.5, Hada: 0.5 },
  Fantasma:  { Psíquico: 2, Fantasma: 2, Normal: 0, Siniestro: 0.5 },
  Acero:     { Hielo: 2, Roca: 2, Hada: 2, Fuego: 0.5, Agua: 0.5, Eléctrico: 0.5, Acero: 0.5 },
  Volador:   { Planta: 2, Lucha: 2, Bicho: 2, Eléctrico: 0.5, Roca: 0.5, Acero: 0.5 },
  Hada:      { Lucha: 2, Dragón: 2, Siniestro: 2, Veneno: 0.5, Acero: 0.5, Fuego: 0.5 },
  Normal:    { Roca: 0.5, Acero: 0.5, Fantasma: 0 },
}

function getEffectiveness(attackType: string, defenderTypes: string[]): number {
  let mult = 1
  for (const defType of defenderTypes) {
    mult *= TYPE_CHART[attackType]?.[defType] ?? 1
  }
  return mult
}

async function fetchBattlePokemon(id: number): Promise<BattlePokemon | null> {
  try {
    const r    = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
    const data = await r.json()
    const stats: Record<string, number> = {}
    for (const s of data.stats) stats[s.stat.name] = s.base_stat

    return {
      id,
      name:    data.name,
      hp:      stats['hp'] ?? 0,
      maxHp:   stats['hp'] ?? 0,
      attack:  stats['attack'] ?? 0,
      defense: stats['defense'] ?? 0,
      speed:   stats['speed'] ?? 0,
      types:   data.types.map((t: { type: { name: string } }) => TYPE_TRANSLATIONS[t.type.name] ?? t.type.name),
      sprite:  data.sprites.other['official-artwork'].front_default
               ?? data.sprites.front_default,
    }
  } catch { return null }
}

// Calcula daño con variación aleatoria y control de undefined
function calcDamage(attacker: BattlePokemon, defender: BattlePokemon): { dmg: number; effectiveness: number } {
  const base          = Math.floor((attacker.attack / defender.defense) * 20)
  const randomFactor  = 0.85 + Math.random() * 0.15
  const effectiveness = getEffectiveness(attacker.types[0] ?? 'Normal', defender.types)
  const dmg           = Math.max(1, Math.floor(base * randomFactor * effectiveness))
  return { dmg, effectiveness }
}

export function useBattle() {
  const phase           = ref<'select' | 'loading' | 'battle' | 'result'>('select')
  const playerTeam      = ref<BattlePokemon[]>([])
  const enemyTeam       = ref<BattlePokemon[]>([])
  const playerActive    = ref(0)
  const enemyActive     = ref(0)
  const battleLog       = ref<BattleLog[]>([])
  const isPlayerTurn    = ref(true)
  const battleRunning   = ref(false)
  const winner          = ref<'player' | 'enemy' | null>(null)
  const enemyCharacter  = ref<Villain | null>(null)
  const animating       = ref<'player-attack' | 'enemy-attack' | null>(null)

  function addLog(text: string, type: BattleLog['type'] = 'info') {
    battleLog.value.push({ text, type })
  }

  function delay(ms: number) {
    return new Promise<void>(res => setTimeout(res, ms))
  }

  // Carga los Pokémon seleccionados del jugador y el equipo fijo del villano
async function startBattle(
    selectedIds: number[],
    villainId: string
  ) {
    phase.value     = 'loading'
    battleLog.value = []
    winner.value    = null
    playerActive.value = 0
    enemyActive.value  = 0

    // CORREGIDO: Añadido el tipo (v: Villain) para evitar el error 'implicitly has any type'
    const villain = VILLAINS.find((v: Villain) => v.id === villainId)
    if (!villain) {
      phase.value = 'select'
      return
    }
    
    enemyCharacter.value = villain
    const enemyIds = villain.pokemonIds

    // Fetch en paralelo de los datos de la PokeAPI para ambos equipos
    const [playerPokes, enemyPokes] = await Promise.all([
      Promise.all(selectedIds.map(fetchBattlePokemon)),
      Promise.all(enemyIds.map(fetchBattlePokemon)),
    ])

    playerTeam.value = playerPokes.filter(Boolean) as BattlePokemon[]
    enemyTeam.value  = enemyPokes.filter(Boolean)  as BattlePokemon[]

    // Cambiamos a la pantalla de la arena e iniciamos el registro de la batalla
    phase.value = 'battle'
    addLog(`¡Se presenta el ${enemyCharacter.value.name}!`, 'info')
    addLog(`"${enemyCharacter.value.introDialog}"`, 'info')
    addLog(`¡${playerTeam.value[0]?.name.toUpperCase()}, ve!`, 'player')
    addLog(`¡${enemyCharacter.value.name} saca a ${enemyTeam.value[0]?.name.toUpperCase()}!`, 'enemy')
  }

  // Un turno completo (jugador ataca → enemigo ataca)
  async function executeTurn() {
    if (battleRunning.value) return
    battleRunning.value = true

    const attacker = playerTeam.value[playerActive.value]
    const defender = enemyTeam.value[enemyActive.value]
    if (!attacker || !defender) { battleRunning.value = false; return }

    const playerFirst = attacker.speed >= defender.speed

    const doPlayerAttack = async () => {
      animating.value = 'player-attack'
      await delay(400)
      const { dmg, effectiveness } = calcDamage(attacker, defender)
      defender.hp = Math.max(0, defender.hp - dmg)

      let effText = ''
      if (effectiveness >= 2)   effText = ' ¡Es muy eficaz!'
      if (effectiveness <= 0.5) effText = ' No es muy eficaz...'
      if (effectiveness === 0)   effText = ' ¡No afecta!'

      addLog(`${attacker.name.toUpperCase()} ataca: ${dmg} daño.${effText}`, 'player')
      animating.value = null
      await delay(300)

      if (defender.hp <= 0) {
        addLog(`¡${defender.name.toUpperCase()} se debilitó!`, 'info')
        await delay(400)
        enemyActive.value++
        if (enemyActive.value >= enemyTeam.value.length) {
          winner.value = 'player'
          phase.value  = 'result'
          addLog('¡Has ganado la batalla!', 'win')
          battleRunning.value = false
          return true 
        }
        addLog(`¡${enemyCharacter.value?.name} saca a ${enemyTeam.value[enemyActive.value]?.name.toUpperCase()}!`, 'enemy')
      }
      return false
    }

    const doEnemyAttack = async () => {
      const currentEnemy = enemyTeam.value[enemyActive.value]
      const currentPlayer = playerTeam.value[playerActive.value]
      if (!currentEnemy || !currentPlayer) return false

      animating.value = 'enemy-attack'
      await delay(400)
      const { dmg, effectiveness } = calcDamage(currentEnemy, currentPlayer)
      currentPlayer.hp = Math.max(0, currentPlayer.hp - dmg)

      let effText = ''
      if (effectiveness >= 2)   effText = ' ¡Es muy eficaz!'
      if (effectiveness <= 0.5) effText = ' No es muy eficaz...'
      if (effectiveness === 0)   effText = ' ¡No afecta!'

      addLog(`${currentEnemy.name.toUpperCase()} ataca: ${dmg} daño.${effText}`, 'enemy')
      animating.value = null
      await delay(300)

      if (currentPlayer.hp <= 0) {
        addLog(`¡${currentPlayer.name.toUpperCase()} se debilitó!`, 'info')
        await delay(400)
        playerActive.value++
        if (playerActive.value >= playerTeam.value.length) {
          winner.value = 'enemy'
          phase.value  = 'result'
          addLog('¡Has perdido la batalla...', 'lose')
          battleRunning.value = false
          return true
        }
        addLog(`¡${playerTeam.value[playerActive.value]?.name.toUpperCase()}, ve!`, 'player')
      }
      return false
    }

    if (playerFirst) {
      const ended = await doPlayerAttack()
      if (!ended) await doEnemyAttack()
    } else {
      const ended = await doEnemyAttack()
      if (!ended) await doPlayerAttack()
    }

    battleRunning.value = false
  }

  function resetBattle() {
    phase.value        = 'select'
    playerTeam.value   = []
    enemyTeam.value    = []
    battleLog.value    = []
    winner.value       = null
    playerActive.value = 0
    enemyActive.value  = 0
    animating.value    = null
  }

  return {
    phase, playerTeam, enemyTeam,
    playerActive, enemyActive,
    battleLog, winner, enemyCharacter,
    animating, battleRunning,
    startBattle, executeTurn, resetBattle,
  }
}