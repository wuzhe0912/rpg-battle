# V2 — 元件化重構

## 這個版本做了什麼？

從 V1 的單一檔案，拆分出三個 Vue 元件。功能不變，只改結構。

## 檔案結構

```
src/
├── App.vue                  ← 邏輯 + 協調元件
└── components/
    ├── PlayerCard.vue       ← 玩家卡片 UI + 操作按鈕
    ├── MonsterCard.vue      ← 怪物卡片 UI（純展示）
    └── BattleLog.vue        ← 戰鬥日誌（純展示）
```

## 教學重點

### 1. 關注點分離（Separation of Concerns）

每個元件只管自己的事。MonsterCard 只管顯示怪物資訊，不需要知道玩家的攻擊力怎麼算。

### 2. Props Down, Events Up

- **Props**：父元件（App.vue）透過 props 把資料傳給子元件
- **Emit**：子元件透過 emit 把事件通知父元件

### 3. 元件複雜度的光譜

| 元件 | Props | Emit | 複雜度 |
|------|-------|------|--------|
| BattleLog | logs 陣列 | 無 | 最簡單：純展示 |
| MonsterCard | name/hp/atk 等 | 無 | 簡單：有 computed 但無互動 |
| PlayerCard | 全部屬性 | attack/defend/use-potion/switch-weapon | 最複雜：有互動 |

### 4. 如何 import 元件回 App.vue

在 `<script setup>` 中 import：

```js
import PlayerCard from './components/PlayerCard.vue'
import MonsterCard from './components/MonsterCard.vue'
import BattleLog from './components/BattleLog.vue'
```

在 `<template>` 中用元件標籤取代原本的 HTML：

```vue
<PlayerCard
  :name="playerName"
  :hp="playerHp"
  @attack="doAttack"
  @defend="doDefend"
/>

<MonsterCard
  :name="monsterName"
  :hp="monsterHp"
  :max-hp="monsterMaxHp"
  :atk="monsterAtk"
  :shake="monsterShake"
/>

<BattleLog :logs="battleLog" />
```

## Commit 紀錄

每個 commit 對應一個元件的抽出，可以用 `git log` 查看每步做了什麼：

1. 抽出 PlayerCard — 學習 defineProps + defineEmits
2. 抽出 MonsterCard — 學習純展示元件（只有 props）
3. 抽出 BattleLog — 學習最簡單的 props-only 元件
4. 整合回 App.vue — 學習 import + props/emit 串聯

## 觀眾帶走什麼？

學會用 Vue 元件拆分 UI，理解 props/emit 的父子元件通訊模式。
