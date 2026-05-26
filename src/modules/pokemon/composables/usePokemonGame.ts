import { computed, onMounted, ref, watch } from "vue";
import { pokemonApi } from "../api/pokemonApi";
import { GameStatus } from "../interfaces";
import type { Pokemon, PokemonListResponse } from "../interfaces";
import { saveData, loadData, clearData } from "./useStorage";

export interface UnlockedPokemon {
  id: number;
  name: string;
  unlockedAt: number;
  isShiny: boolean;
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unlocked: boolean;
}

// 1. SOLUCIÓN: Cambiamos 'Record' por 'GameRecord' para no romper el Record nativo
export interface GameRecord {
  bestStreak: number;
  bestLevel: number;
  totalWins: number;
  totalLosses: number;
}

const EXP_PER_LEVEL = 100;
const EXP_ON_WIN     = 20;
const EXP_ON_LOSE   = 10;
const COINS_ON_WIN = 5;

const BADGE_DEFS: Omit<Badge, 'unlocked'>[] = [
  { id: 'first',      name: 'Primer paso',  desc: 'Adivina tu primer Pokémon',   icon: '🌱' },
  { id: 'streak5',    name: 'En racha',     desc: 'Racha de 5',                  icon: '⚡' },
  { id: 'streak10',   name: 'Imparable',    desc: 'Racha de 10',                 icon: '🔥' },
  { id: 'pokedex25',  name: 'Explorador',   desc: 'Desbloquea 25 Pokémon',       icon: '🗺️' },
  { id: 'pokedex50',  name: 'Aventurero',   desc: 'Desbloquea 50 Pokémon',       icon: '🧭' },
  { id: 'pokedex100', name: 'Maestro',      desc: 'Desbloquea 100 Pokémon',      icon: '🏆' },
  { id: 'pokedex151', name: 'Leyenda',      desc: 'Completa la Pokédex',         icon: '👑' },
  { id: 'level5',     name: 'En forma',     desc: 'Llega al nivel 5',            icon: '💪' },
  { id: 'level10',    name: 'Veterano',     desc: 'Llega al nivel 10',           icon: '🎖️' },
];

const TITLES = [
  { minLevel: 1,  title: 'Entrenador novato'       },
  { minLevel: 3,  title: 'Entrenador en prácticas' },
  { minLevel: 5,  title: 'Entrenador Pokémon'      },
  { minLevel: 8,  title: 'Entrenador experto'      },
  { minLevel: 12, title: 'Maestro Pokémon'         },
  { minLevel: 18, title: 'Gran Maestro'            },
  { minLevel: 25, title: 'Campeón de Liga'         },
  { minLevel: 35, title: 'Leyenda Pokémon'         },
];

// Aquí ya funciona el Record<string, string> nativo perfectamente
const TYPE_TRANSLATIONS: Record<string, string> = {
  normal:   'Normal',   fire:     'Fuego',    water:    'Agua',
  electric: 'Eléctrico',grass:   'Planta',   ice:      'Hielo',
  fighting: 'Lucha',    poison:  'Veneno',    ground:   'Tierra',
  flying:   'Volador',  psychic: 'Psíquico',  bug:      'Bicho',
  rock:     'Roca',     ghost:   'Fantasma',  dragon:   'Dragón',
  dark:     'Siniestro',steel:   'Acero',     fairy:    'Hada',
};

export const usePokemonGame = () => {
  const gameStatus     = ref<GameStatus>(GameStatus.Playing);
  const pokemons       = ref<Pokemon[]>([]);
  const pokemonOptions = ref<Pokemon[]>([]);
  const isGameOver     = ref(false);
  const showLevelUp    = ref(false);
  const newBadge       = ref<Badge | null>(null);

  const playerHP  = ref(100);
  const wins      = ref(0);
  const losses    = ref(0);
  const streak    = ref(0);
const exp       = ref<number>(loadData('player_exp', 0));
const level     = ref<number>(loadData('player_level', 1));
// Calculamos el requerimiento basándonos en el nivel cargado
const expToNext = ref<number>(EXP_PER_LEVEL * level.value);

  const unlockedPokemons = ref<UnlockedPokemon[]>(loadData('pokedex', []));
  const badges = ref<Badge[]>(
    BADGE_DEFS.map(b => ({ ...b, unlocked: loadData<boolean>('badge_' + b.id, false) }))
  );
  
  // Usamos la nueva interfaz aquí
  const records = ref<GameRecord>(loadData('records', {
    bestStreak: 0, bestLevel: 0, totalWins: 0, totalLosses: 0,
  }));

  const showPokedex = ref(false);

  // Timer
  const timerEnabled  = ref(false);
  const timeLeft      = ref(15);
  const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);

  // Modo tipo
  const modeType    = ref(false);
  const currentType = ref('');

  // Hint
  const hintUsed    = ref(false);
  const hintCharges = ref(3);

  const coins = ref(loadData<number>('coins', 0));
  const isShinyRound = ref(false);

  const randomPokemon = computed(() => {
    const idx = Math.floor(Math.random() * pokemonOptions.value.length);
    return pokemonOptions.value[idx];
  });

  const isLoading     = computed(() => pokemons.value.length === 0);
  const levelProgress = computed(() =>
    Math.min(100, ((exp.value % EXP_PER_LEVEL) / EXP_PER_LEVEL) * 100)
  );
