<script setup>
import { ref, nextTick } from 'vue'
import PlayerCard from './components/PlayerCard.vue'
import MonsterCard from './components/MonsterCard.vue'
import BattleLog from './components/BattleLog.vue'

// ----- Player state -----
const playerName = ref('勇者')
const playerHp = ref(100)
const playerMaxHp = ref(100)
const playerBaseAtk = ref(12)
const playerDef = ref(5)
const potions = ref(3)
const isDefending = ref(false)
const playerShake = ref(false)
const monstersKilled = ref(0)

const currentWeapon = ref('sword')
const weapons = ref(['sword'])

// ----- Monster state -----
const monsterName = ref('')
const monsterHp = ref(0)
const monsterMaxHp = ref(0)
const monsterAtk = ref(0)
const monsterShake = ref(false)

// ----- Game state -----
const battleLog = ref([])
const gameOver = ref(false)
const gameStarted = ref(false)
const showLoot = ref(false)
const lootMessage = ref('')

// ----- Monster names -----
const monsterNames = ['哥布林', '史萊姆', '骷髏兵', '暗影狼', '毒蜘蛛', '石像鬼', '火焰蜥蜴']

// ----- Loot table -----
const lootTable = [
  { name: '鏽蝕短弓', type: 'bow' },
  { name: '魔法書・初級', type: 'magic' },
  { name: '精鋼長劍', type: 'sword' },
  { name: '暗影匕首', type: 'sword' },
  { name: '火焰法杖', type: 'magic' },
  { name: '獵人長弓', type: 'bow' },
]

// ----- Helper: random int -----
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// ----- Spawn a new monster -----
function spawnMonster() {
  const idx = randomInt(0, monsterNames.length - 1)
  monsterName.value = monsterNames[idx]
  const hp = randomInt(50, 80)
  monsterHp.value = hp
  monsterMaxHp.value = hp
  monsterAtk.value = randomInt(5, 10)
  showLoot.value = false
  addLog(`--- 野生的 ${monsterName.value} 出現了！HP: ${hp} ---`)
}

// ----- Add to battle log -----
function addLog(msg) {
  battleLog.value.push(msg)
  nextTick(() => {
    const el = document.querySelector('.battle-log')
    if (el) el.scrollTop = el.scrollHeight
  })
}

// ----- Calculate player attack damage -----
function calcPlayerDamage() {
  let dmg = 0
  let weaponText = ''

  if (currentWeapon.value === 'sword') {
    dmg = randomInt(playerBaseAtk.value - 2, playerBaseAtk.value + 3)
    weaponText = '揮劍攻擊'
  } else if (currentWeapon.value === 'bow') {
    const roll = randomInt(1, 100)
    if (roll <= 20) {
      dmg = randomInt(1, 3)
      weaponText = '箭矢偏離'
    } else if (roll >= 80) {
      dmg = randomInt(playerBaseAtk.value + 5, playerBaseAtk.value + 10)
      weaponText = '精準射擊！'
    } else {
      dmg = randomInt(playerBaseAtk.value - 1, playerBaseAtk.value + 5)
      weaponText = '射出箭矢'
    }
  } else if (currentWeapon.value === 'magic') {
    dmg = randomInt(playerBaseAtk.value - 3, playerBaseAtk.value + 2)
    weaponText = '釋放魔法'
  } else {
    dmg = randomInt(10, 15)
    weaponText = '攻擊'
  }

  return { dmg: Math.max(1, dmg), weaponText }
}

// ----- Player attack action -----
function doAttack() {
  if (gameOver.value || showLoot.value) return

  isDefending.value = false
  const { dmg, weaponText } = calcPlayerDamage()

  monsterHp.value = Math.max(0, monsterHp.value - dmg)
  addLog(`${playerName.value} ${weaponText}，造成 ${dmg} 點傷害！`)

  monsterShake.value = true
  setTimeout(() => { monsterShake.value = false }, 300)

  if (monsterHp.value <= 0) {
    monstersKilled.value++
    addLog(`${monsterName.value} 被擊敗了！`)
    if (Math.random() < 0.5) {
      const loot = lootTable[randomInt(0, lootTable.length - 1)]
      if (!weapons.value.includes(loot.type)) {
        weapons.value.push(loot.type)
        lootMessage.value = `獲得了 ${loot.name}！（${loot.type === 'bow' ? '弓' : loot.type === 'magic' ? '魔法' : '劍'}系武器）`
      } else {
        potions.value++
        lootMessage.value = `獲得了 ${loot.name}...但已經有同類武器了，轉化為藥水 x1`
      }
      showLoot.value = true
      addLog(lootMessage.value)
    } else {
      setTimeout(() => spawnMonster(), 800)
    }
    return
  }

  setTimeout(() => monsterTurn(), 500)
}

