# V3 — Composable + 策略模式

## 這個版本做了什麼？

V2 拆了 UI，V3 拆邏輯。把玩家和怪物的狀態與行為封裝成 composable，武器系統改用策略模式。

## 檔案結構

```
src/
├── App.vue                  ← 純協調：串接 composable 和元件
├── components/
│   ├── PlayerCard.vue       ← 不變
│   ├── MonsterCard.vue      ← 不變
│   └── BattleLog.vue        ← 不變
├── composables/
│   ├── usePlayer.js         ← 玩家狀態 + 所有玩家行為
│   └── useMonster.js        ← 怪物狀態 + 生成/攻擊/受傷
└── strategies/
    └── weapons.js           ← 武器策略物件（取代 if/else）
```

## 教學重點

### 1. 策略模式（Strategy Pattern）

Before（V1/V2 的 if/else）：

```js
if (weapon === 'sword') { ... }
else if (weapon === 'bow') { ... }
else if (weapon === 'magic') { ... }
// 加新武器 = 加 else if + 到處改
```

After（V3 的策略物件）：

```js
const strategy = weaponStrategies[currentWeapon]
const { dmg, text } = strategy.calcDamage(baseAtk)
// 加新武器 = 加一個物件，其他地方不用動
```

### 2. Composable = 邏輯打包

把相關的 ref + function 包成一個可重用的函式：

```js
const player = usePlayer()
// player.hp, player.calcDamage(), player.takeDamage()...
```

App.vue 從二三十個 ref 變成兩行。

### 3. V1 vs V2 vs V3 對比

| | V1 | V2 | V3 |
|---|---|---|---|
| 檔案數 | 1 | 4 | 7 |
| App.vue 角色 | 什麼都幹 | 邏輯 + 協調 | 純協調 |
| 加新武器 | 改 if/else | 改 if/else | 加一個物件 |
| 找怪物邏輯 | 搜尋 750 行 | 搜尋 App.vue | 開 useMonster.js |

## 觀眾帶走什麼？

1. Composable 是 Vue 3 的邏輯封裝工具
2. 策略模式用物件取代 if/else，讓程式碼更好擴充
3. 重構不改功能，只改結構——使用者感受不到差異，但開發者的體驗天差地別
