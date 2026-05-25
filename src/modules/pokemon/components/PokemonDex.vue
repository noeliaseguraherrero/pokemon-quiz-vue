<template>
    <div>
        <!-- Trigger button -->
        <button class="dex-trigger" @click="isOpen = true">
            <span class="dex-icon">📕</span>
            <span>Pokédex</span>
            <span class="dex-count">{{ discoveredCount }}/151</span>
        </button>

        <!-- Modal overlay -->
        <Teleport to="body">
            <Transition name="modal">
                <div v-if="isOpen" class="dex-overlay" @click.self="isOpen = false">
                    <div class="dex-modal">
                        <div class="dex-header">
                            <h2>📕 Pokédex</h2>
                            <div class="dex-progress-info">
                                <span>{{ discoveredCount }} / 151 descubiertos</span>
                                <div class="dex-global-bar">
                                    <div class="dex-global-fill" :style="{ width: (discoveredCount / 151 * 100) + '%' }"></div>
                                </div>
                            </div>
                            <button class="close-btn" @click="isOpen = false">✕</button>
                        </div>

                        <div class="dex-grid">
                            <div
                                v-for="id in 151"
                                :key="id"
                                class="dex-entry"
                                :class="{ discovered: discovered.has(id) }"
                                :title="discovered.has(id) ? getPokemonName(id) : '???'"
                            >
                                <img
                                    :src="getPokemonSprite(id)"
                                    :alt="discovered.has(id) ? getPokemonName(id) : `Pokémon #${id}`"
                                    :class="{ silhouette: !discovered.has(id) }"
                                    loading="lazy"
                                />
                                <span class="dex-id">#{{ String(id).padStart(3, '0') }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Transition>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';

interface Props {
    discovered: Set<number>;
}

const props = defineProps<Props>();
const isOpen = ref(false);
const discoveredCount = computed(() => props.discovered.size);

const pokemonNames: Record<number, string> = {
    1: 'Bulbasaur', 2: 'Ivysaur', 3: 'Venusaur', 4: 'Charmander', 5: 'Charmeleon',
    6: 'Charizard', 7: 'Squirtle', 8: 'Wartortle', 9: 'Blastoise', 10: 'Caterpie',
    11: 'Metapod', 12: 'Butterfree', 13: 'Weedle', 14: 'Kakuna', 15: 'Beedrill',
    25: 'Pikachu', 26: 'Raichu', 39: 'Jigglypuff', 52: 'Meowth', 54: 'Psyduck',
    63: 'Abra', 66: 'Machop', 74: 'Geodude', 92: 'Gastly', 94: 'Gengar',
    104: 'Cubone', 113: 'Chansey', 131: 'Lapras', 132: 'Ditto', 133: 'Eevee',
    143: 'Snorlax', 144: 'Articuno', 145: 'Zapdos', 146: 'Moltres', 150: 'Mewtwo', 151: 'Mew',
};

const getPokemonName = (id: number) => pokemonNames[id] ?? `Pokémon #${id}`;

const getPokemonSprite = (id: number) =>
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/${id}.svg`;
</script>

<style scoped>
.dex-trigger {
    display: flex;
    align-items: center;
    gap: 8px;
    background: white;
    border: 2px solid #e53e3e;
    border-radius: 10px;
    padding: 8px 16px;
    font-size: 0.8rem;
    font-weight: 700;
    color: #e53e3e;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(229, 62, 62, 0.2);
}

.dex-trigger:hover {
    background: #e53e3e;
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(229, 62, 62, 0.3);
}

.dex-icon { font-size: 1rem; }

.dex-count {
    background: #e53e3e;
    color: white;
    border-radius: 20px;
    padding: 2px 8px;
    font-size: 0.7rem;
}

.dex-trigger:hover .dex-count {
    background: white;
    color: #e53e3e;
}

.dex-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
    backdrop-filter: blur(4px);
}

.dex-modal {
    background: white;
    border-radius: 20px;
    width: 100%;
    max-width: 600px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.3);
}

.dex-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 1rem 1.5rem;
    border-bottom: 2px solid #e53e3e;
    background: linear-gradient(135deg, #e53e3e, #c53030);
    color: white;
    flex-wrap: wrap;
}

.dex-header h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 700;
}

.dex-progress-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.75rem;
}

.dex-global-bar {
    height: 6px;
    background: rgba(255,255,255,0.3);
    border-radius: 3px;
    overflow: hidden;
}

.dex-global-fill {
    height: 100%;
    background: white;
    border-radius: 3px;
    transition: width 0.5s;
}

.close-btn {
    background: rgba(255,255,255,0.2);
    border: none;
    border-radius: 50%;
    width: 32px;
    height: 32px;
    color: white;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.close-btn:hover { background: rgba(255,255,255,0.3); }

.dex-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(72px, 1fr));
    gap: 8px;
    padding: 1rem;
    overflow-y: auto;
}

.dex-entry {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px;
    border-radius: 10px;
    border: 2px solid #e2e8f0;
    background: #f7fafc;
    transition: all 0.2s;
    cursor: default;
}

.dex-entry.discovered {
    border-color: #ffd700;
    background: linear-gradient(135deg, #fffbf0, #fef3c7);
}

.dex-entry.discovered:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.dex-entry img {
    width: 48px;
    height: 48px;
    object-fit: contain;
}

.dex-entry img.silhouette {
    filter: brightness(0) opacity(0.15);
}

.dex-id {
    font-size: 0.55rem;
    color: #718096;
    font-weight: 600;
}

.dex-entry.discovered .dex-id {
    color: #b7791f;
}

/* Modal transitions */
.modal-enter-active, .modal-leave-active {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-enter-from, .modal-leave-to {
    opacity: 0;
    transform: scale(0.9);
}
</style>