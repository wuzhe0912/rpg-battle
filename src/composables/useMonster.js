import { ref } from 'vue'

const monsterNames = ['哥布林', '史萊姆', '骷髏兵', '暗影狼', '毒蜘蛛', '石像鬼', '火焰蜥蜴']

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function useMonster() {
  const name = ref('')
  const hp = ref(0)
  const maxHp = ref(0)
  const atk = ref(0)
  const shake = ref(false)

  function spawn() {
    const idx = randomInt(0, monsterNames.length - 1)
    name.value = monsterNames[idx]
    const roll = randomInt(50, 80)
    hp.value = roll
    maxHp.value = roll
    atk.value = randomInt(5, 10)
    return { name: name.value, hp: roll }
  }

  function calcDamage() {
    return randomInt(atk.value - 2, atk.value + 2)
  }

  function takeDamage(dmg) {
    hp.value = Math.max(0, hp.value - dmg)
    return hp.value <= 0
  }

  function triggerShake() {
    shake.value = true
    setTimeout(() => { shake.value = false }, 300)
  }

  return {
    name, hp, maxHp, atk, shake,
    spawn, calcDamage, takeDamage, triggerShake,
  }
}
