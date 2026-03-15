// Strategy Pattern: each weapon has its own damage calculation
// Adding a new weapon = adding one object, no if/else chain needed

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export const weaponStrategies = {
  sword: {
    name: '⚔️ 劍',
    description: '平衡型',
    calcDamage(baseAtk) {
      const dmg = randomInt(baseAtk - 2, baseAtk + 3)
      return { dmg: Math.max(1, dmg), text: '揮劍攻擊' }
    },
  },

  bow: {
    name: '🏹 弓',
    description: '高攻擊但不穩定',
    calcDamage(baseAtk) {
      const roll = randomInt(1, 100)
      let dmg, text

      if (roll <= 20) {
        dmg = randomInt(1, 3)
        text = '箭矢偏離'
      } else if (roll >= 80) {
        dmg = randomInt(baseAtk + 5, baseAtk + 10)
        text = '精準射擊！'
      } else {
        dmg = randomInt(baseAtk - 1, baseAtk + 5)
        text = '射出箭矢'
      }

      return { dmg: Math.max(1, dmg), text }
    },
  },

  magic: {
    name: '🔮 魔法',
    description: '無視部分防禦',
    calcDamage(baseAtk) {
      const dmg = randomInt(baseAtk - 3, baseAtk + 2)
      return { dmg: Math.max(1, dmg), text: '釋放魔法' }
    },
  },
}
