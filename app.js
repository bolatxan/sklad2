// Глобальные данные приложения
let appData = {
  orders: [
    {
      id: 1,
      date: "2025-06-29",
      client: "Анна Смит",
      phone: "+7 777 123 4567",
      city: "Астана",
      product: "Кроссовки Nike",
      size: "38",
      color: "Белый",
      quantity: 1,
      costPriceYuan: 250,
      costPriceTenge: 12500,
      totalAmount: 18000,
      profit: 5500,
      prepayment: 5000,
      postpayment: 13000,
      paymentStatus: "Оплачен",
      deliveryStatus: "Отправлен"
    },
    {
      id: 2,
      date: "2025-06-28",
      client: "Петр Иванов",
      phone: "+7 777 987 6543",
      city: "Алматы",
      product: "Куртка Adidas",
      size: "L",
      color: "Черный",
      quantity: 1,
      costPriceYuan: 300,
      costPriceTenge: 15000,
      totalAmount: 22000,
      profit: 7000,
      prepayment: 10000,
      postpayment: 0,
      paymentStatus: "Частично оплачен",
      deliveryStatus: "В обработке"
    }
  ],
  warehouse: [
    {
      id: 1,
      product: "Кроссовки Nike",
      size: "38",
      color: "Белый",
      stock: 5,
      costPriceYuan: 250
    },
    {
      id: 2,
      product: "Кроссовки Nike",
      size: "39",
      color: "Белый",
      stock: 3,
      costPriceYuan: 250
    },
    {
      id: 3,
      product: "Куртка Adidas",
      size: "L",
      color: "Черный",
      stock: 8,
      costPriceYuan: 300
    },
    {
      id: 4,
      product: "Куртка Adidas",
      size: "M",
      color: "Черный",
      stock: 12,
      costPriceYuan: 300
    },
    {
      id: 5,
      product: "Футболка Nike",
      size: "S",
      color: "Синий",
      stock: 15,
      costPriceYuan: 120
    }
  ],
  settings: {
    exchangeRate: 50,
    cities: ["Астана", "Алматы", "Шымкент", "Актобе", "Тараз"],
    products: ["Кроссовки Nike", "Куртка Adidas", "Футболка Nike", "Шорты Puma"],
    sizes: ["XS", "S", "M", "L", "XL", "36", "37", "38", "39", "40", "41", "42"],
    colors: ["Белый", "Черный", "Синий", "Красный", "Зеленый", "Серый"]
  }
};

let currentEditingOrder = null;
let nextOrderId = 3;
let nextWarehouseId = 6;

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
  setupEventListeners();
  updateDashboard();
  renderOrders();
  renderWarehouse();
  renderAnalytics();
  populateFormSelects();
});

function initializeApp() {
  // Показать первую вкладку
  showTab('dashboard');
  
  // Установить курс валют в настройках
  document.getElementById('exchangeRate').value = appData.settings.exchangeRate;
}

function setupEventListeners() {
  // Навигация по табам
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      const tabName = this.dataset.tab;
      showTab(tabName);
    });
  });

  // Кнопка добавления заказа
  document.getElementById('addOrderBtn').addEventListener('click', openOrderModal);

  // Модальные окна
  document.getElementById('closeModal').addEventListener('click', closeOrderModal);
  document.getElementById('cancelOrder').addEventListener('click', closeOrderModal);
  document.getElementById('closeEditModal').addEventListener('click', closeEditOrderModal);
  document.getElementById('cancelEdit').addEventListener('click', closeEditOrderModal);

  // Формы
  document.getElementById('orderForm').addEventListener('submit', handleOrderSubmit);
  document.getElementById('editOrderForm').addEventListener('submit', handleEditOrderSubmit);

  // Фильтры и поиск
  document.getElementById('statusFilter').addEventListener('change', filterOrders);
  document.getElementById('searchInput').addEventListener('input', filterOrders);

  // Настройки
  document.getElementById('saveSettings').addEventListener('click', saveSettings);
  document.getElementById('clearData').addEventListener('click', clearData);

  // Обновление расчетов в форме заказа
  const orderFormFields = ['productSelect', 'sizeSelect', 'colorSelect', 'quantity', 'totalAmount'];
  orderFormFields.forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('change', updateOrderCalculations);
    }
  });

  // Закрытие модального окна при клике вне его
  document.getElementById('orderModal').addEventListener('click', function(e) {
    if (e.target === this) closeOrderModal();
  });
  
  document.getElementById('editOrderModal').addEventListener('click', function(e) {
    if (e.target === this) closeEditOrderModal();
  });

  // Swipe для мобильных устройств
  setupSwipeNavigation();
}

