<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: String,
  hp: Number,
  maxHp: Number,
  baseAtk: Number,
  def: Number,
  currentWeapon: String,
  weapons: Array,
  potions: Number,
  isDefending: Boolean,
  shake: Boolean,
})

const emit = defineEmits(['attack', 'defend', 'use-potion', 'switch-weapon'])

const hpPercent = computed(() => {
  return Math.max(0, (props.hp / props.maxHp) * 100)
})

function getHpColor(percent) {
  if (percent > 60) return '#4ecca3'
  if (percent > 30) return '#f0c040'
  return '#e74c3c'
}

const hpColor = computed(() => getHpColor(hpPercent.value))

function weaponDisplayName(type) {
  if (type === 'sword') return '⚔️ 劍'
  if (type === 'bow') return '🏹 弓'
  if (type === 'magic') return '🔮 魔法'
  return type
}
</script>

<template>
  <div class="card player-card" :class="{ shake: shake }">
    <div class="card-header">
      <h2>{{ name }}</h2>
      <span class="weapon-badge">{{ weaponDisplayName(currentWeapon) }}</span>
    </div>
    <div class="hp-section">
      <div class="hp-text">HP: {{ hp }} / {{ maxHp }}</div>
      <div class="hp-bar-bg">
        <div
          class="hp-bar-fill"
          :style="{
            width: hpPercent + '%',
            backgroundColor: hpColor,
            transition: 'width 0.3s, background-color 0.3s'
          }"
        ></div>
      </div>
    </div>
    <div class="card-stats">
      <span>ATK: {{ baseAtk }}</span>
      <span>DEF: {{ def }}</span>
    </div>
    <div v-if="isDefending" class="defending-badge">🛡️ 防禦中</div>
    <div class="sprite player-sprite">🧙</div>

    <!-- Weapon selector -->
    <div class="weapon-selector" v-if="weapons.length > 1">
      <span class="weapon-label">武器切換：</span>
      <button
        v-for="w in weapons"
        :key="w"
        class="btn btn-weapon"
        :class="{ active: currentWeapon === w }"
        @click="emit('switch-weapon', w)"
      >
        {{ weaponDisplayName(w) }}
      </button>
    </div>

    <!-- Action buttons -->
    <div class="actions">
      <button class="btn btn-attack" @click="emit('attack')">⚔️ 攻擊</button>
      <button class="btn btn-defend" @click="emit('defend')">🛡️ 防禦</button>
      <button
        class="btn btn-potion"
        @click="emit('use-potion')"
        :disabled="potions <= 0"
        :style="potions <= 0 ? 'opacity: 0.4; cursor: not-allowed' : ''"
      >
        🧪 藥水 ({{ potions }})
      </button>
    </div>
  </div>
</template>

<style scoped>
.card {
  background: #16213e;
  border: 2px solid #4ecca3;
  border-radius: 12px;
  padding: 1.2rem;
  width: 280px;
  position: relative;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.card-header h2 {
  font-size: 1.3rem;
  margin: 0;
}

.weapon-badge {
  font-size: 0.75rem;
  background: rgba(78, 204, 163, 0.2);
  padding: 2px 8px;
  border-radius: 4px;
  color: #4ecca3;
}

.hp-section {
  margin-bottom: 0.6rem;
}

.hp-text {
  font-size: 0.85rem;
  margin-bottom: 4px;
  color: #ccc;
}

.hp-bar-bg {
  width: 100%;
  height: 14px;
  background: #0a0a1a;
  border-radius: 7px;
  overflow: hidden;
}

.hp-bar-fill {
  height: 100%;
  border-radius: 7px;
}

.card-stats {
  display: flex;
  gap: 1rem;
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 0.5rem;
}

.defending-badge {
  font-size: 0.8rem;
  color: #4ecdc4;
  margin-bottom: 0.3rem;
}

.sprite {
  text-align: center;
  font-size: 2.5rem;
  margin-top: 0.3rem;
}

.shake {
  animation: shake 0.3s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-5px); }
  80% { transform: translateX(5px); }
}

.weapon-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.8rem;
  flex-wrap: wrap;
}

.weapon-label {
  font-size: 0.85rem;
  color: #888;
}

.btn-weapon {
  background: #16213e;
  border: 1px solid #0f3460;
  color: #ccc;
  padding: 4px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  transition: all 0.2s;
}

.btn-weapon.active {
  border-color: #4ecca3;
  color: #4ecca3;
  background: rgba(78, 204, 163, 0.1);
}

.btn-weapon:hover:not(:disabled) {
  border-color: #4ecca3;
}

.actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.8rem;
}

.btn {
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.1s;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-attack { background: #e74c3c; color: white; }
.btn-defend { background: #3498db; color: white; }
.btn-potion { background: #2ecc71; color: white; }
</style>
