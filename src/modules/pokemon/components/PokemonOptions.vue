<template>
  <div class="options-grid">
    <button
      v-for="({ name, id }, i) in options"
      :key="id"
      class="option-btn"
      :class="{
        'correct-opt': blockSelection && id === correctAnswer,
        'wrong-opt':   blockSelection && id !== correctAnswer && wasSelected(id),
      }"
      :disabled="blockSelection"
      @click="emit('selectedOption', id); markSelected(id)"
    >
      <div class="option-letter">{{ LETTERS[i] }}</div>
      <div class="option-name">{{ name }}</div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import type { Pokemon } from "../interfaces";

const LETTERS = ["A", "B", "C", "D", "E", "F"];

interface Props {
  options: Pokemon[];
  blockSelection: boolean;
  correctAnswer: number;
}
defineProps<Props>();
const emit = defineEmits<{ selectedOption: [id: number] }>();

const selectedId = ref<number | null>(null);
const markSelected = (id: number) => { selectedId.value = id; };
const wasSelected  = (id: number) => selectedId.value === id;
</script>

<style scoped>
.options-grid {
  width: 100%; max-width: 660px;
  display: grid; grid-template-columns: 1fr 1fr;
  gap: 10px; margin-bottom: 12px;
}

.option-btn {
  background: rgba(255,255,255,0.06);
  border: 2px solid rgba(255,255,255,0.15);
  border-radius: 12px; padding: 14px 16px;
  cursor: pointer; transition: all 0.2s;
  display: flex; align-items: center; gap: 10px;
}
.option-btn:hover:not(:disabled) {
  border-color: #ffcb05;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255,203,5,0.2);
}
.option-btn:disabled { cursor: not-allowed; }

.option-letter {
  font-family: 'Press Start 2P', monospace;
  font-size: 8px; width: 26px; height: 26px;
  border-radius: 50%; background: rgba(255,255,255,0.1);
  display: flex; align-items: center; justify-content: center;
  color: #ffcb05; flex-shrink: 0; transition: all 0.2s;
}
.option-name {
  font-size: 15px; font-weight: 700;
  color: #fff; text-transform: capitalize;
}

.correct-opt {
  background: rgba(76,175,80,0.25);
  border-color: #4caf50;
  animation: correctPulse 0.5s ease;
}
.correct-opt .option-letter { background: #4caf50; color: #fff; }

.wrong-opt {
  background: rgba(255,68,68,0.15);
  border-color: #ff4444;
}
.wrong-opt .option-letter { background: #ff4444; color: #fff; }

@keyframes correctPulse {
  0%{transform:scale(1)} 50%{transform:scale(1.04)} 100%{transform:scale(1)}
}
</style>