<script setup>
import { ref, computed, nextTick } from 'vue'

// ============================================
// RPG Battle Game - V1 (everything in one file)
// TODO: this is getting messy, should refactor later...
// ============================================

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

// weapon stuff - sword is default
// TODO: this weapon system is a mess, should use objects or something
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
// TODO: should probably be a map or something
const lootTable = [
  { name: '鏽蝕短弓', type: 'bow' },
  { name: '魔法書・初級', type: 'magic' },
  { name: '精鋼長劍', type: 'sword' },
  { name: '暗影匕首', type: 'sword' },
  { name: '火焰法杖', type: 'magic' },
  { name: '獵人長弓', type: 'bow' },
]

// HP bar percentages - computed
const playerHpPercent = computed(() => {
  return Math.max(0, (playerHp.value / playerMaxHp.value) * 100)
})
const monsterHpPercent = computed(() => {
  if (monsterMaxHp.value === 0) return 0
  return Math.max(0, (monsterHp.value / monsterMaxHp.value) * 100)
})

// HP bar colors - yeah I know this is duplicated
function getHpColor(percent) {
  if (percent > 60) return '#4ecca3'
  if (percent > 30) return '#f0c040'
  return '#e74c3c'
}
const playerHpColor = computed(() => getHpColor(playerHpPercent.value))
const monsterHpColor = computed(() => getHpColor(monsterHpPercent.value))

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
  // auto scroll - TODO: this is hacky
  nextTick(() => {
    const el = document.querySelector('.battle-log')
    if (el) el.scrollTop = el.scrollHeight
  })
}

