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

export interface Record {
  bestStreak: number;
  bestLevel: number;
  totalWins: number;
  totalLosses: number;
}

const EXP_PER_LEVEL = 100;
const EXP_ON_WIN    = 20;
const EXP_ON_LOSE   = 10;

const BADGE_DEFS: Omit<Badge, 'unlocked'>[] = [
  { id: 'first',      name: 'Primer paso',    desc: 'Adivina tu primer Pokémon',       icon: '🌱' },
  { id: 'streak5',    name: 'En racha',        desc: 'Consigue una racha de 5',          icon: '⚡' },
  { id: 'streak10',   name: 'Imparable',       desc: 'Consigue una racha de 10',         icon: '🔥' },
  { id: 'pokedex25',  name: 'Explorador',      desc: 'Desbloquea 25 Pokémon',            icon: '🗺️' },
  { id: 'pokedex50',  name: 'Aventurero',      desc: 'Desbloquea 50 Pokémon',            icon: '🧭' },
  { id: 'pokedex100', name: 'Maestro',         desc: 'Desbloquea 100 Pokémon',           icon: '🏆' },
  { id: 'pokedex151', name: 'Leyenda',         desc: 'Completa la Pokédex',              icon: '👑' },
  { id: 'level5',     name: 'En forma',        desc: 'Llega al nivel 5',                 icon: '💪' },
  { id: 'level10',    name: 'Veterano',        desc: 'Llega al nivel 10',                icon: '🎖️' },
  { id: 'shiny',      name: 'Qué brillo',      desc: 'Adivina un Pokémon shiny',         icon: '✨' },
];

