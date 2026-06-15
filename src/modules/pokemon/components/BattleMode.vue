<template>
  <div class="battle-page-root" :style="{ '--char-color': props.character.color }">
    <div class="battle-panel">
      
      <header class="panel-header">
        <h2 class="panel-title">CAMPAÑA CONTRA VILLANOS</h2>
        <button class="close-btn" @click="emit('closeBattle')" title="Huir al Quiz">✕ HUIR</button>
      </header>

      <div v-if="phase === 'select'" class="select-phase-container">
        <div class="select-info">
          Entrenador <strong>{{ props.character.name }}</strong>, selecciona hasta <strong>3 Pokémon</strong> de tu Pokédex para combatir:
        </div>

        <div v-if="localUnlockedPokemons.length === 0" class="empty-dex">
          No tienes Pokémon en tu Pokédex.<br>¡Regresa al Quiz y captura algunos primero!
        </div>

        <div v-else class="poke-select-grid">
          <div 
            v-for="poke in localUnlockedPokemons" 
            :key="poke.id"
            class="poke-select-card"
            :class="{ 
              selected: isSelected(poke.id),
              disabled: !isSelected(poke.id) && selectedIds.length >= 3
            }"
            @click="toggleSelect(poke.id)"
          >
            <span v-if="isSelected(poke.id)" class="select-badge">
              {{ selectedIds.indexOf(poke.id) + 1 }}
            </span>
            <img 
              :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${poke.id}.png`" 
              :alt="poke.name" 
            />
            <span class="poke-select-name">{{ poke.name }}</span>
          </div>
        </div>

        <div class="select-footer">
          <span class="select-count">Seleccionados: {{ selectedIds.length }} / 3</span>
          <button 
            class="start-battle-btn" 
            :disabled="selectedIds.length === 0"
            @click="handleStart('rocket_recruit')"
          >
            ¡INICIAR COMBATE! ⚔️
          </button>
        </div>
      </div>

      <div v-else-if="phase === 'loading'" class="loading-battle">
        <div class="pokeball-spin"></div>
        <p class="loading-text">PREPARANDO LA ARENA DE COMBATE...</p>
      </div>

      <div v-else-if="phase === 'battle'" class="battle-arena-container">
        <div class="battle-header">
          <div class="trainer-tag">
            <img class="trainer-mini" :src="props.character.sprite" alt="Jugador" />
            <span>{{ props.character.name }}</span>
          </div>
          <span class="vs-badge">VS</span>
          <div class="trainer-tag">
            <span>{{ enemyCharacter?.name }}</span>
          </div>
        </div>

        <div class="battle-arena">
          <div class="team-row enemy-row">
            <div 
              v-for="(poke, i) in enemyTeam" 
              :key="'enemy-' + i"
              class="team-slot"
              :class="{ 
                active: enemyActive === i, 
                fainted: poke.hp <= 0,
                'anim-attack': animating === 'enemy-attack' && enemyActive === i,
                'anim-hit': animating === 'player-attack' && enemyActive === i
              }"
            >
              <img class="battle-sprite enemy-sprite" :src="poke.sprite" :alt="poke.name" />
              <div class="slot-info">
                <span class="slot-name">{{ poke.name.toUpperCase() }}</span>
                <div class="slot-hp-bar">
                  <div 
                    class="slot-hp-fill" 
                    :style="{ 
                      width: (poke.hp / poke.maxHp * 100) + '%', 
                      background: hpColor(poke.hp / poke.maxHp * 100) 
                    }"
                  ></div>
                </div>
                <span class="slot-hp-text">{{ poke.hp }} / {{ poke.maxHp }} HP</span>
              </div>
            </div>
          </div>

          <div class="team-row">
            <div 
              v-for="(poke, i) in playerTeam" 
              :key="'player-' + i"
              class="team-slot"
              :class="{ 
                active: playerActive === i, 
                fainted: poke.hp <= 0,
                'anim-attack': animating === 'player-attack' && playerActive === i,
                'anim-hit': animating === 'enemy-attack' && playerActive === i
              }"
            >
              <img class="battle-sprite player-sprite" :src="poke.sprite" :alt="poke.name" />
              <div class="slot-info">
                <span class="slot-name">{{ poke.name.toUpperCase() }}</span>
                <div class="slot-hp-bar">
                  <div 
                    class="slot-hp-fill" 
                    :style="{ 
                      width: (poke.hp / poke.maxHp * 100) + '%', 
                      background: hpColor(poke.hp / poke.maxHp * 100) 
                    }"
                  ></div>
                </div>
                <span class="slot-hp-text">{{ poke.hp }} / {{ poke.maxHp }} HP</span>
              </div>
            </div>
          </div>
        </div>

        <div class="battle-log" ref="logRef">
          <div 
            v-for="(log, i) in battleLog" 
            :key="i" 
            class="log-line" 
            :class="log.type"
          >
            {{ log.text }}
          </div>
        </div>

        <button 
          class="turn-btn" 
          :disabled="battleRunning" 
          @click="executeTurn"
        >
          {{ battleRunning ? 'COMBATIENDO...' : '▶ SELECCIONAR ATAQUE' }}
        </button>
      </div>

      <div v-else-if="phase === 'result'" class="result-screen" :class="winner">
        <div class="result-icon">{{ winner === 'player' ? '🏆' : '💥' }}</div>
        <h3 class="result-title">{{ winner === 'player' ? '¡VICTORIA!' : 'DERROTA' }}</h3>
        <p class="result-sub">
          {{ winner === 'player' ? '¡Has repelido los planes del equipo villano con éxito!' : 'Tus Pokémon se han debilitado...' }}
        </p>

        <div class="result-btns">
          <button class="result-btn retry" @click="resetBattle">VOLVER A INTENTAR</button>
          <button class="result-btn close" @click="emit('closeBattle')">SALIR AL MAPA</button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted, computed } from 'vue'
import { useBattle } from '../composables/useBattle'
import type { Character } from '../composables/useCharacters'
import type { UnlockedPokemon } from '../composables/usePokemonGame'

interface Props {
  character:        Character
  unlockedPokemons?: UnlockedPokemon[] // Opcional para evitar errores en App.vue
}

const props = defineProps<Props>()

const emit = defineEmits<{
  closeBattle: []
}>()

const {
  phase, playerTeam, enemyTeam,
  playerActive, enemyActive,
  battleLog, winner, enemyCharacter,
  animating, battleRunning,
  startBattle, executeTurn, resetBattle,
} = useBattle()

const selectedIds = ref<number[]>([])
const logRef      = ref<HTMLElement | null>(null)

// Propiedad computada para obtener los Pokémon desbloqueados (por props o localStorage)
const localUnlockedPokemons = computed<UnlockedPokemon[]>(() => {
  if (props.unlockedPokemons) return props.unlockedPokemons
  
  // Si App.vue no los pasa, los recuperamos del almacenamiento usando la clave del personaje elegido
  const saveKey = `pokequiz_save_${props.character.storageKey}`
  const saveData = JSON.parse(localStorage.getItem(saveKey) || '{}')
  return saveData.unlockedPokemons || []
})

function isSelected(id: number)  { return selectedIds.value.includes(id) }

function toggleSelect(id: number) {
  if (isSelected(id)) {
    selectedIds.value = selectedIds.value.filter(i => i !== id)
  } else if (selectedIds.value.length < 3) {
    selectedIds.value.push(id)
  }
}

// Ahora pasamos la lista correcta cargada localmente al iniciar la batalla
function handleStart(villainId: string) {
  startBattle(selectedIds.value, villainId)
}

function hpColor(pct: number) {
  if (pct > 50) return '#44cc44'
  if (pct > 25) return '#ffcc00'
  return '#ff4444'
}

// Auto-scroll del log de batalla
watch(battleLog, async () => {
  await nextTick()
  if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight
}, { deep: true })

// Si el usuario sale de la página por completo, limpiamos el estado del combate
onUnmounted(() => {
  resetBattle()
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;700;800&display=swap');
* { box-sizing: border-box; }

/* CAMBIADO: Ahora es un root fullscreen e independiente */
.battle-page-root {
  position: fixed; inset: 0; z-index: 100;
  width: 100vw; height: 100vh;
  background: #090d13;
  display: flex; align-items: stretch; justify-content: stretch;
}

/* CAMBIADO: Se adapta a toda la pantalla */
.battle-panel {
  background: #0d1117;
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
  overflow: hidden;
}

/* HEADER */
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px;
  border-bottom: 2px solid var(--char-color, #e3350d);
  background: rgba(0, 0, 0, 0.2);
}
.panel-title { font-family: 'Press Start 2P', monospace; font-size: 14px; color: var(--char-color, #e3350d); margin: 0; }
.close-btn   { 
  background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); 
  color: #ff4444; font-size: 10px; cursor: pointer; font-family: 'Press Start 2P', monospace;
  padding: 8px 16px; border-radius: 6px; transition: all 0.2s;
}
.close-btn:hover { background: rgba(255, 68, 68, 0.15); color: #fff; border-color: #ff4444; }

/* SELECCIÓN */
.select-phase-container {
  display: flex; flex-direction: column; flex: 1; overflow: hidden;
}
.select-info {
  font-family: 'Press Start 2P', monospace; font-size: 10px;
  color: #aaa; padding: 20px; line-height: 1.8;
}
.select-info strong { color: #ffcb05; }

.empty-dex {
  font-family: 'Press Start 2P', monospace; font-size: 10px;
  color: #555; text-align: center; padding: 60px 20px; line-height: 2; flex: 1;
}

.poke-select-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 12px; padding: 12px 20px; flex: 1; overflow-y: auto;
}
.poke-select-grid::-webkit-scrollbar { width: 4px; }
.poke-select-grid::-webkit-scrollbar-thumb { background: #333; border-radius: 2px; }

.poke-select-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 14px 10px; border-radius: 12px; cursor: pointer;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  transition: all .18s; position: relative;
}
.poke-select-card:hover:not(.disabled) {
  border-color: rgba(255,203,5,0.5);
  background: rgba(255,203,5,0.08);
  transform: translateY(-2px);
}
.poke-select-card.selected {
  border-color: #ffcb05;
  background: rgba(255,203,5,0.15);
}
.poke-select-card.disabled { opacity: 0.25; cursor: not-allowed; }
.poke-select-card img { width: 74px; height: 74px; image-rendering: pixelated; }
.poke-select-name {
  font-family: 'Press Start 2P', monospace; font-size: 7px;
  color: #ccc; text-align: center; text-transform: capitalize; line-height: 1.4;
}
.select-badge {
  position: absolute; top: 6px; right: 6px;
  width: 20px; height: 20px; border-radius: 50%;
  background: #ffcb05; color: #1a1a2e;
  font-family: 'Press Start 2P', monospace; font-size: 8px;
  display: flex; align-items: center; justify-content: center;
}

.select-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px; border-top: 1px solid rgba(255,255,255,0.06);
  background: rgba(0, 0, 0, 0.1);
}
.select-count { font-family: 'Press Start 2P', monospace; font-size: 10px; color: #888; }
.start-battle-btn {
  font-family: 'Press Start 2P', monospace; font-size: 11px;
  background: var(--char-color, #e3350d); color: #fff; border: none;
  border-radius: 25px; padding: 14px 28px; cursor: pointer;
  transition: all .2s; box-shadow: 0 4px 0 rgba(0,0,0,0.3);
}
.start-battle-btn:hover:not(:disabled) { transform: translateY(-2px); filter: brightness(1.1); }
.start-battle-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

/* LOADING */
.loading-battle {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 25px; flex: 1; padding: 20px;
}
.pokeball-spin {
  width: 60px; height: 60px; border-radius: 50%;
  border: 5px solid #333; border-top-color: var(--char-color, #e3350d);
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.loading-text { font-family: 'Press Start 2P', monospace; font-size: 10px; color: #ffcb05; animation: pulse 1.2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.3} }

/* BATALLA */
.battle-arena-container {
  display: flex; flex-direction: column; flex: 1; overflow: hidden;
}
.battle-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 16px 20px; background: rgba(0,0,0,0.15);
}
.trainer-tag {
  display: flex; align-items: center; gap: 10px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 8px 14px;
}
.trainer-mini { width: 36px; height: 36px; image-rendering: pixelated; }
.trainer-tag span { font-family: 'Press Start 2P', monospace; font-size: 9px; color: #fff; }
.vs-badge {
  font-family: 'Press Start 2P', monospace; font-size: 16px;
  color: var(--char-color, #e3350d); text-shadow: 0 0 10px rgba(227,53,13,0.4);
}

.battle-arena {
  display: flex; flex-direction: column; gap: 16px;
  padding: 20px; background: rgba(255,255,255,0.01);
  border-bottom: 1px solid rgba(255,255,255,0.06);
  flex: 1; justify-content: center;
}

.team-row { display: flex; gap: 12px; width: 100%; }
.enemy-row { flex-direction: row-reverse; }

.team-slot {
  flex: 1; display: flex; align-items: center; gap: 12px;
  background: rgba(255,255,255,0.03);
  border: 2px solid rgba(255,255,255,0.06);
  border-radius: 14px; padding: 12px;
  transition: all .2s; opacity: 0.4;
}
.team-slot.active {
  border-color: #ffcb05;
  background: rgba(255,203,5,0.06);
  opacity: 1;
  box-shadow: 0 0 15px rgba(255,203,5,0.1);
}
.team-slot.fainted { opacity: 0.15; filter: grayscale(1); }

.battle-sprite { width: 80px; height: 80px; image-rendering: pixelated; flex-shrink: 0; }
.enemy-sprite  { filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5)); }
.player-sprite { filter: drop-shadow(0 3px 6px rgba(0,0,0,0.5)); }

/* Animaciones */
.anim-attack { animation: slotAttack .4s ease; }
@keyframes slotAttack {
  0%   { transform: translateX(0); }
  40%  { transform: translateX(25px) scale(1.05); }
  100% { transform: translateX(0); }
}
.anim-hit { animation: slotHit .4s ease; }
@keyframes slotHit {
  0%,100%{ opacity:1; }
  25%    { opacity:.3; transform: translateX(6px); filter: brightness(2); }
  75%    { opacity:.7; transform: translateX(-4px); }
}

.slot-info  { flex: 1; display: flex; flex-direction: column; gap: 6px; min-width: 0; }
.slot-name  { font-family: 'Press Start 2P', monospace; font-size: 8px; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.slot-hp-bar{ height: 8px; background: rgba(0,0,0,0.4); border-radius: 4px; overflow: hidden; }
.slot-hp-fill{ height: 100%; border-radius: 4px; transition: width .3s ease; }
.slot-hp-text{ font-family: 'Press Start 2P', monospace; font-size: 6px; color: #888; }

/* LOG */
.battle-log {
  height: 140px; overflow-y: auto; padding: 14px 20px;
  display: flex; flex-direction: column; gap: 6px;
  background: rgba(0,0,0,0.2);
  scrollbar-width: thin; scrollbar-color: #333 transparent;
}
.battle-log::-webkit-scrollbar { width: 4px; }
.battle-log::-webkit-scrollbar-thumb { background: #333; }

.log-line {
  font-family: 'Press Start 2P', monospace; font-size: 8px;
  line-height: 1.8; padding: 4px 8px; border-radius: 6px;
}
.log-line.info   { color: #aaa; }
.log-line.player { color: #4caf50; background: rgba(76,175,80,0.06); }
.log-line.enemy  { color: #ff7043; background: rgba(255,112,67,0.06); }
.log-line.win    { color: #ffcb05; background: rgba(255,203,5,0.1); font-size: 10px; }
.log-line.lose   { color: #ff4444; background: rgba(255,68,68,0.1); font-size: 10px; }

.turn-btn {
  font-family: 'Press Start 2P', monospace; font-size: 11px;
  background: var(--char-color, #e3350d); color: #fff; border: none;
  margin: 16px 20px; border-radius: 25px; padding: 16px;
  cursor: pointer; transition: all .2s; box-shadow: 0 4px 0 rgba(0,0,0,0.2);
}
.turn-btn:hover:not(:disabled) { transform: translateY(-1px); filter: brightness(1.1); }
.turn-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }

/* RESULTADO */
.result-screen {
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 20px; flex: 1; padding: 40px 20px; text-align: center;
}
.result-screen.player .result-title { color: #ffcb05; }
.result-screen.enemy  .result-title { color: #ff4444; }
.result-icon  { font-size: 64px; }
.result-title { font-family: 'Press Start 2P', monospace; font-size: 24px; margin: 0; }
.result-sub   { font-family: 'Press Start 2P', monospace; font-size: 9px; color: #aaa; line-height: 1.8; max-width: 400px; }

.result-btns { display: flex; gap: 16px; margin-top: 12px; }
.result-btn {
  font-family: 'Press Start 2P', monospace; font-size: 9px;
  border: none; border-radius: 25px; padding: 14px 24px; cursor: pointer; transition: all .2s;
}
.result-btn.retry { background: var(--char-color, #e3350d); color: #fff; }
.result-btn.retry:hover { filter: brightness(1.15); }
.result-btn.close { background: rgba(255,255,255,.05); color: #ccc; border: 1px solid rgba(255,255,255,.1); }
.result-btn.close:hover { background: rgba(255,255,255,.1); color: #fff; }
</style>
