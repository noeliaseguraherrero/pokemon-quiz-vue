<template>
  <div class="intro-root">

    <!-- Pokémons flotando en el fondo -->
    <div class="bg-pokemon">
      <img v-for="p in bgPokemons" :key="p.id"
        :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${p.id}.svg`"
        class="bg-poke-img"
        :style="{
          left: p.x + '%',
          top:  p.y + '%',
          width: p.size + 'px',
          animationDelay: p.delay + 's',
          animationDuration: p.duration + 's',
          opacity: p.opacity,
        }"
      />
    </div>

    <!-- Overlay oscuro -->
    <div class="overlay"></div>

    <!-- Contenido central -->
    <div class="center-content">

      <!-- Logo -->
      <div class="logo-block">
        <div class="logo-sub">¿QUIÉN ES ESE</div>
        <div class="logo-main">POKÉMON?</div>
        <div class="logo-underline"></div>
      </div>

      <!-- Pokeball animada -->
      <div class="pokeball-wrap" :class="{ opening: opening }" @click="handleStart">
        <div class="pokeball">
          <div class="pokeball-top"></div>
          <div class="pokeball-middle">
            <div class="pokeball-btn"></div>
          </div>
          <div class="pokeball-bottom"></div>
        </div>
        <div class="pokeball-glow"></div>
        <div class="start-label" :class="{ hide: opening }">
          {{ opening ? '' : 'PULSA PARA JUGAR' }}
        </div>
      </div>

      <!-- Descripción -->
      <p class="intro-desc" :class="{ hide: opening }">
        Adivina los 151 Pokémon originales · Sube de nivel · Completa tu Pokédex
      </p>

    </div>

    <!-- Flash de transición -->
    <div class="flash-overlay" :class="{ active: flashing }"></div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const emit = defineEmits<{ start: [] }>()

const opening  = ref(false)
const flashing = ref(false)

// Pokémons de fondo — IDs icónicos repartidos
const bgPokemons = [
  { id: 6,   x: 5,  y: 10, size: 110, delay: 0,   duration: 7,  opacity: 0.18 },
  { id: 9,   x: 80, y: 5,  size: 120, delay: 1,   duration: 8,  opacity: 0.15 },
  { id: 25,  x: 55, y: 70, size: 90,  delay: 0.5, duration: 6,  opacity: 0.20 },
  { id: 150, x: 88, y: 60, size: 130, delay: 2,   duration: 9,  opacity: 0.12 },
  { id: 3,   x: 15, y: 65, size: 100, delay: 1.5, duration: 7,  opacity: 0.16 },
  { id: 131, x: 70, y: 30, size: 115, delay: 0.8, duration: 8,  opacity: 0.14 },
  { id: 54,  x: 38, y: 8,  size: 80,  delay: 2.5, duration: 6,  opacity: 0.18 },
  { id: 39,  x: 92, y: 82, size: 85,  delay: 0.3, duration: 7,  opacity: 0.16 },
  { id: 143, x: 2,  y: 82, size: 120, delay: 1.2, duration: 9,  opacity: 0.13 },
  { id: 94,  x: 48, y: 82, size: 95,  delay: 1.8, duration: 8,  opacity: 0.15 },
  { id: 130, x: 25, y: 35, size: 105, delay: 0.6, duration: 7,  opacity: 0.14 },
  { id: 149, x: 63, y: 55, size: 118, delay: 2.2, duration: 10, opacity: 0.12 },
]

function handleStart() {
  if (opening.value) return
  opening.value = true

  setTimeout(() => { flashing.value = true  }, 900)
  setTimeout(() => { emit('start')           }, 1200)
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;800&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

/* ── ROOT ── */
.intro-root {
  font-family: 'Nunito', sans-serif;
  width: 100vw; height: 100vh;
  background: radial-gradient(ellipse at 30% 40%, #1a3a6e 0%, #0f1e3d 40%, #0a0a1a 100%);
  display: flex; align-items: center; justify-content: center;
  position: relative; overflow: hidden;
}

/* ── BG POKÉMONS ── */
.bg-pokemon { position: absolute; inset: 0; pointer-events: none; }
.bg-poke-img {
  position: absolute;
  filter: brightness(0) invert(1);
  animation: floatPoke linear infinite;
  user-select: none; -webkit-user-drag: none;
}
@keyframes floatPoke {
  0%   { transform: translateY(0px)   rotate(0deg); }
  25%  { transform: translateY(-18px) rotate(2deg); }
  50%  { transform: translateY(-8px)  rotate(-1deg); }
  75%  { transform: translateY(-22px) rotate(1deg); }
  100% { transform: translateY(0px)   rotate(0deg); }
}

/* ── OVERLAY ── */
.overlay {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.55) 100%);
  pointer-events: none;
}

/* ── CENTER ── */
.center-content {
  position: relative; z-index: 10;
  display: flex; flex-direction: column; align-items: center; gap: 32px;
  padding: 20px;
}

/* ── LOGO ── */
.logo-block { text-align: center; }
.logo-sub {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px; color: #aac8ff; letter-spacing: 3px;
  margin-bottom: 10px;
  animation: fadeSlideDown 0.7s ease both;
}
.logo-main {
  font-family: 'Press Start 2P', monospace;
  font-size: clamp(22px, 5vw, 44px);
  color: #ffcb05;
  text-shadow: 4px 4px 0 #b8860b, 0 0 40px rgba(255,203,5,0.4);
  animation: fadeSlideDown 0.7s 0.15s ease both;
  line-height: 1.2;
}
.logo-underline {
  margin: 14px auto 0;
  width: 80px; height: 4px;
  background: linear-gradient(90deg, transparent, #ffcb05, transparent);
  border-radius: 2px;
  animation: fadeSlideDown 0.7s 0.3s ease both;
}
@keyframes fadeSlideDown {
  from { opacity: 0; transform: translateY(-20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* ── POKEBALL ── */
.pokeball-wrap {
  position: relative;
  display: flex; flex-direction: column; align-items: center; gap: 20px;
  cursor: pointer;
  animation: fadeIn 0.7s 0.4s ease both;
}
@keyframes fadeIn { from{opacity:0} to{opacity:1} }

.pokeball {
  width: 120px; height: 120px;
  border-radius: 50%;
  position: relative; overflow: hidden;
  border: 4px solid #222;
  box-shadow: 0 0 0 2px #555, 0 8px 32px rgba(0,0,0,0.6);
  transition: transform 0.2s ease;
}
.pokeball-wrap:hover .pokeball {
  transform: scale(1.07) rotate(-8deg);
}

.pokeball-top {
  position: absolute; top: 0; left: 0; right: 0;
  height: 50%; background: #e3350d;
}
.pokeball-bottom {
  position: absolute; bottom: 0; left: 0; right: 0;
  height: 50%; background: #f0f0f0;
}
.pokeball-middle {
  position: absolute; top: 50%; left: 0; right: 0;
  height: 10px; background: #222;
  transform: translateY(-50%);
  display: flex; align-items: center; justify-content: center;
  z-index: 2;
}
.pokeball-btn {
  width: 28px; height: 28px; border-radius: 50%;
  background: #f0f0f0; border: 4px solid #222;
  box-shadow: 0 0 0 3px #888;
  transition: all 0.3s ease;
}
.pokeball-wrap:hover .pokeball-btn {
  background: #fff;
  box-shadow: 0 0 0 3px #ffcb05, 0 0 12px rgba(255,203,5,0.6);
}

/* Animación apertura */
.pokeball-wrap.opening .pokeball {
  animation: pokeballOpen 1s ease forwards;
}
@keyframes pokeballOpen {
  0%   { transform: scale(1) rotate(0deg); }
  20%  { transform: scale(1.1) rotate(-15deg); }
  40%  { transform: scale(1.1) rotate(15deg); }
  60%  { transform: scale(1.15) rotate(-8deg); }
  75%  { transform: scale(1.2) rotate(5deg); }
  85%  { transform: scale(1.3); box-shadow: 0 0 60px rgba(255,255,255,0.9); }
  100% { transform: scale(2.5); opacity: 0; }
}

.pokeball-glow {
  position: absolute;
  width: 120px; height: 120px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 70%);
  pointer-events: none;
  animation: glowPulse 2s ease infinite;
}
@keyframes glowPulse {
  0%,100% { transform: scale(1);   opacity: 0.6; }
  50%     { transform: scale(1.15); opacity: 1; }
}
.pokeball-wrap.opening .pokeball-glow {
  animation: glowBurst 1s ease forwards;
}
@keyframes glowBurst {
  0%  { transform: scale(1);  opacity: 0.6; }
  80% { transform: scale(3);  opacity: 1; }
  100%{ transform: scale(5);  opacity: 0; }
}

.start-label {
  font-family: 'Press Start 2P', monospace;
  font-size: 9px; color: #ffcb05;
  letter-spacing: 1px;
  animation: labelBlink 1.5s ease infinite;
  transition: opacity 0.2s;
}
.start-label.hide { opacity: 0; }
@keyframes labelBlink {
  0%,100% { opacity: 1; }
  50%     { opacity: 0.4; }
}

/* ── DESCRIPCIÓN ── */
.intro-desc {
  font-family: 'Press Start 2P', monospace;
  font-size: 6px; color: #7a9cc8;
  text-align: center; line-height: 2;
  max-width: 380px;
  animation: fadeIn 0.7s 0.6s ease both;
  transition: opacity 0.3s;
}
.intro-desc.hide { opacity: 0; }

/* ── FLASH ── */
.flash-overlay {
  position: absolute; inset: 0;
  background: #fff; opacity: 0;
  pointer-events: none; z-index: 50;
  transition: opacity 0.3s ease;
}
.flash-overlay.active { opacity: 1; }

/* ── RESPONSIVE ── */
@media (max-width: 500px) {
  .logo-main { font-size: 24px; }
  .pokeball  { width: 96px; height: 96px; }
  .pokeball-glow { width: 96px; height: 96px; }
  .intro-desc { font-size: 5px; }
}
</style>