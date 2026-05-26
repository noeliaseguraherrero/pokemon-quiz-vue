<template>
  <transition name="mart-slide">
    <div v-if="modelValue" class="mart-overlay" @click.self="$emit('update:modelValue', false)">
      <div class="mart-panel">

        <!-- Header -->
        <div class="mart-header">
          <div class="mart-logo">
            <span class="mart-icon">🏪</span>
            <div>
              <div class="mart-title">POKÉMART</div>
              <div class="mart-sub">¡Bienvenido, entrenador!</div>
            </div>
          </div>
          <div class="coins-display">
            <span class="coins-icon">🪙</span>
            <span class="coins-val">{{ coins }}</span>
            <span class="coins-lbl">PC</span>
          </div>
          <button class="mart-close" @click="$emit('update:modelValue', false)">✕</button>
        </div>

        <!-- Productos -->
        <div class="mart-grid">

          <div class="mart-item" :class="{ disabled: coins < 20 || playerHP >= 100 }">
            <div class="item-sprite">🧪</div>
            <div class="item-info">
              <div class="item-name">POCIÓN</div>
              <div class="item-desc">Restaura 20 HP a Pikachu</div>
              <div class="item-hp">
                <div class="hp-preview-bar">
                  <div class="hp-preview-fill current"
                    :style="{ width: playerHP + '%', background: hpColor(playerHP) }">
                  </div>
                  <div class="hp-preview-fill gain"
                    :style="{ width: Math.min(20, 100 - playerHP) + '%' }">
                  </div>
                </div>
                <span class="hp-preview-text">
                  {{ playerHP }} → {{ Math.min(100, playerHP + 20) }} HP
                </span>
              </div>
            </div>
            <div class="item-buy">
              <div class="item-price">🪙 20</div>
              <button class="buy-btn" :disabled="coins < 20 || playerHP >= 100"
                @click="handle('potion')">
                {{ playerHP >= 100 ? 'HP LLENO' : 'COMPRAR' }}
              </button>
            </div>
          </div>

          <div class="mart-item" :class="{ disabled: coins < 50 || playerHP >= 100 }">
            <div class="item-sprite">💊</div>
            <div class="item-info">
              <div class="item-name">HIPERPOCIÓN</div>
              <div class="item-desc">Restaura 50 HP a Pikachu</div>
              <div class="item-hp">
                <div class="hp-preview-bar">
                  <div class="hp-preview-fill current"
                    :style="{ width: playerHP + '%', background: hpColor(playerHP) }">
                  </div>
                  <div class="hp-preview-fill gain"
                    :style="{ width: Math.min(50, 100 - playerHP) + '%' }">
                  </div>
                </div>
                <span class="hp-preview-text">
                  {{ playerHP }} → {{ Math.min(100, playerHP + 50) }} HP
                </span>
              </div>
            </div>
            <div class="item-buy">
              <div class="item-price">🪙 50</div>
              <button class="buy-btn" :disabled="coins < 50 || playerHP >= 100"
                @click="handle('hyperpotion')">
                {{ playerHP >= 100 ? 'HP LLENO' : 'COMPRAR' }}
              </button>
            </div>
          </div>

          <div class="mart-item" :class="{ disabled: coins < 30 }">
            <div class="item-sprite">💡</div>
            <div class="item-info">
              <div class="item-name">PISTA EXTRA</div>
              <div class="item-desc">Añade +1 carga de pista de tipo</div>
              <div class="hint-charges">
                <span class="hint-dot" v-for="i in hintCharges" :key="i">●</span>
                <span class="hint-dot add">+1</span>
              </div>
            </div>
            <div class="item-buy">
              <div class="item-price">🪙 30</div>
              <button class="buy-btn" :disabled="coins < 30" @click="handle('hint')">
                COMPRAR
              </button>
            </div>
          </div>

          <div class="mart-item master" :class="{ disabled: coins < 100 }">
            <div class="item-sprite master-sprite">
              <div class="mini-masterball">
                <div class="mb-top"></div>
                <div class="mb-mid"><div class="mb-btn"></div></div>
                <div class="mb-bottom"></div>
                <div class="mb-circles">
                  <div class="mb-circle"></div>
                  <div class="mb-circle"></div>
                </div>
              </div>
            </div>
            <div class="item-info">
              <div class="item-name master-name">MASTER BALL</div>
              <div class="item-desc">Elimina la mitad de opciones incorrectas</div>
              <div class="master-warning">¡Solo funciona en la ronda actual!</div>
            </div>
            <div class="item-buy">
              <div class="item-price master-price">🪙 100</div>
              <button class="buy-btn master-buy" :disabled="coins < 100"
                @click="handle('masterball')">
                USAR
              </button>
            </div>
          </div>

        </div>

        <!-- Toast de compra -->
        <transition name="toast">
          <div v-if="toastMsg" class="mart-toast" :class="toastType">
            {{ toastMsg }}
          </div>
        </transition>

      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface Props {
  modelValue: boolean
  coins:       number
  playerHP:    number
  hintCharges: number
}

