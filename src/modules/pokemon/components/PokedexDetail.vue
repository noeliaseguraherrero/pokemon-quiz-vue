<template>
  <transition name="detail-fade">
    <div v-if="pokemon" class="detail-overlay" @click.self="$emit('close')">
      <div class="detail-panel">

        <!-- Cerrar -->
        <button class="detail-close" @click="$emit('close')">✕</button>

        <!-- Loading -->
        <div v-if="loading" class="detail-loading">
          <div class="pokeball-spin"></div>
        </div>

        <template v-else-if="data">
          <!-- Header -->
          <div class="detail-header">
            <div class="detail-number">#{{ String(pokemon.id).padStart(3,'0') }}</div>
            <div class="detail-name">
              {{ data.name.toUpperCase() }}
              <span v-if="pokemon.isShiny" class="shiny-tag">✨ SHINY</span>
            </div>
            <div class="detail-types">
              <span
                v-for="t in data.types" :key="t"
                class="type-chip"
                :class="t.toLowerCase()"
              >{{ t }}</span>
            </div>
          </div>

          <!-- Sprites -->
          <div class="detail-sprites">
            <div class="sprite-box">
              <img :src="data.spriteNormal" alt="normal" />
              <span class="sprite-label">NORMAL</span>
            </div>
            <div class="sprite-box shiny-box" v-if="data.spriteShiny">
              <img :src="data.spriteShiny" alt="shiny" />
              <span class="sprite-label">✨ SHINY</span>
            </div>
          </div>

          <!-- Descripción -->
          <div class="detail-desc">
            "{{ data.description }}"
          </div>

          <!-- Stats físicos -->
          <div class="detail-stats">
            <div class="phys-stat">
              <span class="phys-icon">📏</span>
              <span class="phys-val">{{ (data.height / 10).toFixed(1) }} m</span>
              <span class="phys-lbl">ALTURA</span>
            </div>
            <div class="phys-divider"></div>
            <div class="phys-stat">
              <span class="phys-icon">⚖️</span>
              <span class="phys-val">{{ (data.weight / 10).toFixed(1) }} kg</span>
              <span class="phys-lbl">PESO</span>
            </div>
            <div class="phys-divider"></div>
            <div class="phys-stat">
              <span class="phys-icon">⬆️</span>
              <span class="phys-val">LV.{{ pokemon.unlockedAt }}</span>
              <span class="phys-lbl">CAPTURADO</span>
            </div>
          </div>

          <!-- Stats de combate -->
          <div class="detail-combat">
            <div class="section-label">ESTADÍSTICAS BASE</div>
            <div v-for="stat in data.stats" :key="stat.name" class="stat-row-bar">
              <span class="stat-name">{{ stat.label }}</span>
              <div class="stat-bar-bg">
                <div class="stat-bar-fill"
                  :style="{ width: (stat.value / 255 * 100) + '%', background: statColor(stat.value) }">
                </div>
              </div>
              <span class="stat-val">{{ stat.value }}</span>
            </div>
          </div>

        </template>

      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UnlockedPokemon } from '../composables/usePokemonGame'

interface Props {
  pokemon: UnlockedPokemon | null
}
const props = defineProps<Props>()
defineEmits<{ close: [] }>()

const loading = ref(false)

const TYPE_TRANSLATIONS: Record<string, string> = {
  normal:'Normal', fire:'Fuego', water:'Agua', electric:'Eléctrico',
  grass:'Planta', ice:'Hielo', fighting:'Lucha', poison:'Veneno',
  ground:'Tierra', flying:'Volador', psychic:'Psíquico', bug:'Bicho',
  rock:'Roca', ghost:'Fantasma', dragon:'Dragón', dark:'Siniestro',
  steel:'Acero', fairy:'Hada',
}

const STAT_LABELS: Record<string, string> = {
  hp:'PS', attack:'ATQ', defense:'DEF',
  'special-attack':'A.ESP', 'special-defense':'D.ESP', speed:'VEL',
}

