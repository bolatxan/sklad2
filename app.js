// Глобальные данные приложения
let appData = {
    exchangeRate: 65,
    warehouse: [
        {id: 1, product: "Платье", size: "S", color: "Красный", price: 25, stock: 15},
        {id: 2, product: "Платье", size: "M", color: "Красный", price: 25, stock: 8},
        {id: 3, product: "Платье", size: "L", color: "Красный", price: 25, stock: 3},
        {id: 4, product: "Платье", size: "S", color: "Синий", price: 28, stock: 12},
        {id: 5, product: "Блузка", size: "M", color: "Белый", price: 18, stock: 20},
        {id: 6, product: "Блузка", size: "L", color: "Белый", price: 18, stock: 5},
        {id: 7, product: "Юбка", size: "S", color: "Черный", price: 22, stock: 0},
        {id: 8, product: "Юбка", size: "M", color: "Черный", price: 22, stock: 7},
        {id: 9, product: "Кардиган", size: "L", color: "Серый", price: 35, stock: 4},
        {id: 10, product: "Джинсы", size: "M", color: "Синий", price: 32, stock: 11}
    ],
    orders: [
        {id: 1, date: "2025-06-28", client: "Айгерим Нуржанова", phone: "+7 707 123 4567", city: "Алматы", product: "Платье", size: "M", color: "Красный", quantity: 1, buyPrice: 25, costPrice: 1625, totalSum: 8500, prepayment: 8500, finalPayment: 0, paymentStatus: "Оплачен", orderStatus: "Отправлен"},
        {id: 2, date: "2025-06-29", client: "Динара Сейтова", phone: "+7 701 987 6543", city: "Астана", product: "Блузка", size: "M", color: "Белый", quantity: 2, buyPrice: 18, costPrice: 2340, totalSum: 5800, prepayment: 3000, finalPayment: 0, paymentStatus: "Частично оплачен", orderStatus: "В обработке"},
        {id: 3, date: "2025-06-30", client: "Амина Касымова", phone: "+7 777 555 1234", city: "Шымкент", product: "Кардиган", size: "L", color: "Серый", quantity: 1, buyPrice: 35, costPrice: 2275, totalSum: 12000, prepayment: 0, finalPayment: 0, paymentStatus: "Не оплачен", orderStatus: "Новый"}
    ],
    nextOrderId: 4,
    nextProductId: 11
};

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Инициализация курса валют
    document.getElementById('exchange-rate').value = appData.exchangeRate;
    
    // Загрузка данных
    renderOrders();
    renderWarehouse();
    updateAnalytics();
    populateOrderFilters();
    populateProductSelects();
    
    // Обработчики форм
    document.getElementById('add-order-form').addEventListener('submit', handleAddOrder);
    document.getElementById('add-product-form').addEventListener('submit', handleAddProduct);
    
    // Обработчики модальных окон
    setupModalHandlers();
}

// Настройка обработчиков модальных окон
function setupModalHandlers() {
    // Закрытие модальных окон при клике вне области
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.classList.add('hidden');
        }
    });
    
    // Закрытие модальных окон по Escape
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            document.querySelectorAll('.modal:not(.hidden)').forEach(modal => {
                modal.classList.add('hidden');
            });
        }
    });
}

// Переключение между вкладками
function switchTab(tabName) {
    // Скрыть все вкладки
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убрать активный класс с кнопок навигации
    document.querySelectorAll('.nav-item').forEach(navItem => {
        navItem.classList.remove('active');
    });
    
    // Показать выбранную вкладку
    document.getElementById(`${tabName}-tab`).classList.add('active');
    
    // Активировать соответствующую кнопку навигации
    event.target.closest('.nav-item').classList.add('active');
    
    // Обновить данные для активной вкладки
    if (tabName === 'analytics') {
        updateAnalytics();
    }
}

