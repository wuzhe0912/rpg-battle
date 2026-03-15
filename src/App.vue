<script setup>
import { ref, nextTick } from 'vue'
import PlayerCard from './components/PlayerCard.vue'
import MonsterCard from './components/MonsterCard.vue'
import BattleLog from './components/BattleLog.vue'
import { usePlayer } from './composables/usePlayer.js'
import { useMonster } from './composables/useMonster.js'
import { weaponStrategies } from './strategies/weapons.js'

// ----- Composables -----
const player = usePlayer()
const monster = useMonster()

// ----- Game state -----
const battleLog = ref([])
const gameOver = ref(false)
const gameStarted = ref(false)
const showLoot = ref(false)
const lootMessage = ref('')

// ----- Loot table -----
const lootTable = [
  { name: '鏽蝕短弓', type: 'bow' },
  { name: '魔法書・初級', type: 'magic' },
  { name: '精鋼長劍', type: 'sword' },
  { name: '暗影匕首', type: 'sword' },
  { name: '火焰法杖', type: 'magic' },
  { name: '獵人長弓', type: 'bow' },
]

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ----- Add to battle log -----
function addLog(msg) {
  battleLog.value.push(msg)
  nextTick(() => {
    const el = document.querySelector('.battle-log')
    if (el) el.scrollTop = el.scrollHeight
  })
}

// ----- Spawn monster -----
function spawnMonster() {
  const info = monster.spawn()
  showLoot.value = false
  addLog(`--- 野生的 ${info.name} 出現了！HP: ${info.hp} ---`)
}

// ----- Player attack -----
function doAttack() {
  if (gameOver.value || showLoot.value) return

  player.isDefending.value = false
  const { dmg, text } = player.calcDamage()

  const isDead = monster.takeDamage(dmg)
  addLog(`${player.name.value} ${text}，造成 ${dmg} 點傷害！`)
  monster.triggerShake()

  if (isDead) {
    player.monstersKilled.value++
    addLog(`${monster.name.value} 被擊敗了！`)
    tryDropLoot()
    return
  }

  setTimeout(() => monsterTurn(), 500)
}

// ----- Monster turn -----
function monsterTurn() {
  if (gameOver.value) return

  const rawDmg = monster.calcDamage()
  const { actualDmg, wasDefending } = player.takeDamage(rawDmg)

  if (wasDefending) {
    addLog(`${player.name.value} 的防禦姿態減輕了傷害！`)
  }

  addLog(`${monster.name.value} 攻擊了 ${player.name.value}，造成 ${actualDmg} 點傷害`)
  player.triggerShake()

  if (player.hp.value <= 0) {
    gameOver.value = true
    addLog(`${player.name.value} 倒下了... 遊戲結束`)
    addLog(`共擊敗了 ${player.monstersKilled.value} 隻怪物`)
  }
}

// ----- Loot system -----
function tryDropLoot() {
  if (Math.random() < 0.5) {
    const loot = lootTable[randomInt(0, lootTable.length - 1)]
    const added = player.addWeapon(loot.type)
    if (added) {
      const strategy = weaponStrategies[loot.type]
      lootMessage.value = `獲得了 ${loot.name}！（${strategy.name}系武器）`
    } else {
      player.addPotion()
      lootMessage.value = `獲得了 ${loot.name}...但已經有同類武器了，轉化為藥水 x1`
    }
    showLoot.value = true
    addLog(lootMessage.value)
  } else {
    setTimeout(() => spawnMonster(), 800)
  }
}

// ----- Defend -----
function doDefend() {
  if (gameOver.value || showLoot.value) return
  player.defend()
  addLog(`${player.name.value} 擺出防禦姿態！`)
  setTimeout(() => monsterTurn(), 500)
}

// ----- Use potion -----
function onUsePotion() {
  if (gameOver.value || showLoot.value) return
  const result = player.usePotion()
  if (result.empty) {
    addLog('沒有藥水了！')
    return
  }
  addLog(`${player.name.value} 使用藥水，回復 ${result.healed} HP！（剩餘 ${result.remaining} 瓶）`)
  setTimeout(() => monsterTurn(), 500)
}

// ----- Weapon switch -----
function onSwitchWeapon(type) {
  if (!player.switchWeapon(type)) return
  const strategy = weaponStrategies[type]
  addLog(`切換武器：${strategy.name}（${strategy.description}）`)
}