function showTab(tabName) {
  // Скрыть все панели
  document.querySelectorAll('.tab-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  
  // Показать выбранную панель
  document.getElementById(tabName).classList.add('active');
  
  // Обновить активный таб
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.remove('active');
  });
  
  document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
  
  // Обновить контент при переключении
  if (tabName === 'dashboard') {
    updateDashboard();
  } else if (tabName === 'analytics') {
    renderAnalytics();
  }
}

function openOrderModal() {
  document.getElementById('orderModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeOrderModal() {
  document.getElementById('orderModal').classList.remove('active');
  document.body.style.overflow = '';
  document.getElementById('orderForm').reset();
  updateOrderCalculations();
}

function closeEditOrderModal() {
  document.getElementById('editOrderModal').classList.remove('active');
  document.body.style.overflow = '';
  currentEditingOrder = null;
}

function populateFormSelects() {
  // Заполнить города
  const citySelect = document.getElementById('clientCity');
  citySelect.innerHTML = '<option value="">Выберите город</option>';
  appData.settings.cities.forEach(city => {
    citySelect.innerHTML += `<option value="${city}">${city}</option>`;
  });

  // Заполнить товары
  const productSelect = document.getElementById('productSelect');
  productSelect.innerHTML = '<option value="">Выберите товар</option>';
  appData.settings.products.forEach(product => {
    productSelect.innerHTML += `<option value="${product}">${product}</option>`;
  });

  // Заполнить размеры
  const sizeSelect = document.getElementById('sizeSelect');
  sizeSelect.innerHTML = '<option value="">Выберите размер</option>';
  appData.settings.sizes.forEach(size => {
    sizeSelect.innerHTML += `<option value="${size}">${size}</option>`;
  });

  // Заполнить цвета
  const colorSelect = document.getElementById('colorSelect');
  colorSelect.innerHTML = '<option value="">Выберите цвет</option>';
  appData.settings.colors.forEach(color => {
    colorSelect.innerHTML += `<option value="${color}">${color}</option>`;
  });
}
// После существующих заполнений:
const wProduct = document.getElementById('warehouseProduct');
const wSize    = document.getElementById('warehouseSize');
const wColor   = document.getElementById('warehouseColor');

wProduct.innerHTML = wSize.innerHTML = wColor.innerHTML = ''; // очистка

appData.settings.products.forEach(p =>
  wProduct.innerHTML += `<option value="${p}">${p}</option>`
);
appData.settings.sizes.forEach(s =>
  wSize.innerHTML    += `<option value="${s}">${s}</option>`
);
appData.settings.colors.forEach(c =>
  wColor.innerHTML   += `<option value="${c}">${c}</option>`
);

function updateOrderCalculations() {
  const product = document.getElementById('productSelect').value;
  const size = document.getElementById('sizeSelect').value;
  const color = document.getElementById('colorSelect').value;
  const quantity = parseInt(document.getElementById('quantity').value) || 1;
  const totalAmount = parseFloat(document.getElementById('totalAmount').value) || 0;

  // Найти себестоимость из склада
  const warehouseItem = appData.warehouse.find(item => 
    item.product === product && item.size === size && item.color === color
  );

  let costPriceTenge = 0;
  if (warehouseItem) {
    costPriceTenge = warehouseItem.costPriceYuan * appData.settings.exchangeRate * quantity;
  }

  const profit = totalAmount - costPriceTenge;

  document.getElementById('costDisplay').textContent = `${costPriceTenge.toLocaleString()} ₸`;
  document.getElementById('profitDisplay').textContent = `${profit.toLocaleString()} ₸`;
}

function handleOrderSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const product = document.getElementById('productSelect').value;
  const size = document.getElementById('sizeSelect').value;
  const color = document.getElementById('colorSelect').value;
  const quantity = parseInt(document.getElementById('quantity').value);
  
  // Проверить наличие на складе
  const warehouseItem = appData.warehouse.find(item => 
    item.product === product && item.size === size && item.color === color
  );
  
  if (!warehouseItem || warehouseItem.stock < quantity) {
    alert('Недостаточно товара на складе!');
    return;
  }

  const totalAmount = parseFloat(document.getElementById('totalAmount').value);
  const prepayment = parseFloat(document.getElementById('prepayment').value) || 0;
  const costPriceTenge = warehouseItem.costPriceYuan * appData.settings.exchangeRate * quantity;
  
  const newOrder = {
    id: nextOrderId++,
    date: new Date().toISOString().split('T')[0],
    client: document.getElementById('clientName').value,
    phone: document.getElementById('clientPhone').value,
    city: document.getElementById('clientCity').value,
    product: product,
    size: size,
    color: color,
    quantity: quantity,
    costPriceYuan: warehouseItem.costPriceYuan,
    costPriceTenge: costPriceTenge,
    totalAmount: totalAmount,
    profit: totalAmount - costPriceTenge,
    prepayment: prepayment,
    postpayment: totalAmount - prepayment,
    paymentStatus: prepayment >= totalAmount ? 'Оплачен' : (prepayment > 0 ? 'Частично оплачен' : 'Не оплачен'),
    deliveryStatus: 'Новый'
  };

  appData.orders.push(newOrder);
  renderOrders();
  updateDashboard();
  closeOrderModal();
}

