<template>
  <div class="picture-wrap">
    <!-- Destellos shiny sobre la silueta (solo cuando está oculto) -->
    <template v-if="isShiny && !showPokemon">
      <div v-for="s in sparkles" :key="s.id" class="sparkle"
        :style="{
          left:              s.x + '%',
          top:               s.y + '%',
          animationDelay:    s.delay + 's',
          animationDuration: s.dur + 's',
          width:             s.size + 'px',
          height:            s.size + 'px',
        }">
      </div>
    </template>

    <img
      :src="pokemonImage"
      :class="['pokemon-img', showPokemon ? 'revealed' : 'hidden-poke', { shiny: isShiny && showPokemon }]"
      alt="Pokémon"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  pokemonId:   number
  showPokemon?: boolean
  isShiny?:     boolean
}
const props = withDefaults(defineProps<Props>(), {
  showPokemon: false,
  isShiny:     false,
})

// Posiciones fijas de destellos para evitar recalcular
const sparkles = [
  { id:1, x:15, y:10, delay:0,    dur:1.2, size:8  },
  { id:2, x:75, y:20, delay:0.4,  dur:1.5, size:6  },
  { id:3, x:50, y:5,  delay:0.8,  dur:1.1, size:10 },
  { id:4, x:85, y:55, delay:0.2,  dur:1.4, size:7  },
  { id:5, x:10, y:65, delay:0.6,  dur:1.3, size:9  },
  { id:6, x:60, y:80, delay:1.0,  dur:1.2, size:6  },
  { id:7, x:30, y:85, delay:0.3,  dur:1.6, size:8  },
  { id:8, x:90, y:30, delay:0.9,  dur:1.1, size:5  },
]

const pokemonImage = computed(() =>
  props.isShiny && props.showPokemon
    ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${props.pokemonId}.png`
    : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${props.pokemonId}.svg`
)
</script>

<style scoped>
.picture-wrap {
  position: relative;
  display: inline-block;
}

.pokemon-img {
  width: 90px; height: 90px;
  image-rendering: pixelated;
  filter: drop-shadow(2px 4px 4px rgba(0,0,0,.4));
  user-select: none; -webkit-user-drag: none;
  transition: filter .4s ease;
  position: relative; z-index: 1;
}
.hidden-poke { filter: brightness(0) drop-shadow(2px 4px 4px rgba(0,0,0,.5)); }
.revealed    { animation: reveal .5s ease forwards; }
.shiny       { filter: drop-shadow(0 0 10px rgba(255,203,5,1)) drop-shadow(2px 4px 4px rgba(0,0,0,.4)); }

@keyframes reveal {
  from { filter: brightness(0) drop-shadow(2px 4px 4px rgba(0,0,0,.5)); }
  to   { filter: drop-shadow(2px 4px 4px rgba(0,0,0,.4)); }
}

/* Destellos shiny */
.sparkle {
  position: absolute;
  border-radius: 50%;
  background: #ffcb05;
  z-index: 2;
  animation: sparklePop ease-in-out infinite;
  pointer-events: none;
  box-shadow: 0 0 4px rgba(255,203,5,0.8);
}
@keyframes sparklePop {
  0%,100% { transform: scale(0); opacity: 0; }
  50%     { transform: scale(1); opacity: 1; }
}
</style>