// Управление заказами
function renderOrders() {
    const ordersList = document.getElementById('orders-list');
    const filteredOrders = getFilteredOrders();
    
    if (filteredOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">Нет заказов</div>
                <div class="empty-state-subtext">Добавьте первый заказ</div>
            </div>
        `;
        return;
    }
    
    ordersList.innerHTML = filteredOrders.map(order => `
        <div class="order-card ${getPaymentStatusClass(order.paymentStatus)}">
            <div class="order-header">
                <div class="order-id">Заказ #${order.id}</div>
                <div class="order-date">${formatDate(order.date)}</div>
            </div>
            <div class="order-details">
                <div class="order-detail-row">
                    <span class="order-detail-label">Клиент:</span>
                    <span class="order-detail-value">${order.client}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Телефон:</span>
                    <span class="order-detail-value">${order.phone}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Город:</span>
                    <span class="order-detail-value">${order.city}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Товар:</span>
                    <span class="order-detail-value">${order.product} ${order.size} ${order.color}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Количество:</span>
                    <span class="order-detail-value">${order.quantity} шт.</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Сумма:</span>
                    <span class="order-detail-value">${order.totalSum.toLocaleString()} ₸</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Статус оплаты:</span>
                    <span class="payment-status ${getPaymentStatusClass(order.paymentStatus)}">${order.paymentStatus}</span>
                </div>
                <div class="order-detail-row">
                    <span class="order-detail-label">Статус заказа:</span>
                    <span class="order-detail-value">${order.orderStatus}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function getFilteredOrders() {
    const statusFilter = document.getElementById('order-filter-status').value;
    const cityFilter = document.getElementById('order-filter-city').value;
    
    return appData.orders.filter(order => {
        if (statusFilter && order.paymentStatus !== statusFilter) return false;
        if (cityFilter && order.city !== cityFilter) return false;
        return true;
    });
}

function filterOrders() {
    renderOrders();
}

function populateOrderFilters() {
    const cityFilter = document.getElementById('order-filter-city');
    const cities = [...new Set(appData.orders.map(order => order.city))];
    
    cityFilter.innerHTML = '<option value="">Все города</option>' + 
        cities.map(city => `<option value="${city}">${city}</option>`).join('');
}

function getPaymentStatusClass(status) {
    switch (status) {
        case 'Оплачен': return 'status-paid';
        case 'Частично оплачен': return 'status-partial';
        case 'Не оплачен': return 'status-unpaid';
        default: return '';
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// Формы заказов
function showAddOrderForm() {
    document.getElementById('add-order-modal').classList.remove('hidden');
    populateProductSelects();
}

function hideAddOrderForm() {
    document.getElementById('add-order-modal').classList.add('hidden');
    document.getElementById('add-order-form').reset();
    // Очистить поля цен
    document.getElementById('order-buy-price').value = '';
    document.getElementById('order-cost-price').value = '';
}

function populateProductSelects() {
    const productSelect = document.getElementById('order-product');
    const products = [...new Set(appData.warehouse.map(item => item.product))];
    
    productSelect.innerHTML = '<option value="">Выберите товар</option>' + 
        products.map(product => `<option value="${product}">${product}</option>`).join('');
}

function updateProductOptions() {
    const selectedProduct = document.getElementById('order-product').value;
    const sizeSelect = document.getElementById('order-size');
    const colorSelect = document.getElementById('order-color');
    
    if (!selectedProduct) {
        sizeSelect.innerHTML = '<option value="">Выберите размер</option>';
        colorSelect.innerHTML = '<option value="">Выберите цвет</option>';
        return;
    }
    
    const productItems = appData.warehouse.filter(item => item.product === selectedProduct);
    const sizes = [...new Set(productItems.map(item => item.size))];
    
    sizeSelect.innerHTML = '<option value="">Выберите размер</option>' + 
        sizes.map(size => `<option value="${size}">${size}</option>`).join('');
    
    colorSelect.innerHTML = '<option value="">Выберите цвет</option>';
    
    updatePricing();
}

function updatePricing() {
    const product = document.getElementById('order-product').value;
    const size = document.getElementById('order-size').value;
    const color = document.getElementById('order-color').value;
    const quantity = parseInt(document.getElementById('order-quantity').value) || 1;
    
    if (!product || !size) {
        document.getElementById('order-buy-price').value = '';
        document.getElementById('order-cost-price').value = '';
        return;
    }
    
    // Обновить доступные цвета
    if (size) {
        const colorSelect = document.getElementById('order-color');
        const availableColors = appData.warehouse
            .filter(item => item.product === product && item.size === size)
            .map(item => item.color);
        
        colorSelect.innerHTML = '<option value="">Выберите цвет</option>' + 
            availableColors.map(color => `<option value="${color}">${color}</option>`).join('');
    }
    
    if (!color) {
        document.getElementById('order-buy-price').value = '';
        document.getElementById('order-cost-price').value = '';
        return;
    }
    
    // Найти товар на складе
    const warehouseItem = appData.warehouse.find(item => 
        item.product === product && item.size === size && item.color === color
    );
    
    if (warehouseItem) {
        const buyPrice = warehouseItem.price;
        const costPrice = buyPrice * appData.exchangeRate * quantity;
        
        document.getElementById('order-buy-price').value = buyPrice;
        document.getElementById('order-cost-price').value = Math.round(costPrice);
    }
    
    updatePaymentStatus();
}

function updatePaymentStatus() {
    const totalSum = parseFloat(document.getElementById('order-total-sum').value) || 0;
    const prepayment = parseFloat(document.getElementById('order-prepayment').value) || 0;
    const finalPayment = parseFloat(document.getElementById('order-final-payment').value) || 0;
    
    const totalPaid = prepayment + finalPayment;
    
    let paymentStatus;
    if (totalPaid === 0) {
        paymentStatus = 'Не оплачен';
    } else if (totalPaid >= totalSum) {
        paymentStatus = 'Оплачен';
    } else {
        paymentStatus = 'Частично оплачен';
    }
    
    // Можно добавить визуальную индикацию статуса оплаты
}

function handleAddOrder(event) {
    event.preventDefault();
    
    const orderData = {
        id: appData.nextOrderId++,
        date: new Date().toISOString().split('T')[0],
        client: document.getElementById('client-name').value,
        phone: document.getElementById('client-phone').value,
        city: document.getElementById('client-city').value,
        product: document.getElementById('order-product').value,
        size: document.getElementById('order-size').value,
        color: document.getElementById('order-color').value,
        quantity: parseInt(document.getElementById('order-quantity').value),
        buyPrice: parseFloat(document.getElementById('order-buy-price').value),
        costPrice: parseFloat(document.getElementById('order-cost-price').value),
        totalSum: parseFloat(document.getElementById('order-total-sum').value),
        prepayment: parseFloat(document.getElementById('order-prepayment').value) || 0,
        finalPayment: parseFloat(document.getElementById('order-final-payment').value) || 0,
        orderStatus: 'Новый'
    };
    
    // Определить статус оплаты
    const totalPaid = orderData.prepayment + orderData.finalPayment;
    if (totalPaid === 0) {
        orderData.paymentStatus = 'Не оплачен';
    } else if (totalPaid >= orderData.totalSum) {
        orderData.paymentStatus = 'Оплачен';
    } else {
        orderData.paymentStatus = 'Частично оплачен';
    }
    
    appData.orders.push(orderData);
    
    hideAddOrderForm();
    renderOrders();
    populateOrderFilters();
    updateAnalytics();
    
    return false;
}

// Управление складом
function renderWarehouse() {
    const warehouseList = document.getElementById('warehouse-list');
    const filteredWarehouse = getFilteredWarehouse();
    
    if (filteredWarehouse.length === 0) {
        warehouseList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <div class="empty-state-text">Склад пуст</div>
                <div class="empty-state-subtext">Добавьте первый товар</div>
            </div>
        `;
        return;
    }
    
    warehouseList.innerHTML = filteredWarehouse.map(item => `
        <div class="warehouse-card">
            <div class="warehouse-header">
                <div class="product-name">${item.product}</div>
                <div class="stock-status ${getStockStatusClass(item.stock)}">
                    ${getStockStatusText(item.stock)}
                </div>
            </div>
            <div class="warehouse-details">
                <div class="warehouse-detail-item">
                    <div class="warehouse-detail-label">Размер</div>
                    <div class="warehouse-detail-value">${item.size}</div>
                </div>
                <div class="warehouse-detail-item">
                    <div class="warehouse-detail-label">Цвет</div>
                    <div class="warehouse-detail-value">${item.color}</div>
                </div>
                <div class="warehouse-detail-item">
                    <div class="warehouse-detail-label">Цена (¥)</div>
                    <div class="warehouse-detail-value">${item.price}</div>
                </div>
                <div class="warehouse-detail-item">
                    <div class="warehouse-detail-label">Остаток</div>
                    <div class="warehouse-detail-value">${item.stock} шт.</div>
                </div>
            </div>
        </div>
    `).join('');
}

function getFilteredWarehouse() {
    const searchTerm = document.getElementById('warehouse-search').value.toLowerCase();
    
    return appData.warehouse.filter(item => {
        if (searchTerm) {
            return item.product.toLowerCase().includes(searchTerm) ||
                   item.size.toLowerCase().includes(searchTerm) ||
                   item.color.toLowerCase().includes(searchTerm);
        }
        return true;
    });
}

function searchWarehouse() {
    renderWarehouse();
}

function getStockStatusClass(stock) {
    if (stock > 10) return 'in-stock';
    if (stock > 0) return 'low-stock';
    return 'out-of-stock';
}

function getStockStatusText(stock) {
    if (stock > 10) return 'В наличии';
    if (stock > 0) return 'Мало';
    return 'Нет';
}

// Формы товаров
function showAddProductForm() {
    document.getElementById('add-product-modal').classList.remove('hidden');
}

function hideAddProductForm() {
    document.getElementById('add-product-modal').classList.add('hidden');
    document.getElementById('add-product-form').reset();
    document.getElementById('product-stock').value = 0;
}

function adjustQuantity(delta) {
    const stockInput = document.getElementById('product-stock');
    const currentValue = parseInt(stockInput.value) || 0;
    const newValue = Math.max(0, currentValue + delta);
    stockInput.value = newValue;
}

function duplicateProduct() {
    // Можно реализовать дублирование последнего добавленного товара
    alert('Функция дублирования будет реализована');
}

function handleAddProduct(event) {
    event.preventDefault();
    
    const productData = {
        id: appData.nextProductId++,
        product: document.getElementById('product-name').value,
        size: document.getElementById('product-size').value,
        color: document.getElementById('product-color').value,
        price: parseFloat(document.getElementById('product-price').value),
        stock: parseInt(document.getElementById('product-stock').value)
    };
    
    appData.warehouse.push(productData);
    
    hideAddProductForm();
    renderWarehouse();
    populateProductSelects();
    
    return false;
}

// Аналитика
function updateAnalytics() {
    const completedOrders = appData.orders.filter(order => order.orderStatus === 'Отправлен' || order.orderStatus === 'Доставлен');
    
    const totalSales = completedOrders.reduce((sum, order) => sum + order.totalSum, 0);
    const totalCost = completedOrders.reduce((sum, order) => sum + order.costPrice, 0);
    const totalProfit = totalSales - totalCost;
    const profitability = totalSales > 0 ? ((totalProfit / totalSales) * 100) : 0;
    
    document.getElementById('total-sales').textContent = `${totalSales.toLocaleString()} ₸`;
    document.getElementById('total-cost').textContent = `${totalCost.toLocaleString()} ₸`;
    document.getElementById('total-profit').textContent = `${totalProfit.toLocaleString()} ₸`;
    document.getElementById('total-orders').textContent = completedOrders.length.toString();
    document.getElementById('profitability').textContent = `${profitability.toFixed(1)}%`;
}

function updateExchangeRate() {
    const newRate = parseFloat(document.getElementById('exchange-rate').value);
    if (newRate > 0) {
        appData.exchangeRate = newRate;
        updatePricing(); // Обновить цены в форме заказа
        updateAnalytics();
    }
}

// Утилиты для мобильных устройств
function isMobile() {
    return window.innerWidth < 768;
}

// Обработка касаний для мобильных устройств
if ('ontouchstart' in window) {
    document.body.classList.add('touch-device');
}

// Предотвращение случайного увеличения при двойном касании
let lastTouchEnd = 0;
document.addEventListener('touchend', function (event) {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        event.preventDefault();
    }
    lastTouchEnd = now;
}, false);

// Автосохранение при вводе в формах (для предотвращения потери данных)
function setupAutoSave() {
    const inputs = document.querySelectorAll('.form-control');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            // Можно добавить автосохранение в localStorage при необходимости
            // Но согласно strict_instructions, localStorage не используется
        });
    });
}

// Инициализация автосохранения
setupAutoSave();