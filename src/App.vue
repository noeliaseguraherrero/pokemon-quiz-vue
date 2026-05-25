<template>
  <IntroScreen v-if="screen === 'intro'" @start="startGame" />
  <PokemonGame v-else @go-intro="goToIntro" />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IntroScreen from './modules/pokemon/pages/IntroScreen.vue'
import PokemonGame from './modules/pokemon/pages/PokemonGame.vue'

const screen = ref<'intro' | 'game'>('intro')
function startGame()  { screen.value = 'game'  }
function goToIntro()  { screen.value = 'intro' }
</script>