// ----- Monster attacks player -----
function monsterTurn() {
  if (gameOver.value) return

  let rawDmg = randomInt(monsterAtk.value - 2, monsterAtk.value + 2)
  let actualDmg = rawDmg - playerDef.value

  if (isDefending.value) {
    actualDmg = Math.floor(actualDmg * 0.5)
    addLog(`${playerName.value} 的防禦姿態減輕了傷害！`)
    isDefending.value = false
  }

  actualDmg = Math.max(1, actualDmg)
  playerHp.value = Math.max(0, playerHp.value - actualDmg)

  addLog(`${monsterName.value} 攻擊了 ${playerName.value}，造成 ${actualDmg} 點傷害`)

  playerShake.value = true
  setTimeout(() => { playerShake.value = false }, 300)

  if (playerHp.value <= 0) {
    gameOver.value = true
    addLog(`${playerName.value} 倒下了... 遊戲結束`)
    addLog(`共擊敗了 ${monstersKilled.value} 隻怪物`)
  }
}

// ----- Defend action -----
function doDefend() {
  if (gameOver.value || showLoot.value) return
  isDefending.value = true
  addLog(`${playerName.value} 擺出防禦姿態！`)
  setTimeout(() => monsterTurn(), 500)
}

// ----- Potion action -----
function usePotion() {
  if (gameOver.value || showLoot.value) return
  if (potions.value <= 0) {
    addLog('沒有藥水了！')
    return
  }
  potions.value--
  const heal = 30
  const oldHp = playerHp.value
  playerHp.value = Math.min(playerMaxHp.value, playerHp.value + heal)
  const actualHeal = playerHp.value - oldHp
  addLog(`${playerName.value} 使用藥水，回復 ${actualHeal} HP！（剩餘 ${potions.value} 瓶）`)
  setTimeout(() => monsterTurn(), 500)
}

// ----- Weapon switch -----
function switchWeapon(type) {
  if (!weapons.value.includes(type)) return
  currentWeapon.value = type
  if (type === 'sword') {
    addLog('切換武器：劍（平衡型）')
  } else if (type === 'bow') {
    addLog('切換武器：弓（高攻擊但不穩定）')
  } else if (type === 'magic') {
    addLog('切換武器：魔法（無視部分防禦）')
  }
}

// ----- Dismiss loot and continue -----
function continueBattle() {
  showLoot.value = false
  setTimeout(() => spawnMonster(), 300)
}

// ----- Start game -----
function startGame() {
  gameStarted.value = true
  playerHp.value = 100
  playerMaxHp.value = 100
  potions.value = 3
  monstersKilled.value = 0
  currentWeapon.value = 'sword'
  weapons.value = ['sword']
  battleLog.value = []
  gameOver.value = false
  isDefending.value = false
  addLog('=== 冒險開始！===')
  spawnMonster()
}

// ----- Restart -----
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
      <span>擊殺數：{{ monstersKilled }}</span>
      <span>藥水：{{ potions }} 瓶</span>
    </div>

    <div class="battle-field">
      <!-- Player card (component) -->
      <PlayerCard
        :name="playerName"
        :hp="playerHp"
        :max-hp="playerMaxHp"
        :base-atk="playerBaseAtk"
        :def="playerDef"
        :current-weapon="currentWeapon"
        :weapons="weapons"
        :potions="potions"
        :is-defending="isDefending"
        :shake="playerShake"
        @attack="doAttack"
        @defend="doDefend"
        @use-potion="usePotion"
        @switch-weapon="switchWeapon"
      />

      <!-- VS -->
      <div class="vs-divider">VS</div>

      <!-- Monster card (component) -->
      <MonsterCard
        :name="monsterName"
        :hp="monsterHp"
        :max-hp="monsterMaxHp"
        :atk="monsterAtk"
        :shake="monsterShake"
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
      <p>你擊敗了 {{ monstersKilled }} 隻怪物</p>
      <button class="btn btn-restart" @click="restartGame">重新開始</button>
    </div>

    <!-- Battle log (component) -->
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
