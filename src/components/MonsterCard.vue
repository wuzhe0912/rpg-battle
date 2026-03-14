<script setup>
import { computed } from 'vue'

const props = defineProps({
  name: String,
  hp: Number,
  maxHp: Number,
  atk: Number,
  shake: Boolean,
})

const hpPercent = computed(() => {
  if (props.maxHp === 0) return 0
  return Math.max(0, (props.hp / props.maxHp) * 100)
})

function getHpColor(percent) {
  if (percent > 60) return '#4ecca3'
  if (percent > 30) return '#f0c040'
  return '#e74c3c'
}

const hpColor = computed(() => getHpColor(hpPercent.value))
</script>

<template>
  <div class="card monster-card" :class="{ shake: shake }">
    <div class="card-header">
      <h2>{{ name }}</h2>
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
      <span>ATK: {{ atk }}</span>
    </div>
    <div class="sprite monster-sprite">👹</div>
  </div>
</template>

<style scoped>
.card {
  background: #16213e;
  border: 2px solid #e74c3c;
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
</style>