interface DetailData {
  name: string
  types: string[]
  spriteNormal: string
  spriteShiny:  string
  description:  string
  height: number
  weight: number
  stats: { name: string; label: string; value: number }[]
}

const data = ref<DetailData | null>(null)

function statColor(val: number) {
  if (val >= 100) return '#4caf50'
  if (val >= 60)  return '#ffcc00'
  return '#ff5722'
}

// 1. Definimos las interfaces con la estructura exacta que usamos de la PokéAPI
interface FlavorTextEntry {
  flavor_text: string
  language: {
    name: string
  }
}

interface PokeApiTypeEntry {
  type: {
    name: string
  }
}

interface PokeApiStatEntry {
  base_stat: number
  stat: {
    name: string
  }
}

// 2. Tu función ahora usa tipos estrictos en lugar de 'any'
async function loadDetail(id: number) {
  loading.value = true
  data.value    = null

  try {
    const [pokeRes, specRes] = await Promise.all([
      fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
      fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
    ])
    const pokeData = await pokeRes.json()
    const specData = await specRes.json()

    // Descripción en español tipada correctamente
    const flavorEntries = specData.flavor_text_entries as FlavorTextEntry[]
    const esEntry = flavorEntries.find(e => e.language.name === 'es')
    const enEntry = flavorEntries.find(e => e.language.name === 'en')
    const description = (esEntry ?? enEntry)?.flavor_text
      ?.replace(/\f/g, ' ')
      ?.replace(/\u00ad/g, '')
      ?? 'Sin descripción disponible.'

    data.value = {
      name:         pokeData.name,
      types:        pokeData.types.map((t: PokeApiTypeEntry) => TYPE_TRANSLATIONS[t.type.name] ?? t.type.name),
      spriteNormal: pokeData.sprites.other['official-artwork'].front_default
                 ?? pokeData.sprites.front_default,
      spriteShiny:  pokeData.sprites.other['official-artwork'].front_shiny
                 ?? pokeData.sprites.front_shiny,
      description,
      height:       pokeData.height,
      weight:       pokeData.weight,
      stats: pokeData.stats.map((s: PokeApiStatEntry) => ({
        name:  s.stat.name,
        label: STAT_LABELS[s.stat.name] ?? s.stat.name,
        value: s.base_stat,
      })),
    }
  } catch {
    data.value = null
  } finally {
    loading.value = false
  }
}

