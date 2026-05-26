<template>
  <transition name="catchfade">
    <div v-if="visible" class="catch-overlay">
      <div class="catch-content">

        <!-- Pokémon que se desvanece -->
        <img
          class="catch-pokemon"
          :class="{ absorbed: phase >= 1 }"
          :src="`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${pokemonId}.svg`"
          alt="pokemon"
        />

        <!-- Flash de absorción -->
        <div class="absorb-flash" :class="{ active: phase === 1 }"></div>

        <!-- Pokéball -->
        <div class="pokeball-catch" :class="phaseClass">
          <div class="pb-top"></div>
          <div class="pb-middle">
            <div class="pb-btn" :class="{ blink: phase >= 3 }"></div>
          </div>
          <div class="pb-bottom"></div>
        </div>

        <!-- Mensaje -->
        <div class="catch-msg" :class="{ show: phase >= 3 }">
          ¡Atrapado!
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

interface Props {
  pokemonId: number
  trigger:   boolean
}

const props = defineProps<Props>()
const emit  = defineEmits<{ done: [] }>()

const visible    = ref(false)
const phase      = ref(0)
const phaseClass = ref('')

function delay(ms: number) {
  return new Promise<void>(res => setTimeout(res, ms))
}

async function runSequence() {
  visible.value    = true
  phase.value      = 0
  phaseClass.value = 'dropping'

  await delay(350)   // pokéball cae

  phase.value      = 1
  phaseClass.value = 'absorbing'
  await delay(250)   // absorbe al pokémon

  phase.value      = 2
  phaseClass.value = 'caught'
  await delay(200)   // brillo de captura

  phase.value = 3    // muestra "¡Atrapado!"
  await delay(500)

  emit('done')
  await delay(200)
  visible.value = false
  phase.value   = 0
}

watch(() => props.trigger, (val) => {
  if (val) runSequence()
})
</script>

<style scoped>
.catch-overlay {
  position: fixed; inset: 0; z-index: 180;
  background: rgba(0,0,0,0.78);
  display: flex; align-items: center; justify-content: center;
}
.catch-content {
  display: flex; flex-direction: column;
  align-items: center; gap: 20px;
  position: relative;
}

/* Pokémon */
.catch-pokemon {
  width: 120px; height: 120px;
  image-rendering: pixelated;
  filter: drop-shadow(0 0 16px rgba(255,255,255,0.6));
  transition: all 0.3s ease;
  position: relative; z-index: 2;
}
.catch-pokemon.absorbed {
  transform: scale(0.1);
  opacity: 0;
  filter: brightness(10);
}

/* Flash */
.absorb-flash {
  position: absolute;
  width: 160px; height: 160px; border-radius: 50%;
  background: radial-gradient(circle, rgba(255,255,255,0.95) 0%, transparent 70%);
  opacity: 0; pointer-events: none;
  transition: opacity 0.15s ease; z-index: 3;
}
.absorb-flash.active { opacity: 1; }

/* Pokéball */
.pokeball-catch {
  width: 80px; height: 80px; border-radius: 50%;
  position: relative; overflow: hidden;
  border: 4px solid #222;
  box-shadow: 0 4px 20px rgba(0,0,0,0.7), 0 0 0 2px #555;
  transform: translateY(-180px) scale(0.6);
  opacity: 0;
}
.pokeball-catch.dropping {
  animation: pbDrop 0.35s cubic-bezier(0.25,0.46,0.45,0.94) forwards;
}
@keyframes pbDrop {
  0%   { transform: translateY(-180px) scale(0.6) rotate(-20deg); opacity: 0; }
  60%  { transform: translateY(10px)   scale(1.05) rotate(5deg);  opacity: 1; }
  100% { transform: translateY(0px)    scale(1)    rotate(0deg);  opacity: 1; }
}

.pokeball-catch.absorbing {
  transform: translateY(0) scale(1); opacity: 1;
  animation: pbOpen 0.25s ease forwards;
}
@keyframes pbOpen {
  0%   { filter: none; }
  50%  { filter: brightness(3); transform: scale(1.1); }
  100% { filter: none; transform: scale(1); }
}

.pokeball-catch.caught {
  transform: translateY(0) scale(1); opacity: 1;
  animation: pbCaught 0.4s ease forwards;
}
@keyframes pbCaught {
  0%   { box-shadow: 0 4px 20px rgba(0,0,0,0.7), 0 0 0 2px #555; }
  50%  { box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 0 30px rgba(255,203,5,0.9), 0 0 0 3px #ffcb05; transform: scale(1.1); }
  100% { box-shadow: 0 4px 20px rgba(0,0,0,0.7), 0 0 12px rgba(255,203,5,0.4), 0 0 0 2px #ffcb05; transform: scale(1); }
}

.pb-top    { position:absolute; top:0; left:0; right:0; height:50%; background:#e3350d; }
.pb-bottom { position:absolute; bottom:0; left:0; right:0; height:50%; background:#f0f0f0; }
.pb-middle {
  position:absolute; top:50%; left:0; right:0; height:10px;
  background:#222; transform:translateY(-50%);
  display:flex; align-items:center; justify-content:center; z-index:2;
}
.pb-btn {
  width:22px; height:22px; border-radius:50%;
  background:#f0f0f0; border:3px solid #222;
  box-shadow:0 0 0 2px #888; transition: all 0.2s;
}
.pb-btn.blink { animation: btnBlink 0.3s ease 2; }
@keyframes btnBlink {
  0%,100% { background:#f0f0f0; box-shadow:0 0 0 2px #888; }
  50%     { background:#ffcb05; box-shadow:0 0 8px rgba(255,203,5,0.9), 0 0 0 2px #ffcb05; }
}

/* Mensaje */
.catch-msg {
  font-family: 'Press Start 2P', monospace;
  font-size: 18px; color: #ffcb05;
  text-shadow: 2px 2px 0 #b8860b, 0 0 20px rgba(255,203,5,0.6);
  opacity: 0; transform: scale(0.7) translateY(10px);
  transition: all 0.3s cubic-bezier(0.34,1.56,0.64,1);
}
.catch-msg.show { opacity: 1; transform: scale(1) translateY(0); }

.catchfade-enter-active { transition: opacity 0.2s ease; }
.catchfade-leave-active { transition: opacity 0.3s ease; }
.catchfade-enter-from,
.catchfade-leave-to     { opacity: 0; }
</style>