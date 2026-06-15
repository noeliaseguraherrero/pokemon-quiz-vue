<template>
  <div class="select-root">
    <div class="select-bg">
      <div v-for="n in bgNumbers" :key="n" class="bg-poke">
        <img :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${n}.svg`" />
      </div>
    </div>
    <div class="overlay"></div>

    <div class="select-content">
      <div class="select-logo">ELIGE TU<br><span>PERSONAJE</span></div>

      <div class="characters-grid">
        <div
          v-for="char in CHARACTERS" :key="char.id"
          class="char-card"
          :class="{ selected: selected?.id === char.id }"
          :style="{ '--char-color': char.color }"
          @click="selected = char"
        >
          <!-- Datos guardados de este personaje -->
          <div class="char-save-info">
            <span v-if="getSavedLevel(char)" class="save-badge">
              LV.{{ getSavedLevel(char) }} · {{ getSavedPokedex(char) }}/151
            </span>
          </div>

          <div class="char-sprite-wrap">
            <img :src="char.sprite" :alt="char.name" class="char-sprite"
            />
          </div>

          <div class="char-name" :style="{ color: char.color }">{{ char.name }}</div>
          <div class="char-desc">{{ char.description }}</div>

          <div v-if="selected?.id === char.id" class="char-selected-dot"></div>
        </div>
      </div>

      <transition name="fade">
        <div v-if="selected" class="select-actions">
          <button class="play-btn" :style="{ background: selected.color, boxShadow: `0 4px 0 ${darken(selected.color)}` }" @click="confirm">
            ▶ JUGAR CON {{ selected.name }}
          </button>
          <button class="delete-btn" @click="deleteConfirm = true" v-if="getSavedLevel(selected)">
            🗑 BORRAR PARTIDA
          </button>
        </div>
      </transition>

      <!-- Confirmar borrado -->
      <transition name="fade">
        <div v-if="deleteConfirm" class="delete-overlay" @click.self="deleteConfirm = false">
          <div class="delete-box">
            <div class="delete-title">¿BORRAR PARTIDA?</div>
            <div class="delete-sub">Se perderán todos los datos de {{ selected?.name }}</div>
            <div class="delete-btns">
              <button class="del-btn confirm" @click="deleteCharacter">SÍ, BORRAR</button>
              <button class="del-btn cancel" @click="deleteConfirm = false">CANCELAR</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CHARACTERS } from '../composables/useCharacters'
import type { Character } from '../composables/useCharacters'
import { loadData, clearAllCharacterData } from '../composables/useStorage'

const emit = defineEmits<{ select: [char: Character] }>()

const selected      = ref<Character | null>(null)
const deleteConfirm = ref(false)

const bgNumbers = [6, 9, 25, 150, 3, 131, 94, 143, 130, 149]

function getSavedLevel(char: Character): number {
  return loadData<number>('level', 0, char.storageKey)
}

function getSavedPokedex(char: Character): number {
  return loadData<unknown[]>('pokedex', [], char.storageKey).length
}

function darken(hex: string): string {
  // Oscurece el color del botón para el box-shadow
  try {
    const n = parseInt(hex.slice(1), 16)
    const r = Math.max(0, (n >> 16) - 40)
    const g = Math.max(0, ((n >> 8) & 0xff) - 40)
    const b = Math.max(0, (n & 0xff) - 40)
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
  } catch { return '#000' }
}

function confirm() {
  if (selected.value) emit('select', selected.value)
}

function deleteCharacter() {
  if (!selected.value) return
  clearAllCharacterData(selected.value.storageKey)
  deleteConfirm.value = false
  // Fuerza re-render
  const tmp = selected.value
  selected.value = null
  setTimeout(() => { selected.value = tmp }, 50)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;800&display=swap');
* { box-sizing: border-box; }

.select-root {
  width: 100vw; min-height: 100vh;
  background: radial-gradient(ellipse at 30% 40%, #1a3a6e 0%, #0f1e3d 40%, #0a0a1a 100%);
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden; padding: 20px;
}

.select-bg {
  position: absolute; inset: 0; pointer-events: none;
  display: flex; flex-wrap: wrap; gap: 0;
}
.bg-poke {
  position: absolute;
}
.bg-poke:nth-child(1)  { top: 5%;  left: 2%;  }
.bg-poke:nth-child(2)  { top: 10%; right: 3%; }
.bg-poke:nth-child(3)  { top: 60%; left: 5%;  }
.bg-poke:nth-child(4)  { top: 70%; right: 2%; }
.bg-poke:nth-child(5)  { top: 30%; left: 48%; }
.bg-poke:nth-child(6)  { bottom: 5%; left: 30%; }
.bg-poke:nth-child(7)  { top: 45%; right: 20%; }
.bg-poke:nth-child(8)  { bottom: 10%; right: 35%; }
.bg-poke:nth-child(9)  { top: 20%; left: 20%; }
.bg-poke:nth-child(10) { bottom: 20%; left: 60%; }
.bg-poke img {
  width: 80px; opacity: 0.08;
  filter: brightness(0) invert(1);
  animation: floatBg 6s ease-in-out infinite;
}
@keyframes floatBg {
  0%,100% { transform: translateY(0); }
  50%     { transform: translateY(-12px); }
}

.overlay {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 20%, rgba(0,0,0,0.6) 100%);
  pointer-events: none;
}

.select-content {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center; gap: 28px;
  width: 100%; max-width: 860px;
}

.select-logo {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(14px, 3vw, 22px);
  color: #aac8ff; text-align: center; line-height: 1.6;
  animation: fadeSlide .7s ease both;
}
.select-logo span {
  color: #ffcb05;
  text-shadow: 2px 2px 0 #b8860b;
  font-size: clamp(20px, 4vw, 34px);
}
@keyframes fadeSlide {
  from { opacity: 0; transform: translateY(-16px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* GRID */
.characters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 16px; width: 100%;
}

.char-card {
  background: rgba(255,255,255,0.04);
  border: 2px solid rgba(255,255,255,0.1);
  border-radius: 16px; padding: 20px 16px;
  cursor: pointer; transition: all .25s ease;
  display: flex; flex-direction: column; align-items: center; gap: 10px;
  position: relative; overflow: hidden;
}
.char-card::before {
  content: '';
  position: absolute; inset: 0;
  background: linear-gradient(135deg, var(--char-color, #fff) 0%, transparent 60%);
  opacity: 0; transition: opacity .25s;
  border-radius: 14px;
}
.char-card:hover { border-color: var(--char-color); transform: translateY(-4px); }
.char-card:hover::before { opacity: 0.07; }
.char-card.selected {
  border-color: var(--char-color);
  background: rgba(255,255,255,0.08);
  transform: translateY(-4px);
  box-shadow: 0 8px 30px color-mix(in srgb, var(--char-color) 40%, transparent);
}
.char-card.selected::before { opacity: 0.1; }

.char-save-info { position: absolute; top: 10px; right: 10px; }
.save-badge {
  font-family: 'Press Start 2P', monospace; font-size: 6px;
  background: rgba(255,255,255,0.1); color: #aaa;
  padding: 3px 7px; border-radius: 10px;
  border: 1px solid rgba(255,255,255,0.15);
}
.save-badge.new { color: #4caf50; border-color: rgba(76,175,80,0.4); background: rgba(76,175,80,0.1); }

.char-sprite-wrap {
  width: 100px; height: 100px;
  display: flex; align-items: center; justify-content: center;
  background: rgba(255,255,255,0.05); border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.1);
  overflow: hidden;
  transition: all .25s;
}
.char-card.selected .char-sprite-wrap {
  border-color: var(--char-color);
  box-shadow: 0 0 20px color-mix(in srgb, var(--char-color) 50%, transparent);
}
.char-sprite {
  width: 100%;
  height: 100%;
  object-fit: cover;         /* Hace el zoom permanente al busto */
  object-position: top center; /* Centra la cara */
  image-rendering: pixelated;
  transition: transform .25s;
}
.char-card:hover .char-sprite { transform: scale(1.07); }
.char-card:hover .char-sprite-wrap {
  border-color: var(--char-color);
  box-shadow: 0 0 15px color-mix(in srgb, var(--char-color) 60%, transparent);
}
.char-card:hover { 
  border-color: var(--char-color); 
  transform: translateY(-4px); 
  /* Añade un ligero aura también a la tarjeta para que todo cohesione */
  box-shadow: 0 4px 20px color-mix(in srgb, var(--char-color) 15%, transparent);
}

.char-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px; letter-spacing: 1px;
}
.char-desc {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px; color: #888; text-align: center; line-height: 1.8;
}

.char-selected-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--char-color);
  box-shadow: 0 0 8px var(--char-color);
  animation: pulse .8s ease infinite;
}
@keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.4)} }

/* ACCIONES */
.select-actions {
  display: flex; gap: 14px; align-items: center; flex-wrap: wrap; justify-content: center;
}
.play-btn {
  font-family: 'Press Start 2P', monospace; font-size: 11px;
  color: #1a1a2e; border: none; border-radius: 30px;
  padding: 16px 32px; cursor: pointer; transition: all .2s;
}
.play-btn:hover { transform: translateY(-2px); filter: brightness(1.1); }
.play-btn:active { transform: translateY(2px); }

.delete-btn {
  font-family: 'Press Start 2P', monospace; font-size: 8px;
  background: rgba(255,68,68,0.12); color: #ff4444;
  border: 1px solid rgba(255,68,68,0.3); border-radius: 20px;
  padding: 10px 16px; cursor: pointer; transition: all .2s;
}
.delete-btn:hover { background: rgba(255,68,68,0.22); }

/* BORRAR */
.delete-overlay {
  position: fixed; inset: 0; z-index: 50;
  background: rgba(0,0,0,0.7);
  display: flex; align-items: center; justify-content: center;
}
.delete-box {
  background: #0d1117; border: 2px solid #ff4444;
  border-radius: 16px; padding: 28px 36px;
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  text-align: center;
}
.delete-title { font-family: 'Press Start 2P', monospace; font-size: 13px; color: #ff4444; }
.delete-sub   { font-family: 'Press Start 2P', monospace; font-size: 7px; color: #aaa; line-height: 1.8; }
.delete-btns  { display: flex; gap: 12px; }
.del-btn {
  font-family: 'Press Start 2P', monospace; font-size: 8px;
  border: none; border-radius: 20px; padding: 11px 20px; cursor: pointer; transition: all .2s;
}
.del-btn.confirm { background: #ff4444; color: #fff; box-shadow: 0 3px 0 #a02020; }
.del-btn.confirm:hover { transform: translateY(-2px); }
.del-btn.cancel  { background: rgba(255,255,255,.08); color: #aaa; border: 1px solid rgba(255,255,255,.15); }
.del-btn.cancel:hover { background: rgba(255,255,255,.14); }

/* Transición */
.fade-enter-active,.fade-leave-active { transition: opacity .25s ease; }
.fade-enter-from,.fade-leave-to { opacity: 0; }

/* Deja tu @media modificado así: */
@media (max-width: 500px) {
  .characters-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
  .char-card { padding: 14px 10px; }
  .char-sprite-wrap { width: 72px; height: 72px; }
  /* ❌ BORRAMOS LA CLASE .char-sprite DE AQUÍ DENTRO */
  .char-name { font-size: 8px; }
  .char-desc { display: none; }
  .play-btn { font-size: 9px; padding: 13px 24px; }
}
</style>