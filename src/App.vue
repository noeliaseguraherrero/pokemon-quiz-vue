<template>
  <IntroScreen
    v-if="screen === 'intro'"
    @start="screen = 'select'"
  />
  <CharacterSelect
    v-else-if="screen === 'select'"
    @select="handleCharacterSelect"
  />
  <PokemonGame
    v-else-if="screen === 'game' && activeCharacter"
    :character="activeCharacter"
    @go-intro="screen = 'intro'"
    @change-character="screen = 'select'"
    @open-battle="screen = 'battle'" 
  />
  <BattleMode
    v-else-if="screen === 'battle' && activeCharacter"
    :character="activeCharacter"
    @close-battle="screen = 'game'"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import IntroScreen     from './modules/pokemon/pages/IntroScreen.vue'
import CharacterSelect from './modules/pokemon/pages/CharacterSelect.vue'
import PokemonGame     from './modules/pokemon/pages/PokemonGame.vue'
import BattleMode      from './modules/pokemon/components/BattleMode.vue'
import type { Character } from './modules/pokemon/composables/useCharacters'

const screen          = ref<'intro' | 'select' | 'game' | 'battle'>('intro')
const activeCharacter = ref<Character | null>(null)

function handleCharacterSelect(char: Character) {
  activeCharacter.value = char
  screen.value = 'game'
}
</script>