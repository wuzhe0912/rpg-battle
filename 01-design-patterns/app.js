const products = [
  { name: '經典黑 T-Shirt', price: 590 },
  { name: '聯名帆布包', price: 1280 },
  { name: '限量公仔', price: 2990 },
];

const memberTypes = [
  { key: 'none', label: '無會員' },
  { key: 'regular', label: '一般會員' },
  { key: 'vip', label: 'VIP' },
  { key: 'student', label: '學生' },
  { key: 'employee', label: '員工' },
  { key: 'birthday', label: '壽星' },
];

let selectedProduct = products[0];
let selectedMember = 'none';

function render() {
  // 渲染商品按鈕
  const productContainer = document.getElementById('products');
  productContainer.replaceChildren();
  products.forEach((product) => {
    const btn = document.createElement('button');
    btn.textContent = `${product.name} — $${product.price}`;
    btn.className = product === selectedProduct ? 'btn active' : 'btn';
    btn.onclick = () => {
      selectedProduct = product;
      render();
    };
    productContainer.appendChild(btn);
  });

  // 渲染會員按鈕
  const memberContainer = document.getElementById('members');
  memberContainer.replaceChildren();
  memberTypes.forEach((member) => {
    const btn = document.createElement('button');
    btn.textContent = member.label;
    btn.className = member.key === selectedMember ? 'btn active' : 'btn';
    btn.onclick = () => {
      selectedMember = member.key;
      render();
    };
    memberContainer.appendChild(btn);
  });

  // 計算折扣
  const price = selectedProduct.price;
  let finalPrice;
  let description;

  if (selectedMember === 'vip') {
    finalPrice = Math.round(price * 0.8);
    description = 'VIP 八折';
  } else if (selectedMember === 'regular') {
    finalPrice = Math.round(price * 0.9);
    description = '一般會員九折';
  } else if (selectedMember === 'student') {
    finalPrice = Math.round(price * 0.75);
    description = '學生七五折';
  } else if (selectedMember === 'employee') {
    finalPrice = Math.round(price * 0.6);
    description = '員工六折';
  } else if (selectedMember === 'birthday') {
    finalPrice = Math.max(price - 200, 0);
    description = '壽星折 $200';
  } else {
    finalPrice = price;
    description = '無折扣';
  }

  document.getElementById('original-price').textContent = `$${price}`;
  document.getElementById('discount-desc').textContent = description;
  document.getElementById('final-price').textContent = `$${finalPrice}`;
}

render();
