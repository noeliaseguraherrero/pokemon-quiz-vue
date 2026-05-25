<template>
    <div class="battle-hud">
        <!-- Enemy HUD (top right) -->
        <div class="hud-card enemy-hud">
            <div class="hud-header">
                <span class="pokemon-label">{{ pokemonName || '???' }}</span>
                <span class="level-badge">Nv.{{ enemyLevel }}</span>
            </div>
            <div class="hp-row">
                <span class="hp-label">PS</span>
                <div class="hp-bar-track">
                    <div
                        class="hp-bar"
                        :class="hpColorClass(enemyHPPercent)"
                        :style="{ width: enemyHPPercent + '%' }"
                    ></div>
                </div>
            </div>
        </div>

        <!-- Player HUD (bottom left) -->
        <div class="hud-card player-hud">
            <div class="hud-header">
                <span class="pokemon-label">TÚ</span>
                <span class="level-badge">Nv.{{ playerLevel }}</span>
            </div>
            <div class="hp-row">
                <span class="hp-label">PS</span>
                <div class="hp-bar-track">
                    <div
                        class="hp-bar"
                        :class="hpColorClass(playerHPPercent)"
                        :style="{ width: playerHPPercent + '%' }"
                    ></div>
                </div>
                <span class="hp-numbers">{{ playerHP }}/{{ maxHP }}</span>
            </div>
            <div class="xp-row">
                <span class="xp-label">EXP</span>
                <div class="xp-bar-track">
                    <div class="xp-bar" :style="{ width: xpProgress + '%' }"></div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
    playerHP: number;
    enemyHP: number;
    maxHP: number;
    playerLevel: number;
    xpProgress: number;
    pokemonName?: string;
}

const props = withDefaults(defineProps<Props>(), {
    pokemonName: '???',
});

const enemyLevel = Math.floor(Math.random() * 10) + 1;

const playerHPPercent = computed(() => Math.max(0, (props.playerHP / props.maxHP) * 100));
const enemyHPPercent = computed(() => Math.max(0, (props.enemyHP / props.maxHP) * 100));

const hpColorClass = (pct: number) => {
    if (pct > 50) return 'hp-green';
    if (pct > 20) return 'hp-yellow';
    return 'hp-red';
};
</script>

<style scoped>
.battle-hud {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    width: 100%;
    max-width: 520px;
    gap: 12px;
    margin: 0.5rem 0;
    padding: 0 1rem;
}

.hud-card {
    background: white;
    border: 3px solid #2d3748;
    border-radius: 12px;
    padding: 10px 14px;
    min-width: 200px;
    box-shadow: 4px 4px 0px #2d3748;
    font-family: 'Press Start 2P', 'Courier New', monospace;
}

.hud-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 6px;
}

.pokemon-label {
    font-size: 0.65rem;
    font-weight: 700;
    color: #1a202c;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.level-badge {
    font-size: 0.6rem;
    color: #4a5568;
}

.hp-row {
    display: flex;
    align-items: center;
    gap: 6px;
}

.hp-label, .xp-label {
    font-size: 0.55rem;
    font-weight: 700;
    color: #4a5568;
    min-width: 22px;
}

.hp-bar-track, .xp-bar-track {
    flex: 1;
    height: 8px;
    background: #e2e8f0;
    border-radius: 4px;
    overflow: hidden;
    border: 1px solid #cbd5e0;
}

.hp-bar, .xp-bar {
    height: 100%;
    border-radius: 4px;
    transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.hp-green { background: linear-gradient(90deg, #38a169, #48bb78); }
.hp-yellow { background: linear-gradient(90deg, #d69e2e, #ecc94b); }
.hp-red {
    background: linear-gradient(90deg, #c53030, #fc8181);
    animation: hpFlicker 1s ease-in-out infinite;
}

@keyframes hpFlicker {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.6; }
}

.xp-bar {
    background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.xp-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 4px;
}

.hp-numbers {
    font-size: 0.55rem;
    color: #4a5568;
    min-width: 36px;
    text-align: right;
}

@media (max-width: 480px) {
    .hud-card {
        min-width: 140px;
        padding: 8px 10px;
    }
}
</style>