const currentTitle = computed(() => {
  return [...TITLES].reverse().find(t => level.value >= t.minLevel)?.title ?? TITLES[0]!.title;
});

  watch(unlockedPokemons, val => saveData('pokedex', val), { deep: true });
  watch(records,          val => saveData('records', val), { deep: true });
  // Dentro de usePokemonGame.ts
  watch(timerEnabled, (isEnabled) => {
    if (!isEnabled) {
      stopTimer(); // Si pasa a OFF, detenemos el setInterval de inmediato
    }
  });
  // Añade esto debajo de tus otros watch:
  watch(exp,   val => saveData('player_exp', val));
  watch(level, val => {
    saveData('player_level', val);
    updateRecords(); // De paso, aseguramos que el récord de nivel máximo se actualice
  });

  watch(coins, val => saveData('coins', val));

  // ── BADGES ───────────────────────────────────────────
  const tryUnlockBadge = (id: string) => {
    const badge = badges.value.find(b => b.id === id);
    if (badge && !badge.unlocked) {
      badge.unlocked = true;
      saveData('badge_' + id, true);
      newBadge.value = badge;
      setTimeout(() => { newBadge.value = null; }, 3000);
    }
  };

  const checkBadges = () => {
    if (wins.value >= 1)                     tryUnlockBadge('first');
    if (streak.value >= 5)                   tryUnlockBadge('streak5');
    if (streak.value >= 10)                  tryUnlockBadge('streak10');
    if (unlockedPokemons.value.length >= 25) tryUnlockBadge('pokedex25');
    if (unlockedPokemons.value.length >= 50) tryUnlockBadge('pokedex50');
    if (unlockedPokemons.value.length >= 100)tryUnlockBadge('pokedex100');
    if (unlockedPokemons.value.length >= 151)tryUnlockBadge('pokedex151');
    if (level.value >= 5)                    tryUnlockBadge('level5');
    if (level.value >= 10)                   tryUnlockBadge('level10');
  };

  const updateRecords = () => {
    if (streak.value > records.value.bestStreak) records.value.bestStreak = streak.value;
    if (level.value  > records.value.bestLevel)  records.value.bestLevel  = level.value;
    if (wins.value   > records.value.totalWins)  records.value.totalWins  = wins.value;
    if (losses.value > records.value.totalLosses)records.value.totalLosses= losses.value;
    saveData('records', records.value);
  };

  // ── EXP ──────────────────────────────────────────────
  const gainExp = (amount: number) => {
    exp.value += amount;
    while (exp.value >= expToNext.value) {
      exp.value   -= expToNext.value;
      level.value += 1;
      expToNext.value = EXP_PER_LEVEL * level.value;
      showLevelUp.value = true;
      setTimeout(() => { showLevelUp.value = false; }, 2200);
    }
  };

  const loseExp = (amount: number) => {
    exp.value = Math.max(0, exp.value - amount);
  };

  // ── POKÉDEX ──────────────────────────────────────────
const unlockPokemon = (pokemon: Pokemon, shiny = false) => {
  const existing = unlockedPokemons.value.find(p => p.id === pokemon.id);
  if (!existing) {
    unlockedPokemons.value.push({
      id: pokemon.id, name: pokemon.name,
      unlockedAt: level.value, isShiny: shiny,
    });
  } else if (shiny && !existing.isShiny) {
    existing.isShiny = true;
  }
};

  // ── FETCH ────────────────────────────────────────────
  const getPokemons = async (): Promise<Pokemon[]> => {
    const response = await pokemonApi.get<PokemonListResponse>("/?limit=151");
    return response.data.results
      .map(pokemon => {
        const parts = pokemon.url.split("/");
        return { name: pokemon.name, id: +(parts.at(-2) ?? 0) };
      })
      .sort(() => Math.random() - 0.5);
  };

  // Fetch tipo
  const fetchPokemonType = async (id: number) => {
    currentType.value = '';
    try {
      const r    = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);
      const data = await r.json();
      // 2. SOLUCIÓN: Quitamos 'any[]' y le damos la estructura exacta esperada
      const types = (data.types as { type: { name: string } }[]).map(t => TYPE_TRANSLATIONS[t.type.name] ?? t.type.name);
      currentType.value = types.join(' / ');
    } catch {
      currentType.value = '???';
    }
  };

  // ── TIMER ────────────────────────────────────────────
  const stopTimer = () => {
    if (timerInterval.value) {
      clearInterval(timerInterval.value);
      timerInterval.value = null;
    }
  };

  const startTimer = () => {
    stopTimer();
    timeLeft.value = 15;
    if (!timerEnabled.value) return;

    timerInterval.value = setInterval(() => {
      timeLeft.value -= 1;
      if (timeLeft.value <= 0) {
        stopTimer();
        gameStatus.value = GameStatus.Lost;
        losses.value++;
        streak.value = 0;
        loseExp(EXP_ON_LOSE);
        playerHP.value -= 15;
        if (playerHP.value <= 0) {
          playerHP.value   = 0;
          isGameOver.value = true;
        }
        updateRecords();
      }
    }, 1000);
  };

  // ── RONDA ────────────────────────────────────────────