function renderOrders() {
  const ordersList = document.getElementById('ordersList');
  const filteredOrders = getFilteredOrders();
  
  ordersList.innerHTML = filteredOrders.map(order => `
    <div class="order-card status-${getOrderStatusClass(order.paymentStatus)}" onclick="openEditOrderModal(${order.id})">
      <div class="order-header">
        <div class="order-client">${order.client}</div>
        <div class="order-amount">${order.totalAmount.toLocaleString()} ₸</div>
      </div>
      <div class="order-details">
        <div><strong>Товар:</strong> ${order.product}</div>
        <div><strong>Размер:</strong> ${order.size}</div>
        <div><strong>Цвет:</strong> ${order.color}</div>
        <div><strong>Город:</strong> ${order.city}</div>
        <div><strong>Телефон:</strong> ${order.phone}</div>
        <div><strong>Дата:</strong> ${formatDate(order.date)}</div>
      </div>
      <div class="order-statuses">
        <span class="status status--${getOrderStatusClass(order.paymentStatus)}">${order.paymentStatus}</span>
        <span class="status status--info">${order.deliveryStatus}</span>
      </div>
    </div>
  `).join('');
}

function getFilteredOrders() {
  let filtered = [...appData.orders];
  
  const statusFilter = document.getElementById('statusFilter').value;
  const searchQuery = document.getElementById('searchInput').value.toLowerCase();
  
  if (statusFilter) {
    filtered = filtered.filter(order => order.paymentStatus === statusFilter);
  }
  
  if (searchQuery) {
    filtered = filtered.filter(order => 
      order.client.toLowerCase().includes(searchQuery) ||
      order.phone.includes(searchQuery) ||
      order.id.toString().includes(searchQuery)
    );
  }
  
  return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function filterOrders() {
  renderOrders();
}

function openEditOrderModal(orderId) {
  const order = appData.orders.find(o => o.id === orderId);
  if (!order) return;
  
  currentEditingOrder = order;
  
  document.getElementById('editPaymentStatus').value = order.paymentStatus;
  document.getElementById('editDeliveryStatus').value = order.deliveryStatus;
  document.getElementById('editPostpayment').value = order.postpayment;
  
  document.getElementById('editOrderModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function handleEditOrderSubmit(e) {
  e.preventDefault();
  
  if (!currentEditingOrder) return;
  
  const newPaymentStatus = document.getElementById('editPaymentStatus').value;
  const newDeliveryStatus = document.getElementById('editDeliveryStatus').value;
  const newPostpayment = parseFloat(document.getElementById('editPostpayment').value) || 0;
  
  // Обновить заказ
  currentEditingOrder.paymentStatus = newPaymentStatus;
  currentEditingOrder.deliveryStatus = newDeliveryStatus;
  currentEditingOrder.postpayment = newPostpayment;
  
  // Если статус доставки изменился на "Отправлен", списать со склада
  if (newDeliveryStatus === 'Отправлен') {
    updateWarehouseStock(currentEditingOrder);
  }
  
  renderOrders();
  updateDashboard();
  closeEditOrderModal();
}

function updateWarehouseStock(order) {
  const warehouseItem = appData.warehouse.find(item => 
    item.product === order.product && 
    item.size === order.size && 
    item.color === order.color
  );
  
  if (warehouseItem && warehouseItem.stock >= order.quantity) {
    warehouseItem.stock -= order.quantity;
    renderWarehouse();
  }
}

function renderWarehouse() {
  const warehouseList = document.getElementById('warehouseList');
  
  warehouseList.innerHTML = appData.warehouse.map(item => `
    <div class="warehouse-item">
      <div class="warehouse-header">
        <div class="warehouse-product">${item.product}</div>
        <div class="warehouse-stock ${item.stock <= 3 ? 'low' : ''}">${item.stock} шт.</div>
      </div>
      <div class="warehouse-details">
        <div><strong>Размер:</strong> ${item.size}</div>
        <div><strong>Цвет:</strong> ${item.color}</div>
        <div><strong>Цена:</strong> ¥${item.costPriceYuan}</div>
      </div>
    </div>
  `).join('');
}

function updateDashboard() {
  const totalOrders = appData.orders.length;
  const totalRevenue = appData.orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalProfit = appData.orders.reduce((sum, order) => sum + order.profit, 0);
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue * 100).toFixed(1) : 0;
  
  document.getElementById('totalOrders').textContent = totalOrders;
  document.getElementById('totalRevenue').textContent = `${totalRevenue.toLocaleString()} ₸`;
  document.getElementById('totalProfit').textContent = `${totalProfit.toLocaleString()} ₸`;
  document.getElementById('profitMargin').textContent = `${profitMargin}%`;
  
  // Последние заказы
  const recentOrders = appData.orders.slice(-3).reverse();
  const recentOrdersList = document.getElementById('recentOrdersList');
  
  recentOrdersList.innerHTML = recentOrders.map(order => `
    <div class="order-card status-${getOrderStatusClass(order.paymentStatus)}" onclick="showTab('orders')">
      <div class="order-header">
        <div class="order-client">${order.client}</div>
        <div class="order-amount">${order.totalAmount.toLocaleString()} ₸</div>
      </div>
      <div class="order-statuses">
        <span class="status status--${getOrderStatusClass(order.paymentStatus)}">${order.paymentStatus}</span>
      </div>
    </div>
  `).join('');
}

function renderAnalytics() {
  // Статистика по статусам
  const statusStats = {};
  appData.orders.forEach(order => {
    statusStats[order.paymentStatus] = (statusStats[order.paymentStatus] || 0) + 1;
  });
  
  const statusStatsEl = document.getElementById('statusStats');
  statusStatsEl.innerHTML = Object.entries(statusStats).map(([status, count]) => `
    <div class="stat-item">
      <span>${status}</span>
      <span>${count}</span>
    </div>
  `).join('');
  
  // Топ товары
  const productStats = {};
  appData.orders.forEach(order => {
    productStats[order.product] = (productStats[order.product] || 0) + order.quantity;
  });
  
  const topProducts = Object.entries(productStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);
  
  const topProductsEl = document.getElementById('topProducts');
  topProductsEl.innerHTML = topProducts.map(([product, quantity]) => `
    <div class="stat-item">
      <span>${product}</span>
      <span>${quantity} шт.</span>
    </div>
  `).join('');
}

function saveSettings() {
  const exchangeRate = parseFloat(document.getElementById('exchangeRate').value);
  if (exchangeRate > 0) {
    appData.settings.exchangeRate = exchangeRate;
    
    // Пересчитать все заказы
    appData.orders.forEach(order => {
      order.costPriceTenge = order.costPriceYuan * exchangeRate * order.quantity;
      order.profit = order.totalAmount - order.costPriceTenge;
    });
    
    updateDashboard();
    renderOrders();
    alert('Настройки сохранены!');
  }
}

function clearData() {
  if (confirm('Вы уверены, что хотите очистить все данные? Это действие нельзя отменить.')) {
    appData.orders = [];
    appData.warehouse.forEach(item => item.stock = 0);
    renderOrders();
    renderWarehouse();
    updateDashboard();
    renderAnalytics();
    alert('Данные очищены!');
  }
}

function getOrderStatusClass(status) {
  switch (status) {
    case 'Не оплачен': return 'unpaid';
    case 'Частично оплачен': return 'partial';
    case 'Оплачен': return 'paid';
    default: return 'unpaid';
  }
}

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('ru-RU');
}

