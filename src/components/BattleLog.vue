<script setup>
defineProps({
  logs: Array,
})
</script>

<template>
  <div class="battle-log">
    <div class="log-title">📜 戰鬥紀錄</div>
    <div v-for="(log, i) in logs" :key="i" class="log-entry">
      {{ log }}
    </div>
    <div v-if="logs.length === 0" class="log-empty">等待冒險開始...</div>
  </div>
</template>

<style scoped>
.battle-log {
  background: #0a0a1a;
  border: 1px solid #16213e;
  border-radius: 10px;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.log-title {
  font-size: 0.9rem;
  color: #4ecca3;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.log-entry {
  font-size: 0.8rem;
  color: #aaa;
  padding: 2px 0;
  border-bottom: 1px solid rgba(255,255,255,0.03);
}

.log-entry:last-child {
  border-bottom: none;
}

.log-empty {
  font-size: 0.8rem;
  color: #555;
  font-style: italic;
}

.battle-log::-webkit-scrollbar {
  width: 6px;
}
.battle-log::-webkit-scrollbar-track {
  background: #0a0a1a;
}
.battle-log::-webkit-scrollbar-thumb {
  background: #16213e;
  border-radius: 3px;
}
</style>
