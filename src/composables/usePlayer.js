import { ref } from 'vue'
import { weaponStrategies } from '../strategies/weapons.js'

export function usePlayer() {
  const name = ref('勇者')
  const hp = ref(100)
  const maxHp = ref(100)
  const baseAtk = ref(12)
  const def = ref(5)
  const potions = ref(3)
  const isDefending = ref(false)
  const shake = ref(false)
  const monstersKilled = ref(0)

  const currentWeapon = ref('sword')
  const weapons = ref(['sword'])

  function calcDamage() {
    const strategy = weaponStrategies[currentWeapon.value]
    return strategy.calcDamage(baseAtk.value)
  }

  function takeDamage(rawDmg) {
    let actualDmg = rawDmg - def.value

    if (isDefending.value) {
      actualDmg = Math.floor(actualDmg * 0.5)
      isDefending.value = false
      actualDmg = Math.max(1, actualDmg)
      hp.value = Math.max(0, hp.value - actualDmg)
      return { actualDmg, wasDefending: true }
    }

    actualDmg = Math.max(1, actualDmg)
    hp.value = Math.max(0, hp.value - actualDmg)
    return { actualDmg, wasDefending: false }
  }

  function defend() {
    isDefending.value = true
  }

  function usePotion() {
    if (potions.value <= 0) return { healed: 0, remaining: 0, empty: true }
    potions.value--
    const oldHp = hp.value
    hp.value = Math.min(maxHp.value, hp.value + 30)
    return { healed: hp.value - oldHp, remaining: potions.value, empty: false }
  }

  function switchWeapon(type) {
    if (!weapons.value.includes(type)) return false
    currentWeapon.value = type
    return true
  }

  function addWeapon(type) {
    if (weapons.value.includes(type)) return false
    weapons.value.push(type)
    return true
  }

  function addPotion() {
    potions.value++
  }

  function triggerShake() {
    shake.value = true
    setTimeout(() => { shake.value = false }, 300)
  }

  function reset() {
    hp.value = 100
    maxHp.value = 100
    potions.value = 3
    monstersKilled.value = 0
    currentWeapon.value = 'sword'
    weapons.value = ['sword']
    isDefending.value = false
  }

  return {
    name, hp, maxHp, baseAtk, def,
    potions, isDefending, shake, monstersKilled,
    currentWeapon, weapons,
    calcDamage, takeDamage, defend, usePotion,
    switchWeapon, addWeapon, addPotion, triggerShake, reset,
  }
}