const getNextRound = (howMany = 4) => {
  if (isGameOver.value) return;
  gameStatus.value  = GameStatus.Playing;
  hintUsed.value    = false;
  currentType.value = '';
  isShinyRound.value = Math.random() < 0.01; // 1%

  pokemonOptions.value = pokemons.value.slice(0, howMany);
  pokemons.value       = pokemons.value.slice(howMany);

  setTimeout(() => {
    if (modeType.value && randomPokemon.value) {
      fetchPokemonType(randomPokemon.value.id);
    }
    startTimer();
  }, 50);
};

  // ── PISTA ─────────────────────────────────────────────
  const useHint = () => {
    if (hintUsed.value || hintCharges.value <= 0 || !randomPokemon.value) return;
    hintUsed.value = true;
    hintCharges.value--;
    fetchPokemonType(randomPokemon.value.id);
  };

  // ── RESPUESTA ────────────────────────────────────────
const checkAnswer = (id: number) => {
  stopTimer();
  const correct = randomPokemon.value?.id === id;

if (correct) {
  gameStatus.value = GameStatus.Won;
  wins.value++;
  streak.value++;
  gainExp(EXP_ON_WIN);
  unlockPokemon(randomPokemon.value!, isShinyRound.value); // <-- pasa shiny
  playerHP.value = Math.min(100, playerHP.value + 5);

    // Monedas: +5 base + bonus por racha
    const streakBonus = Math.floor(streak.value / 3);
    coins.value += COINS_ON_WIN + streakBonus;
  } else {
    gameStatus.value = GameStatus.Lost;
    losses.value++;
    streak.value = 0;
    loseExp(EXP_ON_LOSE);
    playerHP.value -= 15;
    if (playerHP.value <= 0) {
      playerHP.value   = 0;
      isGameOver.value = true;
    }
  }
  checkBadges();
  updateRecords();
};

  // ── RESET ────────────────────────────────────────────
  const resetGame = (howMany = 4) => {
    stopTimer();
    wins.value             = 0;
    losses.value           = 0;
    streak.value           = 0;
    exp.value              = 0;
    level.value            = 1;
    expToNext.value        = EXP_PER_LEVEL;
    playerHP.value         = 100;
    isGameOver.value       = false;
    gameStatus.value       = GameStatus.Playing;
    hintUsed.value         = false;
    hintCharges.value      = 3;
    currentType.value      = '';
    unlockedPokemons.value = [];
    clearData('pokedex');
    clearData('player_exp');   // <-- Añade esta línea
    clearData('player_level');

    getPokemons().then(result => {
      pokemons.value = result;
      getNextRound(howMany);
    });
  };

  onMounted(async () => {
    pokemons.value = await getPokemons();
    getNextRound();
  });

// ── TIENDA ────────────────────────────────────────────
const buyPotion = () => {
  if (coins.value < 20) return false;
  coins.value   -= 20;
  playerHP.value = Math.min(100, playerHP.value + 20);
  return true;
};

const buyHyperPotion = () => {
  if (coins.value < 50) return false;
  coins.value   -= 50;
  playerHP.value = Math.min(100, playerHP.value + 50);
  return true;
};

const buyHint = () => {
  if (coins.value < 30) return false;
  coins.value    -= 30;
  hintCharges.value += 1;
  return true;
};

const buyMasterBall = (eliminateWrong: () => void) => {
  if (coins.value < 100) return false;
  coins.value -= 100;
  eliminateWrong();
  return true;
};

  return {
    gameStatus, isLoading, pokemonOptions, randomPokemon,
    playerHP, wins, losses, streak, exp, level, expToNext,
    levelProgress, currentTitle, unlockedPokemons, showPokedex,
    isGameOver, showLevelUp, newBadge, badges, records,
    timerEnabled, timeLeft, modeType, currentType,
    hintUsed, hintCharges,
    EXP_PER_LEVEL,
    getNextRound, checkAnswer, resetGame, useHint,
    coins,
    buyPotion, buyHyperPotion, buyHint,
    buyMasterBall,isShinyRound,
  };
};