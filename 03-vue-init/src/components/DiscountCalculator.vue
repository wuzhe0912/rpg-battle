<script setup>
// 第一課的資料，直接搬過來
const products = [
  { name: '經典黑 T-Shirt', price: 590 },
  { name: '聯名帆布包', price: 1280 },
  { name: '限量公仔', price: 2990 },
]

const strategies = {
  none:     { label: '無折扣',       calc: (p) => p },
  regular:  { label: '一般會員九折', calc: (p) => Math.round(p * 0.9) },
  vip:      { label: 'VIP 八折',     calc: (p) => Math.round(p * 0.8) },
  student:  { label: '學生七五折',   calc: (p) => Math.round(p * 0.75) },
  employee: { label: '員工六折',     calc: (p) => Math.round(p * 0.6) },
  birthday: { label: '壽星折 $200',  calc: (p) => Math.max(p - 200, 0) },
}

const memberTypes = [
  { key: 'none', label: '無會員' },
  { key: 'regular', label: '一般會員' },
  { key: 'vip', label: 'VIP' },
  { key: 'student', label: '學生' },
  { key: 'employee', label: '員工' },
  { key: 'birthday', label: '壽星' },
]
</script>

<template>
  <div class="container">
    <h1>折扣計算器</h1>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  max-width: 600px;
  margin: 2rem auto;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #fff;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  line-height: 1.6;
  color: #333;
}

h1 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

h2 {
  font-size: 1rem;
  color: #666;
  margin-bottom: 0.75rem;
}

section {
  margin-bottom: 1.5rem;
}

.btn-group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn:hover {
  border-color: #999;
}

.btn.active {
  border-color: #4a90d9;
  background: #e8f0fe;
  color: #1a56db;
}

.result {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.25rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
}

.price-row + .price-row {
  border-top: 1px solid #e0e0e0;
  margin-top: 0.5rem;
  padding-top: 0.75rem;
}

.final {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e53935;
}
</style>