// Swipe навигация для мобильных устройств
function setupSwipeNavigation() {
  let startX = 0;
  let currentTab = 'dashboard';
  const tabs = ['dashboard', 'orders', 'warehouse', 'analytics', 'settings'];
  
  document.addEventListener('touchstart', function(e) {
    startX = e.touches[0].clientX;
  });
  
  document.addEventListener('touchend', function(e) {
    const endX = e.changedTouches[0].clientX;
    const diffX = startX - endX;
    
    if (Math.abs(diffX) > 50) { // Минимальное расстояние для swipe
      const currentIndex = tabs.indexOf(currentTab);
      
      if (diffX > 0 && currentIndex < tabs.length - 1) {
        // Swipe влево - следующий таб
        currentTab = tabs[currentIndex + 1];
        showTab(currentTab);
      } else if (diffX < 0 && currentIndex > 0) {
        // Swipe вправо - предыдущий таб
        currentTab = tabs[currentIndex - 1];
        showTab(currentTab);
      }
    }
  });
  
  // Отслеживаем текущий активный таб
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', function() {
      currentTab = this.dataset.tab;
    });
  });
}
/* ----------  Функции и события для склада  ---------- */
function openWarehouseModal() {
  document.getElementById('warehouseModal').classList.add('active');
  document.body.style.overflow = 'hidden';
  document.getElementById('warehouseForm').reset();
  updateWarehouseCost();
}

