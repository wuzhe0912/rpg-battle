function init() {
  const products = [
    { name: '經典黑 T-Shirt', price: 590, image: '👕' },
    { name: '基本款帽T', price: 890, image: '🧥' },
    { name: '聯名帆布包', price: 1280, image: '👜' },
    { name: '造型手機殼', price: 490, image: '📱' },
    { name: '限量公仔', price: 2990, image: '🎎' },
    { name: '簽名海報', price: 350, image: '🖼️' },
  ];

  const logContainer = document.getElementById('log');
  let timer = null;

  function addLog(text, type) {
    const line = document.createElement('div');
    line.className = type;
    const time = new Date().toLocaleTimeString('zh-TW', {
      hour12: false,
      fractionalSecondDigits: 3,
    });
    line.textContent = `[${time}] ${text}`;
    logContainer.appendChild(line);
    logContainer.scrollTop = logContainer.scrollHeight;
  }

  // 初始渲染
  renderProducts(products);

  // 搜尋 — 所有邏輯混在事件處理裡
  document.getElementById('search').addEventListener('input', (e) => {
    const keyword = e.target.value.trim();
    addLog(`input 事件觸發：「${keyword}」`, 'input-event');

    // setTimeout 把搜尋丟進 task queue
    clearTimeout(timer);
    timer = setTimeout(() => {
      addLog(`setTimeout callback 執行：搜尋「${keyword}」`, 'search-event');

      // 篩選邏輯直接寫在 callback 裡
      const filtered =
        keyword === ''
          ? products
          : products.filter((p) =>
              p.name.toLowerCase().includes(keyword.toLowerCase()),
            );

      document.getElementById('count').textContent =
        `${filtered.length} / ${products.length} 件`;

      // 渲染也混在這裡
      renderProducts(filtered);
      addLog(`DOM 更新完成：${filtered.length} 件商品`, 'render-event');
    }, 300);
  });

  function renderProducts(list) {
    const container = document.getElementById('product-list');
    container.replaceChildren();

    if (list.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'empty';
      empty.textContent = '找不到符合的商品';
      container.appendChild(empty);
      return;
    }

    list.forEach((product) => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const image = document.createElement('span');
      image.className = 'product-image';
      image.textContent = product.image;

      const name = document.createElement('h3');
      name.textContent = product.name;

      const price = document.createElement('p');
      price.className = 'price';
      price.textContent = `$${product.price}`;

      card.append(image, name, price);
      container.appendChild(card);
    });
  }

  // 清除 log
  document.getElementById('clear-log').onclick = () => {
    logContainer.replaceChildren();
  };
}

init();