// Corregido: Quitamos "const props =" ya que la plantilla lee los valores directamente
defineProps<Props>()

const emit = defineEmits<{
  'update:modelValue': [val: boolean]
  buy: [item: string]
}>()

const toastMsg  = ref('')
const toastType = ref<'success' | 'error'>('success')

function hpColor(pct: number) {
  if (pct > 50) return '#44cc44'
  if (pct > 25) return '#ffcc00'
  return '#ff4444'
}

function showToast(msg: string, type: 'success' | 'error' = 'success') {
  toastMsg.value  = msg
  toastType.value = type
  setTimeout(() => { toastMsg.value = '' }, 2000)
}

function handle(item: string) {
  emit('buy', item)

  const messages: Record<string, string> = {
    potion:      '¡Pikachu recuperó 20 HP!',
    hyperpotion: '¡Pikachu recuperó 50 HP!',
    hint:        '¡+1 carga de pista añadida!',
    masterball:  '¡Opciones incorrectas eliminadas!',
  }
  showToast(messages[item] ?? '¡Comprado!')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
* { box-sizing: border-box; }

/* ── OVERLAY ── */
.mart-overlay {
  position: fixed; inset: 0; z-index: 190;
  background: rgba(0,0,0,0.75);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
}

/* ── PANEL ── */
.mart-panel {
  background: #0d1117;
  border: 3px solid #2a75bb;
  border-radius: 20px;
  width: 100%; max-width: 560px;
  max-height: 90vh; overflow-y: auto;
  position: relative;
}
.mart-panel::-webkit-scrollbar { width: 4px; }
.mart-panel::-webkit-scrollbar-thumb { background: #2a75bb; border-radius: 2px; }

/* ── HEADER ── */
.mart-header {
  display: flex; align-items: center; gap: 12px;
  padding: 18px 20px 14px;
  border-bottom: 1px solid rgba(255,255,255,0.08);
  position: sticky; top: 0; background: #0d1117; z-index: 2;
  border-radius: 17px 17px 0 0;
}
.mart-logo    { display: flex; align-items: center; gap: 10px; flex: 1; }
.mart-icon    { font-size: 28px; }
.mart-title   { font-family: 'Press Start 2P', monospace; font-size: 12px; color: #2a75bb; }
.mart-sub     { font-family: 'Press Start 2P', monospace; font-size: 6px;  color: #aaa; margin-top: 4px; }

.coins-display {
  display: flex; align-items: center; gap: 5px;
  background: rgba(255,203,5,0.12);
  border: 1px solid rgba(255,203,5,0.35);
  border-radius: 20px; padding: 6px 12px;
}
.coins-icon { font-size: 14px; }
.coins-val  { font-family: 'Press Start 2P', monospace; font-size: 12px; color: #ffcb05; }
.coins-lbl  { font-family: 'Press Start 2P', monospace; font-size: 6px;  color: #aaa; }

.mart-close {
  background: none; border: none; color: #aaa;
  font-size: 20px; cursor: pointer; padding: 4px 8px;
  transition: color 0.2s;
}
.mart-close:hover { color: #fff; }

/* ── GRID DE PRODUCTOS ── */
.mart-grid {
  display: flex; flex-direction: column; gap: 10px;
  padding: 16px 20px 20px;
}

/* ── ITEM ── */
.mart-item {
  display: flex; align-items: center; gap: 14px;
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 14px; padding: 14px 16px;
  transition: all 0.2s;
}
.mart-item:not(.disabled):hover {
  border-color: rgba(42,117,187,0.5);
  background: rgba(42,117,187,0.07);
}
.mart-item.disabled { opacity: 0.45; }
.mart-item.master {
  border-color: rgba(160,64,160,0.4);
  background: rgba(160,64,160,0.06);
}
.mart-item.master:not(.disabled):hover {
  border-color: rgba(160,64,160,0.7);
  background: rgba(160,64,160,0.12);
}

/* ── SPRITE ── */
.item-sprite { font-size: 36px; flex-shrink: 0; width: 48px; text-align: center; }
.master-sprite { font-size: 0; }

/* ── MINI MASTERBALL ── */
.mini-masterball {
  width: 48px; height: 48px; border-radius: 50%;
  position: relative; overflow: hidden;
  border: 3px solid #333; flex-shrink: 0;
  box-shadow: 0 0 10px rgba(160,64,160,0.5);
}
.mb-top    { position:absolute; top:0; left:0; right:0; height:50%; background:#a040a0; }
.mb-bottom { position:absolute; bottom:0; left:0; right:0; height:50%; background:#f0f0f0; }
.mb-mid    {
  position:absolute; top:50%; left:0; right:0; height:8px;
  background:#333; transform:translateY(-50%);
  display:flex; align-items:center; justify-content:center; z-index:2;
}
.mb-btn    { width:14px; height:14px; border-radius:50%; background:#f0f0f0; border:2px solid #333; }
.mb-circles {
  position:absolute; top:8px; left:6px;
  display:flex; gap:3px;
}
.mb-circle {
  width:8px; height:8px; border-radius:50%;
  border:2px solid rgba(255,255,255,0.6);
}

/* ── INFO ── */
.item-info  { flex: 1; display: flex; flex-direction: column; gap: 5px; }
.item-name  { font-family: 'Press Start 2P', monospace; font-size: 8px;  color: #fff; }
.item-desc  { font-family: 'Press Start 2P', monospace; font-size: 6px;  color: #aaa; line-height: 1.6; }
.master-name  { color: #cc88ff; }
.master-warning {
  font-family: 'Press Start 2P', monospace; font-size: 5px;
  color: rgba(160,64,160,0.8); margin-top: 2px;
}

/* HP Preview */
.item-hp { display: flex; flex-direction: column; gap: 3px; margin-top: 2px; }
.hp-preview-bar {
  height: 6px; background: rgba(0,0,0,0.4);
  border-radius: 3px; overflow: hidden;
  display: flex;
}
.hp-preview-fill { height: 100%; border-radius: 3px; transition: width 0.3s; }
.hp-preview-fill.gain    { background: rgba(255,255,255,0.35); }
.hp-preview-text {
  font-family: 'Press Start 2P', monospace; font-size: 5px; color: #aaa;
}

/* Hint charges */
.hint-charges { display: flex; gap: 5px; align-items: center; margin-top: 2px; }
.hint-dot     { font-size: 10px; color: #ffcb05; }
.hint-dot.add { font-family: 'Press Start 2P', monospace; font-size: 7px; color: #4caf50; }

/* ── COMPRAR ── */
.item-buy   { display: flex; flex-direction: column; align-items: center; gap: 8px; flex-shrink: 0; }
.item-price { font-family: 'Press Start 2P', monospace; font-size: 8px; color: #ffcb05; white-space: nowrap; }
.master-price { color: #cc88ff; }

.buy-btn {
  font-family: 'Press Start 2P', monospace; font-size: 6px;
  background: #2a75bb; color: #fff;
  border: none; border-radius: 20px;
  padding: 8px 14px; cursor: pointer;
  transition: all 0.2s; white-space: nowrap;
  box-shadow: 0 3px 0 #1a4f8a;
}
.buy-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 0 #1a4f8a; }
.buy-btn:active:not(:disabled){ transform: translateY(1px);  box-shadow: 0 1px 0 #1a4f8a; }
.buy-btn:disabled { opacity: 0.4; cursor: not-allowed; box-shadow: none; }
.master-buy { background: #a040a0; box-shadow: 0 3px 0 #6a2080; }
.master-buy:hover:not(:disabled) { box-shadow: 0 5px 0 #6a2080; }

/* ── TOAST ── */
.mart-toast {
  position: sticky; bottom: 0;
  margin: 0 20px 16px;
  padding: 10px 16px;
  border-radius: 10px;
  font-family: 'Press Start 2P', monospace; font-size: 7px;
  text-align: center; line-height: 1.6;
}
.mart-toast.success { background: rgba(76,175,80,0.2);  border: 1px solid #4caf50; color: #4caf50; }
.mart-toast.error   { background: rgba(255,68,68,0.2);  border: 1px solid #ff4444; color: #ff4444; }

/* ── TRANSICIÓN ── */
.mart-slide-enter-active, .mart-slide-leave-active { transition: all 0.3s ease; }
.mart-slide-enter-from, .mart-slide-leave-to       { opacity: 0; transform: scale(0.95) translateY(10px); }

.toast-enter-active, .toast-leave-active { transition: all 0.25s ease; }
.toast-enter-from, .toast-leave-to       { opacity: 0; transform: translateY(6px); }
</style>