// ----- Continue after loot -----
function continueBattle() {
  showLoot.value = false
  setTimeout(() => spawnMonster(), 300)
}

// ----- Start / Restart -----
function startGame() {
  gameStarted.value = true
  gameOver.value = false
  battleLog.value = []
  player.reset()
  addLog('=== 冒險開始！===')
  spawnMonster()
}

function restartGame() {
  gameOver.value = false
  gameStarted.value = false
  showLoot.value = false
}
</script>

<template>
  <!-- Title screen -->
  <div v-if="!gameStarted" class="title-screen">
    <h1 class="game-title">⚔️ RPG Battle</h1>
    <p class="subtitle">回合制戰鬥遊戲</p>
    <button class="btn btn-start" @click="startGame">開始冒險</button>
  </div>

  <!-- Game screen -->
  <div v-else class="game-container">
    <div class="stats-bar">
      <span>擊殺數：{{ player.monstersKilled.value }}</span>
      <span>藥水：{{ player.potions.value }} 瓶</span>
    </div>

    <div class="battle-field">
      <PlayerCard
        :name="player.name.value"
        :hp="player.hp.value"
        :max-hp="player.maxHp.value"
        :base-atk="player.baseAtk.value"
        :def="player.def.value"
        :current-weapon="player.currentWeapon.value"
        :weapons="player.weapons.value"
        :potions="player.potions.value"
        :is-defending="player.isDefending.value"
        :shake="player.shake.value"
        @attack="doAttack"
        @defend="doDefend"
        @use-potion="onUsePotion"
        @switch-weapon="onSwitchWeapon"
      />

      <div class="vs-divider">VS</div>

      <MonsterCard
        :name="monster.name.value"
        :hp="monster.hp.value"
        :max-hp="monster.maxHp.value"
        :atk="monster.atk.value"
        :shake="monster.shake.value"
      />
    </div>

    <!-- Loot popup -->
    <div v-if="showLoot" class="loot-popup">
      <p class="loot-text">🎁 {{ lootMessage }}</p>
      <button class="btn btn-continue" @click="continueBattle">繼續戰鬥</button>
    </div>

    <!-- Game over -->
    <div v-if="gameOver" class="game-over">
      <h2>💀 遊戲結束</h2>
      <p>你擊敗了 {{ player.monstersKilled.value }} 隻怪物</p>
      <button class="btn btn-restart" @click="restartGame">重新開始</button>
    </div>

    <BattleLog :logs="battleLog" />
  </div>
</template>

<style scoped>
.title-screen {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

.game-title {
  font-size: 3rem;
  color: #4ecca3;
  text-shadow: 0 0 20px rgba(78, 204, 163, 0.3);
}

.subtitle {
  color: #888;
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.game-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
}

.stats-bar {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: rgba(255,255,255,0.05);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #aaa;
}

.battle-field {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.vs-divider {
  font-size: 1.5rem;
  font-weight: bold;
  color: #e74c3c;
  text-shadow: 0 0 10px rgba(231, 76, 60, 0.5);
  flex-shrink: 0;
}

.btn {
  border: none;
  padding: 0.7rem 1.5rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  font-weight: 600;
  transition: transform 0.1s, box-shadow 0.2s;
}

.btn:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn:active:not(:disabled) {
  transform: translateY(0);
}

.btn-start {
  background: #4ecca3;
  color: #1a1a2e;
  font-size: 1.3rem;
  padding: 1rem 2.5rem;
}

.btn-continue {
  background: #f39c12;
  color: #1a1a2e;
}

.btn-restart {
  background: #4ecca3;
  color: #1a1a2e;
  margin-top: 0.5rem;
}

.loot-popup {
  text-align: center;
  padding: 1.2rem;
  background: rgba(243, 156, 18, 0.1);
  border: 1px solid #f39c12;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.loot-text {
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: #f39c12;
}

.game-over {
  text-align: center;
  padding: 1.5rem;
  background: rgba(231, 76, 60, 0.1);
  border: 1px solid #e74c3c;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.game-over h2 {
  color: #e74c3c;
  margin-bottom: 0.5rem;
}

.game-over p {
  color: #ccc;
  margin-bottom: 0.8rem;
}
</style>