// ----- Calculate player attack damage -----
// TODO: this if/else chain is getting out of hand
function calcPlayerDamage() {
  let dmg = 0
  let weaponText = ''

  if (currentWeapon.value === 'sword') {
    // sword: balanced, ATK range based on base
    dmg = randomInt(playerBaseAtk.value - 2, playerBaseAtk.value + 3)
    weaponText = '揮劍攻擊'
  } else if (currentWeapon.value === 'bow') {
    // bow: high ceiling but can miss badly
    const roll = randomInt(1, 100)
    if (roll <= 20) {
      // miss!
      dmg = randomInt(1, 3)
      weaponText = '箭矢偏離'
    } else if (roll >= 80) {
      // crit
      dmg = randomInt(playerBaseAtk.value + 5, playerBaseAtk.value + 10)
      weaponText = '精準射擊！'
    } else {
      dmg = randomInt(playerBaseAtk.value - 1, playerBaseAtk.value + 5)
      weaponText = '射出箭矢'
    }
  } else if (currentWeapon.value === 'magic') {
    // magic: ignores some DEF (applied later), medium damage
    dmg = randomInt(playerBaseAtk.value - 3, playerBaseAtk.value + 2)
    weaponText = '釋放魔法'
  } else {
    // fallback??? shouldn't happen
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

  // apply damage to monster
  // TODO: monster DEF? maybe later...
  monsterHp.value = Math.max(0, monsterHp.value - dmg)
  addLog(`${playerName.value} ${weaponText}，造成 ${dmg} 點傷害！`)

  // shake animation
  monsterShake.value = true
  setTimeout(() => { monsterShake.value = false }, 300)

  // check if monster dead
  if (monsterHp.value <= 0) {
    monstersKilled.value++
    addLog(`${monsterName.value} 被擊敗了！`)
    // loot drop - 50% chance
    if (Math.random() < 0.5) {
      const loot = lootTable[randomInt(0, lootTable.length - 1)]
      // check if already have this weapon type
      if (!weapons.value.includes(loot.type)) {
        weapons.value.push(loot.type)
        lootMessage.value = `獲得了 ${loot.name}！（${loot.type === 'bow' ? '弓' : loot.type === 'magic' ? '魔法' : '劍'}系武器）`
      } else {
        // already have it, give a potion instead
        potions.value++
        lootMessage.value = `獲得了 ${loot.name}...但已經有同類武器了，轉化為藥水 x1`
      }
      showLoot.value = true
      addLog(lootMessage.value)
    } else {
      // no loot, just spawn next
      setTimeout(() => spawnMonster(), 800)
    }
    return
  }

  // monster turn
  setTimeout(() => monsterTurn(), 500)
}

// ----- Monster attacks player -----
function monsterTurn() {
  if (gameOver.value) return

  let rawDmg = randomInt(monsterAtk.value - 2, monsterAtk.value + 2)

  // apply player DEF
  let actualDmg = rawDmg - playerDef.value

  // magic weapon type ignores DEF partially (but this is for monster hitting player, so irrelevant)
  // wait no, DEF is player's defense... ok this is fine

  // defending halves damage
  if (isDefending.value) {
    actualDmg = Math.floor(actualDmg * 0.5)
    addLog(`${playerName.value} 的防禦姿態減輕了傷害！`)
    isDefending.value = false
  }

  actualDmg = Math.max(1, actualDmg)
  playerHp.value = Math.max(0, playerHp.value - actualDmg)

  addLog(`${monsterName.value} 攻擊了 ${playerName.value}，造成 ${actualDmg} 點傷害`)

  // player shake
  playerShake.value = true
  setTimeout(() => { playerShake.value = false }, 300)

  // check death
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

  // monster still attacks after potion use
  setTimeout(() => monsterTurn(), 500)
}

// ----- Weapon switch -----
// TODO: this is ugly, repeating weapon type checks everywhere
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

// weapon display name helper - TODO: repeated logic again...
function weaponDisplayName(type) {
  if (type === 'sword') return '⚔️ 劍'
  if (type === 'bow') return '🏹 弓'
  if (type === 'magic') return '🔮 魔法'
  return type
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
      <!-- Player card -->
      <div class="card player-card" :class="{ shake: playerShake }">
        <div class="card-header">
          <h2>{{ playerName }}</h2>
          <span class="weapon-badge">{{ weaponDisplayName(currentWeapon) }}</span>
        </div>
        <div class="hp-section">
          <div class="hp-text">HP: {{ playerHp }} / {{ playerMaxHp }}</div>
          <div class="hp-bar-bg">
            <div
              class="hp-bar-fill"
              :style="{
                width: playerHpPercent + '%',
                backgroundColor: playerHpColor,
                transition: 'width 0.3s, background-color 0.3s'
              }"
            ></div>
          </div>
        </div>
        <div class="card-stats">
          <span>ATK: {{ playerBaseAtk }}</span>
          <span>DEF: {{ playerDef }}</span>
        </div>
        <div v-if="isDefending" class="defending-badge">🛡️ 防禦中</div>
        <div class="sprite player-sprite">🧙</div>
      </div>

      <!-- VS -->
      <div class="vs-divider">VS</div>

      <!-- Monster card -->
      <div class="card monster-card" :class="{ shake: monsterShake }">
        <div class="card-header">
          <h2>{{ monsterName }}</h2>
        </div>
        <div class="hp-section">
          <div class="hp-text">HP: {{ monsterHp }} / {{ monsterMaxHp }}</div>
          <div class="hp-bar-bg">
            <div
              class="hp-bar-fill"
              :style="{
                width: monsterHpPercent + '%',
                backgroundColor: monsterHpColor,
                transition: 'width 0.3s, background-color 0.3s'
              }"
            ></div>
          </div>
        </div>
        <div class="card-stats">
          <span>ATK: {{ monsterAtk }}</span>
        </div>
        <div class="sprite monster-sprite">👹</div>
      </div>
    </div>

    <!-- Weapon selector -->
    <div class="weapon-selector" v-if="weapons.length > 1">
      <span class="weapon-label">武器切換：</span>
      <button
        v-for="w in weapons"
        :key="w"
        class="btn btn-weapon"
        :class="{ active: currentWeapon === w }"
        @click="switchWeapon(w)"
        :disabled="gameOver"
      >
        {{ weaponDisplayName(w) }}
      </button>
    </div>

    <!-- Action buttons -->
    <div class="actions" v-if="!gameOver && !showLoot">
      <button class="btn btn-attack" @click="doAttack">⚔️ 攻擊</button>
      <button class="btn btn-defend" @click="doDefend">🛡️ 防禦</button>
      <button
        class="btn btn-potion"
        @click="usePotion"
        :disabled="potions <= 0"
        :style="potions <= 0 ? 'opacity: 0.4; cursor: not-allowed' : ''"
      >
        🧪 藥水 ({{ potions }})
      </button>
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

    <!-- Battle log -->
    <div class="battle-log">
      <div class="log-title">📜 戰鬥紀錄</div>
      <div v-for="(log, i) in battleLog" :key="i" class="log-entry">
        {{ log }}
      </div>
      <div v-if="battleLog.length === 0" class="log-empty">等待冒險開始...</div>
    </div>
  </div>
</template>

<style scoped>
/* =============================================
   RPG Battle - V1 styles (all in one file lol)
   TODO: this CSS is getting really long...
   ============================================= */

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

/* ----- Battle field layout ----- */
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

/* ----- Cards ----- */
.card {
  background: #16213e;
  border: 2px solid #0f3460;
  border-radius: 12px;
  padding: 1.2rem;
  width: 280px;
  position: relative;
}

.player-card {
  border-color: #4ecca3;
}

.monster-card {
  border-color: #e74c3c;
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

/* ----- Shake animation ----- */
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

/* ----- Weapon selector ----- */
.weapon-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  justify-content: center;
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

/* ----- Action buttons ----- */
.actions {
  display: flex;
  gap: 0.8rem;
  justify-content: center;
  margin-bottom: 1.5rem;
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

.btn-attack {
  background: #e74c3c;
  color: white;
}

.btn-defend {
  background: #3498db;
  color: white;
}

.btn-potion {
  background: #2ecc71;
  color: white;
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

/* ----- Loot popup ----- */
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

/* ----- Game over ----- */
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

/* ----- Battle log ----- */
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

/* scrollbar styling */
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