const TITLES = [
  { minLevel: 1,  title: 'Entrenador novato'   },
  { minLevel: 3,  title: 'Entrenador en prácticas' },
  { minLevel: 5,  title: 'Entrenador Pokémon'  },
  { minLevel: 8,  title: 'Entrenador experto'  },
  { minLevel: 12, title: 'Maestro Pokémon'     },
  { minLevel: 18, title: 'Gran Maestro'        },
  { minLevel: 25, title: 'Campeón de Liga'     },
  { minLevel: 35, title: 'Leyenda Pokémon'     },
];

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
  const exp       = ref(0);
  const level     = ref(1);
  const expToNext = ref(EXP_PER_LEVEL);

  // Persistencia
  const unlockedPokemons = ref<UnlockedPokemon[]>(loadData('pokedex', []));
  const badges           = ref<Badge[]>(
    BADGE_DEFS.map(b => ({ ...b, unlocked: loadData<boolean>('badge_' + b.id, false) }))
  );
  const records = ref<Record>(loadData('records', {
    bestStreak: 0, bestLevel: 0, totalWins: 0, totalLosses: 0,
  }));

  const showPokedex = ref(false);

  // Timer (contrarreloj)
  const timerEnabled  = ref(false);
  const timeLeft      = ref(15);
  const timerInterval = ref<ReturnType<typeof setInterval> | null>(null);

  // Modo tipo
  const modeType = ref(false);
  const currentType = ref('');

  // Hint
  const hintUsed    = ref(false);
  const hintCharges = ref(3);

  // Shiny
  const isShinyRound = ref(false);

  const randomPokemon = computed(() => {
    const idx = Math.floor(Math.random() * pokemonOptions.value.length);
    return pokemonOptions.value[idx];
  });

  const isLoading = computed(() => pokemons.value.length === 0);

  const levelProgress = computed(() =>
    Math.min(100, ((exp.value % EXP_PER_LEVEL) / EXP_PER_LEVEL) * 100)
  );

  const currentTitle = computed(() => {
    const found = [...TITLES].reverse().find(t => level.value >= t.minLevel);
    return found?.title ?? TITLES[0].title;
  });

  // ── WATCH persistencia ────────────────────────────────
  watch(unlockedPokemons, val => saveData('pokedex', val), { deep: true });
  watch(records,          val => saveData('records', val), { deep: true });

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
    if (wins.value >= 1)                              tryUnlockBadge('first');
    if (streak.value >= 5)                            tryUnlockBadge('streak5');
    if (streak.value >= 10)                           tryUnlockBadge('streak10');
    if (unlockedPokemons.value.length >= 25)          tryUnlockBadge('pokedex25');
    if (unlockedPokemons.value.length >= 50)          tryUnlockBadge('pokedex50');
    if (unlockedPokemons.value.length >= 100)         tryUnlockBadge('pokedex100');
    if (unlockedPokemons.value.length >= 151)         tryUnlockBadge('pokedex151');
    if (level.value >= 5)                             tryUnlockBadge('level5');
    if (level.value >= 10)                            tryUnlockBadge('level10');
    if (unlockedPokemons.value.some(p => p.isShiny))  tryUnlockBadge('shiny');
  };

  // ── RECORDS ──────────────────────────────────────────
  const updateRecords = () => {
    let changed = false;
    if (streak.value  > records.value.bestStreak) { records.value.bestStreak = streak.value;  changed = true; }
    if (level.value   > records.value.bestLevel)  { records.value.bestLevel  = level.value;   changed = true; }
    if (wins.value    > records.value.totalWins)  { records.value.totalWins  = wins.value;    changed = true; }
    if (losses.value  > records.value.totalLosses){ records.value.totalLosses= losses.value;  changed = true; }
    if (changed) saveData('records', records.value);
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
      .map((pokemon) => {
        const parts = pokemon.url.split("/");
        return { name: pokemon.name, id: +(parts.at(-2) ?? 0) };
      })
      .sort(() => Math.random() - 0.5);
  };

  // Obtiene tipo del Pokémon actual para pista / modo tipo
  const fetchPokemonType = async (id: number) => {
    try {
      const r = await pokemonApi.get(`/https://pokeapi.co/api/v2/pokemon/${id}`);
      const types = r.data.types.map((t: any) => t.type.name as string);
      currentType.value = types.join(' / ');
    } catch {
      currentType.value = '???';
    }
  };

  // ── TIMER ────────────────────────────────────────────
  const stopTimer = () => {
    if (timerInterval.value) { clearInterval(timerInterval.value); timerInterval.value = null; }
  };

  const startTimer = () => {
    stopTimer();
    timeLeft.value = 15;
    if (!timerEnabled.value) return;
    timerInterval.value = setInterval(() => {
      timeLeft.value--;
      if (timeLeft.value <= 0) {
        stopTimer();
        // Tiempo agotado = fallo automático
        gameStatus.value = GameStatus.Lost;
        losses.value++;
        streak.value = 0;
        loseExp(EXP_ON_LOSE);
        playerHP.value -= 15;
        if (playerHP.value <= 0) { playerHP.value = 0; isGameOver.value = true; }
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
    isShinyRound.value = Math.random() < 0.05; // 5% shiny

    pokemonOptions.value = pokemons.value.slice(0, howMany);
    pokemons.value       = pokemons.value.slice(howMany);

    if (modeType.value && randomPokemon.value) {
      fetchPokemonType(randomPokemon.value.id);
    }
    startTimer();
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
      const bonus = streak.value > 1 ? (streak.value - 1) * 10 : 0;
      const shinyBonus = isShinyRound.value ? EXP_ON_WIN * 2 : 0;
      gainExp(EXP_ON_WIN + bonus + shinyBonus);
      unlockPokemon(randomPokemon.value!, isShinyRound.value);
      playerHP.value = Math.min(100, playerHP.value + 5);
    } else {
      gameStatus.value = GameStatus.Lost;
      losses.value++;
      streak.value = 0;
      loseExp(EXP_ON_LOSE);
      playerHP.value -= 15;
      if (playerHP.value <= 0) { playerHP.value = 0; isGameOver.value = true; }
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

    getPokemons().then(result => {
      pokemons.value = result;
      getNextRound(howMany);
    });
  };

  onMounted(async () => {
    pokemons.value = await getPokemons();
    getNextRound();
  });

  return {
    gameStatus, isLoading, pokemonOptions, randomPokemon,
    playerHP, wins, losses, streak, exp, level, expToNext,
    levelProgress, currentTitle, unlockedPokemons, showPokedex,
    isGameOver, showLevelUp, newBadge, badges, records,
    timerEnabled, timeLeft, modeType, currentType,
    hintUsed, hintCharges, isShinyRound,
    EXP_PER_LEVEL,
    getNextRound, checkAnswer, resetGame, useHint,
  };
};