<template>
  <img
    :src="pokemonImage"
    :class="['pokemon-img', showPokemon ? 'revealed' : 'hidden-poke']"
    alt="Pokémon"
  />
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  pokemonId: number;
  showPokemon?: boolean;
}
const props = withDefaults(defineProps<Props>(), { showPokemon: false });

const pokemonImage = computed(
  () =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${props.pokemonId}.svg`
);
</script>

<style scoped>
.pokemon-img {
  width: 90px; height: 90px;
  image-rendering: pixelated;
  filter: drop-shadow(2px 4px 4px rgba(0,0,0,0.4));
  user-select: none; -webkit-user-drag: none;
  transition: filter 0.4s ease;
}
.hidden-poke { filter: brightness(0) drop-shadow(2px 4px 4px rgba(0,0,0,0.5)); }
.revealed    { animation: reveal 0.5s ease forwards; }

@keyframes reveal {
  from { filter: brightness(0) drop-shadow(2px 4px 4px rgba(0,0,0,0.5)); }
  to   { filter: drop-shadow(2px 4px 4px rgba(0,0,0,0.4)); }
}
</style>