watch(() => props.pokemon, (val) => {
  if (val) loadDetail(val.id)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Nunito:wght@400;700;800&display=swap');
* { box-sizing: border-box; }

.detail-overlay {
  position: fixed; inset: 0; z-index: 200;
  background: rgba(0,0,0,0.8);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}
.detail-panel {
  background: #0d1117;
  border: 3px solid #ffcb05;
  border-radius: 20px;
  width: 100%; max-width: 480px;
  max-height: 90vh; overflow-y: auto;
  padding: 24px 20px;
  position: relative;
  scrollbar-width: thin; scrollbar-color: #ffcb05 transparent;
}
.detail-panel::-webkit-scrollbar { width: 4px; }
.detail-panel::-webkit-scrollbar-thumb { background: #ffcb05; border-radius: 2px; }

.detail-close {
  position: absolute; top: 16px; right: 16px;
  background: none; border: none; color: #aaa;
  font-size: 20px; cursor: pointer; padding: 4px;
}
.detail-close:hover { color: #fff; }

/* Loading */
.detail-loading {
  display: flex; justify-content: center; padding: 40px;
}
.pokeball-spin {
  width: 40px; height: 40px; border-radius: 50%;
  border: 3px solid #555; border-top-color: #e3350d;
  animation: spin .8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Header */
.detail-header { text-align: center; margin-bottom: 16px; }
.detail-number {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px; color: #666; margin-bottom: 4px;
}
.detail-name {
  font-family: 'Press Start 2P', monospace;
  font-size: 14px; color: #fff; margin-bottom: 10px;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  flex-wrap: wrap;
}
.shiny-tag {
  font-size: 8px; color: #ffcb05;
  background: rgba(255,203,5,0.15);
  border: 1px solid rgba(255,203,5,0.4);
  padding: 3px 8px; border-radius: 10px;
}
.detail-types { display: flex; gap: 8px; justify-content: center; flex-wrap: wrap; }
.type-chip {
  font-family: 'Press Start 2P', monospace; font-size: 7px;
  padding: 5px 12px; border-radius: 20px; color: #fff;
}
.normal   { background: #A8A878; }
.fuego    { background: #F08030; }
.agua     { background: #6890F0; }
.planta   { background: #78C850; }
.eléctrico{ background: #F8D030; color: #333; }
.hielo    { background: #98D8D8; color: #333; }
.lucha    { background: #C03028; }
.veneno   { background: #A040A0; }
.tierra   { background: #E0C068; color: #333; }
.volador  { background: #A890F0; }
.psíquico { background: #F85888; }
.bicho    { background: #A8B820; }
.roca     { background: #B8A038; }
.fantasma { background: #705898; }
.dragón   { background: #7038F8; }
.siniestro{ background: #705848; }
.acero    { background: #B8B8D0; color: #333; }
.hada     { background: #EE99AC; }

/* Sprites */
.detail-sprites {
  display: flex; gap: 16px; justify-content: center;
  margin-bottom: 16px;
}
.sprite-box {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 12px; padding: 12px;
}
.sprite-box img { width: 96px; height: 96px; image-rendering: pixelated; }
.shiny-box { border-color: rgba(255,203,5,0.35); background: rgba(255,203,5,0.06); }
.sprite-label {
  font-family: 'Press Start 2P', monospace; font-size: 5px; color: #aaa;
}

/* Descripción */
.detail-desc {
  font-family: 'Nunito', sans-serif; font-size: 13px;
  color: #ccc; line-height: 1.7; text-align: center;
  font-style: italic; padding: 12px 16px;
  background: rgba(255,255,255,0.03);
  border-radius: 10px; margin-bottom: 16px;
  border-left: 3px solid #ffcb05;
}

/* Stats físicos */
.detail-stats {
  display: flex; align-items: center; justify-content: center;
  gap: 0; margin-bottom: 20px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 12px; overflow: hidden;
}
.phys-stat {
  flex: 1; display: flex; flex-direction: column;
  align-items: center; gap: 4px; padding: 14px 8px;
}
.phys-icon { font-size: 18px; }
.phys-val  { font-family: 'Press Start 2P', monospace; font-size: 9px; color: #fff; }
.phys-lbl  { font-family: 'Press Start 2P', monospace; font-size: 5px; color: #888; }
.phys-divider { width: 1px; background: rgba(255,255,255,0.08); align-self: stretch; }

/* Stats combate */
.detail-combat { display: flex; flex-direction: column; gap: 8px; }
.section-label {
  font-family: 'Press Start 2P', monospace; font-size: 6px;
  color: #888; letter-spacing: 1px; margin-bottom: 4px;
}
.stat-row-bar {
  display: flex; align-items: center; gap: 8px;
}
.stat-name {
  font-family: 'Press Start 2P', monospace; font-size: 6px;
  color: #aaa; min-width: 40px; text-align: right;
}
.stat-bar-bg {
  flex: 1; height: 8px; background: rgba(0,0,0,0.4);
  border-radius: 4px; overflow: hidden;
}
.stat-bar-fill {
  height: 100%; border-radius: 4px;
  transition: width .6s ease;
}
.stat-val {
  font-family: 'Press Start 2P', monospace; font-size: 7px;
  color: #fff; min-width: 28px; text-align: right;
}

/* Transición */
.detail-fade-enter-active, .detail-fade-leave-active { transition: all .3s ease; }
.detail-fade-enter-from, .detail-fade-leave-to { opacity: 0; transform: scale(0.96); }
</style>