function closeWarehouseModal() {
  document.getElementById('warehouseModal').classList.remove('active');
  document.body.style.overflow = '';
}

function updateWarehouseCost() {
  const yuan = parseFloat(document.getElementById('warehouseCostYuan').value) || 0;
  const qty  = parseInt(document.getElementById('warehouseStock').value) || 1;
  const cost = yuan * appData.settings.exchangeRate * qty;
  document.getElementById('warehouseCostTenge').textContent = cost.toLocaleString() + ' ₸';
}

function handleWarehouseSubmit(e) {
  e.preventDefault();
  const product = document.getElementById('warehouseProduct').value;
  const size    = document.getElementById('warehouseSize').value;
  const color   = document.getElementById('warehouseColor').value;
  const stock   = parseInt(document.getElementById('warehouseStock').value);
  const costY   = parseFloat(document.getElementById('warehouseCostYuan').value);

  if (!product || !size || !color || stock <= 0 || costY < 0) {
    alert('Заполните все поля корректно!');
    return;
  }

  const existed = appData.warehouse.find(
    item => item.product === product && item.size === size && item.color === color
  );

  if (existed) {
    existed.stock += stock;
    existed.costPriceYuan = costY; // можно хранить последнюю цену
  } else {
    appData.warehouse.push({
      id: nextWarehouseId++,
      product,
      size,
      color,
      stock,
      costPriceYuan: costY
    });
  }

  renderWarehouse();
  closeWarehouseModal();
}

/* --- Добавляем слушатели в setupEventListeners() --- */
document.getElementById('addWarehouseBtn')
        .addEventListener('click', openWarehouseModal);
document.getElementById('closeWarehouseModal')
        .addEventListener('click', closeWarehouseModal);
document.getElementById('cancelWarehouse')
        .addEventListener('click', closeWarehouseModal);
document.getElementById('warehouseForm')
        .addEventListener('submit', handleWarehouseSubmit);
/* --- Автоматический перерасчёт себестоимости --- */
['warehouseCostYuan', 'warehouseStock'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updateWarehouseCost);
});
