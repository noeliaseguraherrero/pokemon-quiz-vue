<template>
  <section v-if="isLoading || !randomPokemon" class="loading-screen">
    <div class="pokeball-spin"></div>
    <p class="loading-text">CARGANDO POKÉDEX...</p>
  </section>

  <section v-else class="game-root">
    <div class="pokeball-bg"></div>

    <transition name="fade">
      <div v-if="showTutorial" class="tutorial-overlay">
        <div class="tutorial-box">
          <div class="tut-step-dots">
            <span v-for="i in tutorialSteps.length" :key="i"
              class="tut-dot" :class="{ active: tutStep === i - 1 }"></span>
          </div>
          <div class="tut-icon">{{ tutorialSteps[tutStep]?.icon }}</div>
          <div class="tut-title">{{ tutorialSteps[tutStep]?.title }}</div>
          <div class="tut-desc">{{ tutorialSteps[tutStep]?.desc }}</div>
          <div class="tut-btns">
            <button v-if="tutStep > 0" class="tut-btn secondary" @click="tutStep--">← ATRÁS</button>
            <button class="tut-btn" @click="tutNext">
              {{ tutStep < tutorialSteps.length - 1 ? 'SIGUIENTE →' : '¡JUGAR!' }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <transition name="pop">
      <div v-if="isGameOver" class="gameover-overlay">
        <div class="gameover-box">
          <div class="gameover-icon">💀</div>
          <div class="gameover-title">GAME OVER</div>
          <div class="gameover-sub">¡Pikachu ha caído en batalla!</div>
          <div class="gameover-stats">
            <div class="go-stat"><span class="go-val green">{{ wins }}</span><span class="go-lbl">victorias</span></div>
            <div class="go-stat"><span class="go-val red">{{ losses }}</span><span class="go-lbl">derrotas</span></div>
            <div class="go-stat"><span class="go-val yellow">{{ unlockedPokemons.length }}</span><span class="go-lbl">capturados</span></div>
          </div>
          <button class="gameover-btn" @click="handleReset">▶ JUGAR DE NUEVO</button>
        </div>
      </div>
    </transition>

    <transition name="pop">
      <div v-if="showLevelUp" class="levelup-overlay">
        <div class="levelup-box">
          <div class="levelup-icon">⬆️</div>
          <div class="levelup-title">¡NIVEL {{ level }}!</div>
          <div class="levelup-sub">{{ currentTitle }}</div>
        </div>
      </div>
    </transition>

    <transition name="slide-right">
      <div v-if="newBadge" class="badge-toast">
        <span class="badge-toast-icon">{{ newBadge.icon }}</span>
        <div>
          <div class="badge-toast-title">¡INSIGNIA DESBLOQUEADA!</div>
          <div class="badge-toast-name">{{ newBadge.name }}</div>
        </div>
      </div>
    </transition>

    <aside class="side-menu" :class="{ open: menuOpen }">
      <div class="side-content">
        <div class="side-title">OPCIONES</div>

        <div class="difficulty-section">
          <div class="section-label">DIFICULTAD</div>
          <button v-for="diff in difficulties" :key="diff.value"
            class="diff-btn" :class="{ active: difficulty === diff.value }"
            @click="changeDifficulty(diff.value)">
            <span class="diff-icon">{{ diff.icon }}</span>
            <div class="diff-info">
              <span class="diff-name">{{ diff.label }}</span>
              <span class="diff-desc">{{ diff.options }} opciones</span>
            </div>
            <span v-if="difficulty === diff.value" class="diff-check">✓</span>
          </button>
        </div>

        <div class="side-divider"></div>

        <div class="section-label">MODOS</div>
        <div class="mode-row">
          <span class="mode-label">⏱ Contrarreloj</span>
        <button class="toggle-btn" :class="{ on: timerEnabled }" @click="toggleTimer">
          {{ timerEnabled ? 'ON' : 'OFF' }}
        </button>
        </div>
        <div class="mode-row">
          <span class="mode-label">🏷 Modo tipo</span>
          <button class="toggle-btn" :class="{ on: modeType }" @click="modeType = !modeType">
            {{ modeType ? 'ON' : 'OFF' }}
          </button>
        </div>

        <div class="side-divider"></div>

        <div class="side-stats">
          <div class="section-label">ESTADÍSTICAS</div>
          <div class="stat-row"><span>Victorias</span><span class="stat-val green">{{ wins }}</span></div>
          <div class="stat-row"><span>Derrotas</span><span class="stat-val red">{{ losses }}</span></div>
          <div class="stat-row"><span>Racha</span><span class="stat-val yellow">{{ streak }}</span></div>
          <div class="stat-row"><span>Nivel</span><span class="stat-val yellow">{{ level }}</span></div>
          <div class="stat-row"><span>Pokédex</span><span class="stat-val green">{{ unlockedPokemons.length }}/151</span></div>
        </div>

        <div class="side-divider"></div>

        <div class="section-label">🏆 RÉCORDS</div>
        <div class="stat-row"><span>Mejor racha</span><span class="stat-val yellow">{{ records.bestStreak }}</span></div>
        <div class="stat-row"><span>Nivel máx.</span><span class="stat-val yellow">{{ records.bestLevel }}</span></div>
        <div class="stat-row"><span>Total wins</span><span class="stat-val green">{{ records.totalWins }}</span></div>

        <div class="side-divider"></div>

        <div class="section-label">🎖 INSIGNIAS</div>
        <div class="badges-grid">
          <div v-for="badge in badges" :key="badge.id"
            class="badge-cell" :class="{ unlocked: badge.unlocked }"
            :title="badge.name + ' — ' + badge.desc">
            <span class="badge-icon">{{ badge.icon }}</span>
            <span class="badge-name">{{ badge.unlocked ? badge.name : '???' }}</span>
          </div>
        </div>

        <div class="side-divider"></div>

        <button class="reset-btn"   @click="handleReset">↺ REINICIAR</button>
        <button class="home-btn"    @click="handleGoIntro">⌂ MENÚ PRINCIPAL</button>
        <button class="tut-reopen" @click="openTutorial">? TUTORIAL</button>
      </div>
    </aside>

    <div v-if="menuOpen" class="menu-overlay" @click="menuOpen = false"></div>

    <div class="main-content">

      <header class="game-header">
        <button class="hamburger" @click="menuOpen = !menuOpen">☰</button>
        <div class="logo">POKÉ<span>QUIZ</span></div>
        <div class="header-center">
          <div class="level-row">
            <span class="level-badge">LV.{{ level }}</span>
            <span class="title-text">{{ currentTitle }}</span>
            <span class="exp-text">{{ expInLevel }}/{{ expToNext }} EXP</span>
          </div>
          <div class="exp-bar-wrap">
            <div class="exp-bar-fill" :style="{ width: levelProgress + '%' }"></div>
          </div>
        </div>
        <button class="pokedex-btn" @click="showPokedex = !showPokedex">
          📖 {{ unlockedPokemons.length }}/151
        </button>
      </header>

      <transition name="slide-down">
        <div v-if="showPokedex" class="pokedex-overlay">
          <div class="pokedex-header">
            <span class="pokedex-title">POKÉDEX</span>
            <span class="pokedex-subtitle">{{ unlockedPokemons.length }} / 151... desbloqueados</span>
            <button class="close-btn" @click="showPokedex = false">✕</button>
          </div>
          <div class="pokedex-grid">
            <div v-for="n in 151" :key="n" class="pokedex-cell"
              :class="{
                unlocked: isUnlocked(n),
                locked:   !isUnlocked(n)
              }">
              <img
                :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${n}.png`"
                :alt="getPokemonName(n)"
                :class="{ silhouette: !isUnlocked(n) }"
              />
              <span class="cell-number">#{{ String(n).padStart(3,'0') }}</span>
              <span class="cell-name">{{ isUnlocked(n) ? getPokemonName(n) : '???' }}</span>
              <span v-if="isUnlocked(n)" class="cell-level">LV.{{ getUnlockedLevel(n) }}</span>
            </div>
          </div>
        </div>
      </transition>

      <div class="battle-scene">

        <div v-if="timerEnabled" class="timer-bar-wrap">
          <div class="timer-bar-fill"
            :style="{
              width: (timeLeft / 15 * 100) + '%',
              background: timeLeft > 11 ? '#44cc44' : timeLeft > 7 ? '#ffcc00' : timeLeft > 3 ? '#ff8800' : '#ff4444',
              transition: timeLeft === 15 ? 'none' : 'width 1s linear, background 0.3s'
            }">
          </div>
          <span class="timer-label">{{ timeLeft }}s</span>
        </div>

        <div class="hp-panel enemy-panel">
          <div class="hp-name">
            {{ gameStatus !== GameStatus.Playing ? randomPokemon?.name.toUpperCase() : '???' }}
          </div>
          <div class="hp-row">
            <span class="hp-label">HP</span>
            <div class="hp-bar-bg">
              <div class="hp-bar-fill"
                :style="{ width: enemyHPPct + '%', background: hpColor(enemyHPPct) }">
              </div>
            </div>
            <span class="hp-value">{{ enemyHP }}</span>
          </div>
        </div>

        <div class="pokemon-sprite pokemon-enemy"
          :class="{ 'enemy-hit': attackAnim === 'player-attack' }">
          <PokemonPicture
            v-if="randomPokemon"
            :pokemon-id="randomPokemon.id"
            :show-pokemon="gameStatus !== GameStatus.Playing"
          />
        </div>

        <div class="pokemon-sprite pokemon-player"
          :class="{
            'player-attack': attackAnim === 'player-attack',
            'player-hit':    attackAnim === 'enemy-attack',
          }">
          <div class="hp-panel player-panel-above">
            <div class="hp-name">PIKACHU</div>
            <div class="hp-row">
              <span class="hp-label">HP</span>
              <div class="hp-bar-bg">
                <div class="hp-bar-fill"
                  :style="{ width: playerHP + '%', background: hpColor(playerHP) }">
                </div>
              </div>
              <span class="hp-value">{{ playerHP }}</span>
            </div>
          </div>
          <img class="player-img"
            src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/25.svg"
            alt="Pikachu" />
        </div>

        <div class="battle-platform platform-enemy"></div>
        <div class="battle-platform platform-player"></div>

        <div class="difficulty-badge" :class="difficulty">
          {{ difficulties.find(d => d.value === difficulty)?.label }}
        </div>

        <div class="battle-msg-box">{{ battleMessage }}</div>

        <transition name="pop">
          <div v-if="gameStatus !== GameStatus.Playing && !isGameOver"
            class="result-banner"
            :class="{ win: gameStatus === GameStatus.Won, lose: gameStatus === GameStatus.Lost }">
            <div class="result-icon">{{ gameStatus === GameStatus.Won ? '🎉' : '💥' }}</div>
            <div class="result-title">{{ gameStatus === GameStatus.Won ? '¡CORRECTO!' : '¡INCORRECTO!' }}</div>
          </div>
        </transition>
      </div>

      <div class="hint-row">
        <div v-if="currentType" class="type-info">
          🏷 Tipo: <strong>{{ currentType }}</strong>
        </div>
        <button
          v-if="gameStatus === GameStatus.Playing && !hintUsed"
          class="hint-btn"
          :disabled="hintCharges <= 0"
          @click="useHint">
          💡 PISTA ({{ hintCharges }} restantes)
        </button>
        <div v-if="modeType && !currentType && gameStatus === GameStatus.Playing" class="type-info loading-type">
          Cargando tipo...
        </div>
      </div>

      <div class="streak-bar">
        <span class="streak-label">RACHA</span>
        <div class="streak-dots">
          <div v-for="i in 5" :key="i" class="streak-dot" :class="{ filled: i <= Math.min(streak, 5) }"></div>
        </div>
        <span class="exp-label">EXP TOTAL: {{ totalExp }}</span>
      </div>

      <div class="question-card">
        <div class="question-label">
          {{ modeType ? '¿QUÉ POKÉMON ES DE ESTE TIPO?' : '¿QUIÊN ES ESTE POKÉMON?' }}
        </div>
        <div class="question-text">
          {{ modeType && currentType
            ? 'Tipo: ' + currentType
            : 'Identifica al Pokémon oculto en la silueta de arriba.' }}
        </div>
      </div>

      <transition name="round-transition" mode="out-in">
        <PokemonOptions
          v-if="randomPokemon"
          :key="roundKey"
          :options="pokemonOptions"
          :block-selection="gameStatus !== GameStatus.Playing"
          :correct-answer="randomPokemon.id"
          @selected-option="handleAnswer"
        />
      </transition>

      <div class="footer-row">
        <div class="scores">
          <div class="score-item"><span class="score-num wins">{{ wins }}</span><span class="score-lbl">WIN</span></div>
          <div class="score-item"><span class="score-num losses">{{ losses }}</span><span class="score-lbl">LOSE</span></div>
        </div>
        <button v-if="gameStatus !== GameStatus.Playing && !isGameOver" class="next-btn" @click="handleNext">
          ▶ SIGUIENTE RONDA
        </button>
      </div>

    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import PokemonPicture from '../components/PokemonPicture.vue'
import PokemonOptions from '../components/PokemonOptions.vue'
import { usePokemonGame } from '../composables/usePokemonGame'
import { GameStatus } from '../interfaces'

interface DifficultyOption {
  value: 'easy' | 'medium' | 'hard';
  label: string;
  icon: string;
  options: number;
}

const emit = defineEmits<{ goIntro: [] }>()

// Corregido el tipado estricto para evitar el error de asignación de strings
const difficulties: DifficultyOption[] = [
  { value: 'easy',   label: 'FÁCIL',   icon: '🌿', options: 2 },
  { value: 'medium', label: 'MEDIA',   icon: '⚡',  options: 4 },
  { value: 'hard',   label: 'DIFÍCIL', icon: '🔥', options: 6 },
]

const difficulty = ref<'easy' | 'medium' | 'hard'>('medium')
const menuOpen   = ref(false)
const roundKey   = ref(0)

// Animación de ataque
const attackAnim  = ref<'none' | 'player-attack' | 'enemy-attack'>('none')

const difficultyCount = computed(() =>
  difficulty.value === 'easy' ? 2 : difficulty.value === 'hard' ? 6 : 4
)

const {
  randomPokemon, isLoading, gameStatus,
  pokemonOptions, checkAnswer, getNextRound,
  playerHP, wins, losses, streak,
  exp, level, expToNext, levelProgress, currentTitle,
  unlockedPokemons, showPokedex,
  isGameOver, showLevelUp, newBadge, badges, records,
  timerEnabled, timeLeft, modeType, currentType,
  hintUsed, hintCharges,
  EXP_PER_LEVEL,
  resetGame, useHint,
} = usePokemonGame()

const enemyHP    = ref(100)
const enemyHPPct = ref(100)

const expInLevel = computed(() => exp.value % EXP_PER_LEVEL)
const totalExp   = computed(() => exp.value + (level.value - 1) * EXP_PER_LEVEL)

// Tutorial
const showTutorial = ref(!localStorage.getItem('pokequiz_tutorial_done'))
const tutStep      = ref(0)
const tutorialSteps = [
  { icon: '👁',  title: '¡Adivina el Pokémon!',  desc: 'Se muestra la silueta de un Pokémon. Elige su nombre entre las opciones.' },
  { icon: '❤️',  title: 'Tu vida importa',        desc: 'Si fallas pierdes 15 HP. Si aciertas recuperas 5 HP. A 0 HP es Game Over.' },
  { icon: '⬆️',  title: 'Sube de nivel',          desc: 'Cada acierto da 20 EXP. Cada fallo resta 10 EXP.' },
  { icon: '📖',  title: 'Completa la Pokédex',    desc: 'Cada Pokémon que adivines se añade a tu Pokédex.' },
  { icon: '💡',  title: 'Usa las pistas',         desc: 'Tienes 3 pistas por partida que revelan el tipo del Pokémon.' },
  { icon: '🏆',  title: 'Récords e insignias',    desc: 'Consigue logros y bate tus récords desde el menú lateral.' },
]

function tutNext() {
  if (tutStep.value < tutorialSteps.length - 1) { tutStep.value++; return; }
  showTutorial.value = false;
  localStorage.setItem('pokequiz_tutorial_done', '1');
}
function openTutorial() {
  tutStep.value = 0;
  showTutorial.value = true;
  menuOpen.value = false;
}

const battleMessage = computed(() => {
  if (isGameOver.value)                        return '¡Pikachu no puede más! ¡Has perdido!'
  if (gameStatus.value === GameStatus.Playing) return timerEnabled.value
    ? `⏱ ¡${timeLeft.value}s para responder!`
    : '¡Un Pokémon salvaje aparece! ¿Cuál es su nombre?'
  if (gameStatus.value === GameStatus.Won)     return `¡Es ${randomPokemon.value?.name.toUpperCase()}! ¡Ataque efectivo!`
  return `Era ${randomPokemon.value?.name.toUpperCase()}... ¡Fallaste!`
})

function hpColor(pct: number) {
  if (pct > 50) return '#44cc44'
  if (pct > 25) return '#ffcc00'
  return '#ff4444'
}

function isUnlocked(id: number)       { return unlockedPokemons.value.some(p => p.id === id) }
function getPokemonName(id: number)   { return unlockedPokemons.value.find(p => p.id === id)?.name ?? '???' }
function getUnlockedLevel(id: number) { return unlockedPokemons.value.find(p => p.id === id)?.unlockedAt ?? 0 }

// Lanza la animación de ataque y luego ejecuta la lógica
function handleAnswer(id: number) {
  const correct = id === randomPokemon.value?.id

  if (correct) {
    attackAnim.value = 'player-attack'
    setTimeout(() => {
      enemyHP.value    = 0
      enemyHPPct.value = 0
      checkAnswer(id)
      setTimeout(() => { attackAnim.value = 'none' }, 400)
    }, 400)
  } else {
    attackAnim.value = 'enemy-attack'
    setTimeout(() => {
      checkAnswer(id)
      setTimeout(() => { attackAnim.value = 'none' }, 400)
    }, 400)
  }
}

function handleNext() {
  if (isGameOver.value) return
  enemyHP.value    = 100
  enemyHPPct.value = 100
  roundKey.value++
  getNextRound(difficultyCount.value)
}

function changeDifficulty(val: 'easy' | 'medium' | 'hard') {
  difficulty.value = val
  menuOpen.value   = false
  enemyHP.value    = 100
  enemyHPPct.value = 100
  const count = val === 'easy' ? 2 : val === 'hard' ? 6 : 4
  gameStatus.value = GameStatus.Playing
  getNextRound(count)
}

function handleReset() {
  enemyHP.value    = 100
  enemyHPPct.value = 100
  menuOpen.value   = false
  roundKey.value++
  resetGame(difficultyCount.value)
}

function handleGoIntro() {
  menuOpen.value = false
  emit('goIntro')
}

function toggleTimer() {
  timerEnabled.value = !timerEnabled.value;
  if (timerEnabled.value && gameStatus.value === GameStatus.Playing) {
    getNextRound(difficultyCount.value);
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;700;800&display=swap');
* { box-sizing: border-box; }

.loading-screen {
  display:flex; flex-direction:column; align-items:center;
  justify-content:center; height:100vh; background:#1a1a2e; gap:20px;
}
.pokeball-spin {
  width:60px; height:60px; border-radius:50%;
  border:4px solid #555; border-top-color:#e3350d;
  animation:spin .8s linear infinite;
}
@keyframes spin{to{transform:rotate(360deg)}}
.loading-text{font-family:'Press Start 2P',monospace;font-size:10px;color:#ffcb05;animation:pulse 1.2s ease infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}

.game-root {
  font-family:'Nunito',sans-serif;
  background:linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%);
  min-height:100vh; width:100%;
  display:flex; position:relative; overflow-x:hidden;
}
.pokeball-bg{
  position:fixed; width:600px; height:600px; border-radius:50%;
  border:70px solid rgba(255,255,255,.03);
  top:-250px; right:-200px; pointer-events:none; z-index:0;
}

/* TUTORIAL */
.tutorial-overlay{
  position:fixed; inset:0; background:rgba(0,0,0,.85);
  display:flex; align-items:center; justify-content:center; z-index:300;
}
.tutorial-box{
  background:#0d1117; border:3px solid #ffcb05; border-radius:20px;
  padding:36px 40px; max-width:420px; width:90%;
  display:flex; flex-direction:column; align-items:center; gap:16px; text-align:center;
}
.tut-step-dots{display:flex;gap:8px;margin-bottom:4px;}
.tut-dot{width:8px;height:8px;border-radius:50%;background:rgba(255,255,255,.2);}
.tut-dot.active{background:#ffcb05;}
.tut-icon{font-size:44px;}
.tut-title{font-family:'Press Start 2P',monospace;font-size:11px;color:#ffcb05;line-height:1.5;}
.tut-desc{font-family:'Press Start 2P',monospace;font-size:7px;color:#ccc;line-height:2;}
.tut-btns{display:flex;gap:12px;margin-top:8px;}
.tut-btn{
  font-family:'Press Start 2P',monospace;font-size:8px;
  background:#ffcb05;color:#1a1a2e;border:none;border-radius:20px;
  padding:12px 20px;cursor:pointer;transition:all .2s;
  box-shadow:0 3px 0 #b8860b;
}
.tut-btn:hover{transform:translateY(-2px);}
.tut-btn.secondary{background:rgba(255,255,255,.1);color:#fff;box-shadow:none;border:1px solid rgba(255,255,255,.2);}

/* GAME OVER */
.gameover-overlay{
  position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.85);
  display:flex;align-items:center;justify-content:center;
}
.gameover-box{
  background:#0d1117;border:3px solid #e3350d;border-radius:20px;
  padding:36px 48px;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:16px;
  animation:popIn .4s cubic-bezier(.34,1.56,.64,1);
}
.gameover-icon{font-size:52px;}
.gameover-title{font-family:'Press Start 2P',monospace;font-size:22px;color:#e3350d;text-shadow:0 0 20px rgba(227,53,13,.6);}
.gameover-sub{font-family:'Press Start 2P',monospace;font-size:7px;color:#aaa;}
.gameover-stats{display:flex;gap:28px;margin:8px 0;}
.go-stat{display:flex;flex-direction:column;align-items:center;gap:4px;}
.go-val{font-family:'Press Start 2P',monospace;font-size:20px;}
.go-lbl{font-family:'Press Start 2P',monospace;font-size:5px;color:#888;}
.go-val.green{color:#4caf50;}.go-val.red{color:#ff4444;}.go-val.yellow{color:#ffcb05;}
.gameover-btn{
  font-family:'Press Start 2P',monospace;font-size:9px;
  background:#e3350d;color:#fff;border:none;border-radius:30px;
  padding:14px 32px;cursor:pointer;transition:all .2s;
  box-shadow:0 4px 0 #8b1e07;margin-top:8px;
}
.gameover-btn:hover{transform:translateY(-2px);}

/* LEVEL UP */
.levelup-overlay{
  position:fixed;inset:0;z-index:150;
  display:flex;align-items:center;justify-content:center;
  pointer-events:none;
}
.levelup-box{
  background:rgba(13,17,23,.95);border:3px solid #ffcb05;border-radius:20px;
  padding:28px 48px;text-align:center;
  display:flex;flex-direction:column;align-items:center;gap:10px;
  animation:popIn .4s cubic-bezier(.34,1.56,.64,1);
}
.levelup-icon{font-size:40px;}
.levelup-title{font-family:'Press Start 2P',monospace;font-size:18px;color:#ffcb05;text-shadow:0 0 20px rgba(255,203,5,.5);}
.levelup-sub{font-family:'Press Start 2P',monospace;font-size:7px;color:#aaa;}

/* BADGE TOAST */
.badge-toast{
  position:fixed;top:20px;right:20px;z-index:250;
  background:#0d1117;border:2px solid #ffcb05;border-radius:12px;
  padding:12px 16px;display:flex;align-items:center;gap:12px;
  box-shadow:0 4px 20px rgba(255,203,5,.3);
}
.badge-toast-icon{font-size:28px;}
.badge-toast-title{font-family:'Press Start 2P',monospace;font-size:6px;color:#ffcb05;}
.badge-toast-name{font-family:'Press Start 2P',monospace;font-size:8px;color:#fff;margin-top:4px;}

/* SIDE MENU */
.side-menu{
  position:fixed;top:0;left:-300px;width:300px;height:100vh;
  background:#0d1117;border-right:2px solid rgba(227,53,13,.5);
  z-index:100;transition:left .3s ease;overflow-y:auto;
}
.side-menu.open{left:0;}
.side-content{padding:24px 20px;display:flex;flex-direction:column;gap:14px;}
.side-title{font-family:'Press Start 2P',monospace;font-size:10px;color:#ffcb05;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.1);}
.section-label{font-family:'Press Start 2P',monospace;font-size:6px;color:#888;letter-spacing:1px;}
.difficulty-section{display:flex;flex-direction:column;gap:8px;}
.diff-btn{
  display:flex;align-items:center;gap:10px;
  background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.1);
  border-radius:10px;padding:10px 12px;cursor:pointer;transition:all .2s;width:100%;
}
.diff-btn:hover{border-color:rgba(255,203,5,.4);}
.diff-btn.active{border-color:#ffcb05;background:rgba(255,203,5,.12);}
.diff-icon{font-size:18px;}.diff-info{display:flex;flex-direction:column;align-items:flex-start;flex:1;gap:2px;}
.diff-name{font-family:'Press Start 2P',monospace;font-size:7px;color:#fff;}
.diff-desc{font-family:'Press Start 2P',monospace;font-size:5px;color:#888;}
.diff-check{color:#ffcb05;font-size:14px;}

.mode-row{display:flex;align-items:center;justify-content:space-between;padding:4px 0;}
.mode-label{font-family:'Press Start 2P',monospace;font-size:6px;color:#ccc;}
.toggle-btn{
  font-family:'Press Start 2P',monospace;font-size:6px;
  background:rgba(255,255,255,.1);color:#888;border:1px solid rgba(255,255,255,.15);
  border-radius:20px;padding:5px 10px;cursor:pointer;transition:all .2s;
}
.toggle-btn.on{background:rgba(76,175,80,.2);color:#4caf50;border-color:#4caf50;}

.side-divider{height:1px;background:rgba(255,255,255,.08);}
.side-stats{display:flex;flex-direction:column;gap:8px;}
.stat-row{display:flex;justify-content:space-between;align-items:center;font-family:'Press Start 2P',monospace;font-size:6px;color:#aaa;padding:3px 0;}
.stat-val{font-size:8px;}
.stat-val.green{color:#4caf50;}.stat-val.red{color:#ff4444;}.stat-val.yellow{color:#ffcb05;}

.badges-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;}
.badge-cell{
  display:flex;flex-direction:column;align-items:center;gap:3px;
  padding:6px 4px;border-radius:8px;
  background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);
  transition:all .2s;
}
.badge-cell.unlocked{background:rgba(255,203,5,.1);border-color:rgba(255,203,5,.35);}
.badge-icon{font-size:18px;filter:grayscale(1) opacity(.3);}
.badge-cell.unlocked .badge-icon{filter:none;}
.badge-name{font-family:'Press Start 2P',monospace;font-size:4px;color:#555;text-align:center;line-height:1.4;}
.badge-cell.unlocked .badge-name{color:#ffcb05;}

.reset-btn{font-family:'Press Start 2P',monospace;font-size:7px;background:rgba(227,53,13,.15);color:#e3350d;border:1px solid rgba(227,53,13,.4);border-radius:8px;padding:12px;cursor:pointer;transition:all .2s;width:100%;}
.reset-btn:hover{background:rgba(227,53,13,.25);}
.home-btn{font-family:'Press Start 2P',monospace;font-size:7px;background:rgba(42,117,187,.15);color:#2a75bb;border:1px solid rgba(42,117,187,.4);border-radius:8px;padding:12px;cursor:pointer;transition:all .2s;width:100%;}
.home-btn:hover{background:rgba(42,117,187,.28);}
.tut-reopen{font-family:'Press Start 2P',monospace;font-size:7px;background:rgba(255,255,255,.05);color:#aaa;border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:12px;cursor:pointer;transition:all .2s;width:100%;}
.tut-reopen:hover{background:rgba(255,255,255,.1);}

.menu-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:99;}

/* MAIN */
.main-content{flex:1;display:flex;flex-direction:column;align-items:center;padding:16px 20px;min-height:100vh;width:100%;}

/* HEADER */
.game-header{width:100%;max-width:900px;display:flex;align-items:center;gap:14px;margin-bottom:14px;flex-wrap:wrap;}
.hamburger{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#fff;border-radius:8px;padding:8px 12px;font-size:18px;cursor:pointer;transition:all .2s;}
.hamburger:hover{background:rgba(255,255,255,.15);}
.logo{font-family:'Press Start 2P',monospace;font-size:12px;color:#ffcb05;text-shadow:2px 2px 0 #b8860b;line-height:1.4;white-space:nowrap;}
.logo span{color:#fff;}
.header-center{flex:1;display:flex;flex-direction:column;gap:5px;min-width:140px;}
.level-row{display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;}
.level-badge{font-family:'Press Start 2P',monospace;font-size:8px;color:#ffcb05;}
.title-text{font-family:'Press Start 2P',monospace;font-size:5px;color:#aac8ff;flex:1;text-align:center;}
.exp-text{font-family:'Press Start 2P',monospace;font-size:5px;color:#aaa;}
.exp-bar-wrap{height:8px;background:rgba(255,255,255,.1);border-radius:4px;overflow:hidden;}
.exp-bar-fill{height:100%;background:linear-gradient(90deg,#2a75bb,#ffcb05);border-radius:4px;transition:width .5s ease;}
.pokedex-btn{font-family:'Press Start 2P',monospace;font-size:6px;background:#e3350d;color:#fff;border:none;border-radius:20px;padding:8px 14px;cursor:pointer;transition:all .2s;box-shadow:0 3px 0 #8b1e07;white-space:nowrap;}
.pokedex-btn:hover{transform:translateY(-2px);}

/* POKÉDEX */
.pokedex-overlay{width:100%;max-width:900px;background:#2a2a3e;border:2px solid #e3350d;border-radius:16px;padding:16px;margin-bottom:14px;}
.pokedex-header{display:flex;align-items:center;gap:10px;margin-bottom:14px;}
.pokedex-title{font-family:'Press Start 2P',monospace;font-size:12px;color:#ffcb05;}
.pokedex-subtitle{font-family:'Press Start 2P',monospace;font-size:6px;color:#ccc;flex:1;}
.close-btn{background:none;border:none;color:#fff;font-size:18px;cursor:pointer;}
.pokedex-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(76px,1fr));gap:8px;max-height:400px;overflow-y:auto;}
.pokedex-grid::-webkit-scrollbar{width:4px;}
.pokedex-grid::-webkit-scrollbar-thumb{background:#e3350d;border-radius:2px;}
.pokedex-cell{display:flex;flex-direction:column;align-items:center;padding:8px 4px;border-radius:10px;gap:3px;border:1px solid transparent;transition:all .2s;position:relative;}
.pokedex-cell.locked{background:#c8c8d8;border-color:rgba(0,0,0,.1);}
.pokedex-cell.unlocked{background:rgba(255,203,5,.2);border-color:rgba(255,203,5,.5);}
.pokedex-cell.unlocked:hover{background:rgba(255,203,5,.32);transform:scale(1.06);}
.pokedex-cell.shiny{background:rgba(255,203,5,.35);border-color:#ffcb05;box-shadow:0 0 8px rgba(255,203,5,.4);}
.pokedex-cell img{width:52px;height:52px;image-rendering:pixelated;}
.pokedex-cell img.silhouette{filter:brightness(0);}
.cell-number{font-family:'Press Start 2P',monospace;font-size:5px;color:#555;}
.cell-name{font-family:'Press Start 2P',monospace;font-size:5px;color:#fff;text-align:center;text-transform:capitalize;line-height:1.4;word-break:break-all;}
.pokedex-cell.locked .cell-name{color:#333;}
.cell-level{font-family:'Press Start 2P',monospace;font-size:5px;color:#ffcb05;}
.shiny-star{position:absolute;top:3px;right:3px;font-size:10px;}

/* BATALLA */
.battle-scene{
  width:100%;max-width:900px;
  background:linear-gradient(180deg,#5ba3c9 0%,#7fc8e8 40%,#a8d8ea 58%,#5d8a3c 58%,#4a7a2f 100%);
  border-radius:16px;border:3px solid rgba(255,255,255,.2);
  height:230px;position:relative;overflow:hidden;margin-bottom:12px;
}
.timer-bar-wrap{
  position:absolute;top:0;left:0;right:0;height:6px;background:rgba(0,0,0,.3);z-index:5;
}
.timer-bar-fill{height:100%;transition:width .9s linear,background .3s;}
.timer-label{
  position:absolute;right:8px;top:8px;
  font-family:'Press Start 2P',monospace;font-size:8px;color:#fff;
  text-shadow:1px 1px 2px rgba(0,0,0,.8);z-index:5;
}
.hp-panel{position:absolute;background:rgba(15,20,40,.88);border-radius:8px;padding:6px 10px;border:1px solid rgba(255,255,255,.15);min-width:155px;}
.enemy-panel{top:14px;right:10px;}
.player-panel-above{position:relative;background:rgba(15,20,40,.88);border-radius:8px;padding:5px 8px;border:1px solid rgba(255,255,255,.15);min-width:130px;margin-bottom:4px;}
.hp-name{font-family:'Press Start 2P',monospace;font-size:6px;color:#fff;margin-bottom:4px;text-transform:capitalize;}
.hp-row{display:flex;align-items:center;gap:5px;}
.hp-label{font-family:'Press Start 2P',monospace;font-size:5px;color:#ffcb05;min-width:14px;}
.hp-bar-bg{flex:1;height:6px;background:rgba(0,0,0,.5);border-radius:3px;overflow:hidden;}
.hp-bar-fill{height:100%;border-radius:3px;transition:width .5s ease,background .5s ease;}
.hp-value{font-family:'Press Start 2P',monospace;font-size:5px;color:#fff;min-width:28px;text-align:right;}
.pokemon-sprite{position:absolute;}
.pokemon-enemy{right:14%;bottom:35%;}
.pokemon-player{left:4%;bottom:18%;display:flex;flex-direction:column;align-items:center;}
.player-img{width:80px;height:80px;image-rendering:pixelated;filter:drop-shadow(2px 4px 4px rgba(0,0,0,.4));transform:scaleX(-1);user-select:none;-webkit-user-drag:none;}
.battle-platform{position:absolute;border-radius:50%;background:rgba(0,0,0,.12);}
.platform-enemy{width:90px;height:18px;right:12%;bottom:32%;}
.platform-player{width:110px;height:20px;left:3%;bottom:16%;}
.difficulty-badge{position:absolute;top:10px;left:10px;font-family:'Press Start 2P',monospace;font-size:6px;padding:4px 8px;border-radius:10px;}
.difficulty-badge.easy{background:rgba(76,175,80,.8);color:#fff;}
.difficulty-badge.medium{background:rgba(255,203,5,.85);color:#1a1a2e;}
.difficulty-badge.hard{background:rgba(227,53,13,.85);color:#fff;}
.shiny-badge{position:absolute;top:10px;left:50%;transform:translateX(-50%);font-family:'Press Start 2P',monospace;font-size:7px;background:rgba(255,203,5,.9);color:#1a1a2e;padding:4px 10px;border-radius:10px;animation:shinePulse 1s ease infinite;}
@keyframes shinePulse{0%,100%{box-shadow:0 0 8px rgba(255,203,5,.6)}50%{box-shadow:0 0 20px rgba(255,203,5,1)}}
.battle-msg-box{position:absolute;bottom:0;left:0;right:0;background:rgba(15,20,40,.9);border-top:2px solid #ffcb05;padding:6px 12px;font-family:'Press Start 2P',monospace;font-size:7px;color:#fff;line-height:1.5;min-height:32px;display:flex;align-items:center;gap:6px;}
.battle-msg-box::before{content:'▶';color:#ffcb05;animation:blink 1s infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.shake .player-img{animation:shake .4s ease;}
@keyframes shake{0%,100%{transform:scaleX(-1) translateX(0)}25%{transform:scaleX(-1) translateX(-8px)}75%{transform:scaleX(-1) translateX(8px)}}
.enemy-hit{animation:enemyHit .4s ease;}
@keyframes enemyHit{0%,100%{opacity:1;transform:translateX(0)}25%{opacity:.3;transform:translateX(10px)}75%{opacity:.3;transform:translateX(-10px)}}
.result-banner{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(15,20,40,.95);border-radius:16px;padding:14px 24px;text-align:center;pointer-events:none;border:3px solid #ffcb05;}
.result-banner.win{border-color:#4caf50;}.result-banner.lose{border-color:#ff4444;}
.result-icon{font-size:28px;}.result-title{font-family:'Press Start 2P',monospace;font-size:10px;color:#fff;margin-top:4px;}

/* HINT */
.hint-row{width:100%;max-width:900px;display:flex;align-items:center;gap:12px;margin-bottom:8px;min-height:28px;}
.type-info{font-family:'Press Start 2P',monospace;font-size:7px;color:#aac8ff;}
.type-info.loading-type{color:#555;}
.hint-btn{
  font-family:'Press Start 2P',monospace;font-size:6px;
  background:rgba(255,203,5,.12);color:#ffcb05;
  border:1px solid rgba(255,203,5,.3);border-radius:20px;
  padding:6px 12px;cursor:pointer;transition:all .2s;margin-left:auto;
}
.hint-btn:hover:not(:disabled){background:rgba(255,203,5,.22);}
.hint-btn:disabled{opacity:.4;cursor:not-allowed;}

/* STREAK */
.streak-bar{width:100%;max-width:900px;display:flex;align-items:center;gap:8px;margin-bottom:10px;}
.streak-label{font-family:'Press Start 2P',monospace;font-size:6px;color:#aaa;}
.streak-dots{display:flex;gap:5px;}
.streak-dot{width:13px;height:13px;border-radius:50%;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);transition:all .3s ease;}
.streak-dot.filled{background:#ffcb05;border-color:#ffcb05;box-shadow:0 0 8px rgba(255,203,5,.6);animation:dotPop .3s ease;}
@keyframes dotPop{0%{transform:scale(.5)}70%{transform:scale(1.3)}100%{transform:scale(1)}}
.exp-label{font-family:'Press Start 2P',monospace;font-size:5px;color:#aaa;margin-left:auto;}

/* QUESTION */
.question-card{width:100%;max-width:900px;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.12);border-radius:16px;padding:14px 20px;margin-bottom:10px;}
.question-label{font-family:'Press Start 2P',monospace;font-size:6px;color:#aaa;margin-bottom:6px;}
.question-text{font-size:17px;font-weight:800;color:#fff;}

/* OPCIONES — transición entre rondas */
.round-transition-enter-active{animation:roundIn .35s ease;}
.round-transition-leave-active{animation:roundOut .2s ease;}
@keyframes roundIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
@keyframes roundOut{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-8px)}}

/* FOOTER */
.footer-row{width:100%;max-width:900px;display:flex;align-items:center;justify-content:space-between;margin-top:4px;}
.scores{display:flex;gap:20px;}
.score-item{text-align:center;}
.score-num{font-family:'Press Start 2P',monospace;font-size:16px;display:block;}
.score-num.wins{color:#4caf50;}.score-num.losses{color:#ff4444;}
.score-lbl{font-family:'Press Start 2P',monospace;font-size:5px;color:#aaa;}
.next-btn{font-family:'Press Start 2P',monospace;font-size:9px;background:#ffcb05;color:#1a1a2e;border:none;border-radius:30px;padding:14px 28px;cursor:pointer;transition:all .2s;box-shadow:0 4px 0 #b8860b;}
.next-btn:hover{transform:translateY(-2px);box-shadow:0 6px 0 #b8860b;}
.next-btn:active{transform:translateY(2px);box-shadow:0 2px 0 #b8860b;}

/* TRANSITIONS */
.fade-enter-active,.fade-leave-active{transition:opacity .3s;}
.fade-enter-from,.fade-leave-to{opacity:0;}
.pop-enter-active{animation:popIn .35s cubic-bezier(.34,1.56,.64,1);}
.pop-leave-active{animation:popOut .2s ease;}
@keyframes popIn{from{transform:translate(-50%,-50%) scale(0)}to{transform:translate(-50%,-50%) scale(1)}}
@keyframes popOut{from{transform:translate(-50%,-50%) scale(1)}to{transform:translate(-50%,-50%) scale(0)}}
.slide-down-enter-active,.slide-down-leave-active{transition:all .3s ease;}
.slide-down-enter-from,.slide-down-leave-to{opacity:0;transform:translateY(-16px);}
.slide-right-enter-active,.slide-right-leave-active{transition:all .3s ease;}
.slide-right-enter-from{opacity:0;transform:translateX(60px);}
.slide-right-leave-to{opacity:0;transform:translateX(60px);}

/* ── ANIMACIONES DE ATAQUE ── */

/* Pikachu lanza un ataque hacia la derecha */
.player-attack .player-img {
  animation: pikachuAttack 0.6s ease forwards;
}
@keyframes pikachuAttack {
  0%   { transform: scaleX(-1) translateX(0)    scale(1); }
  30%  { transform: scaleX(-1) translateX(-30px) scale(1.15); }
  55%  { transform: scaleX(-1) translateX(-80px) scale(1.2); }
  75%  { transform: scaleX(-1) translateX(-60px) scale(1.1); }
  100% { transform: scaleX(-1) translateX(0)    scale(1); }
}

/* Flash amarillo en Pikachu al atacar */
.player-attack .player-img::after {
  content: '';
  position: absolute; inset: 0;
  background: rgba(255, 203, 5, 0.6);
  border-radius: 50%;
  animation: attackFlash 0.4s ease;
}
@keyframes attackFlash {
  0%   { opacity: 0; transform: scale(0.5); }
  40%  { opacity: 1; transform: scale(1.4); }
  100% { opacity: 0; transform: scale(1); }
}

/* El enemigo recibe el golpe */
.enemy-hit {
  animation: enemyTakeHit 0.6s ease;
}
@keyframes enemyTakeHit {
  0%   { transform: translateX(0)   opacity(1); filter: none; }
  20%  { transform: translateX(18px); filter: brightness(3) saturate(0); }
  40%  { transform: translateX(-12px); opacity: 0.5; }
  60%  { transform: translateX(10px); filter: brightness(2); }
  80%  { transform: translateX(-6px); opacity: 0.8; }
  100% { transform: translateX(0);   opacity: 1; filter: none; }
}

/* Pikachu recibe el golpe */
.player-hit .player-img {
  animation: pikachuTakeHit 0.6s ease;
}
@keyframes pikachuTakeHit {
  0%   { transform: scaleX(-1) translateX(0); filter: drop-shadow(2px 4px 4px rgba(0,0,0,.4)); }
  20%  { transform: scaleX(-1) translateX(14px); filter: brightness(3) saturate(0); }
  40%  { transform: scaleX(-1) translateX(-10px); opacity: 0.5; }
  60%  { transform: scaleX(-1) translateX(8px); filter: brightness(2); }
  80%  { transform: scaleX(-1) translateX(-4px); opacity: 0.8; }
  100% { transform: scaleX(-1) translateX(0); filter: drop-shadow(2px 4px 4px rgba(0,0,0,.4)); }
}

/* ── POKÉDEX — celdas más grandes ── */
.pokedex-grid {
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)) !important;
  gap: 10px !important;
}
.pokedex-cell {
  padding: 12px 6px !important;
}
.pokedex-cell img {
  width: 72px !important;
  height: 72px !important;
}
.cell-number { font-size: 6px !important; }
.cell-name   { font-size: 6px !important; }
.cell-level  { font-size: 6px !important; }

@media(max-width:600px){
  .main-content{padding:12px;}
  .battle-scene{height:200px;}
  .player-img{width:64px;height:64px;}
  .question-text{font-size:14px;}
  .logo{font-size:9px;}
  .next-btn{font-size:7px;padding:10px 18px;}
  .title-text{display:none;}
}
</style>