class OrderManagementSystem {
    constructor() {
        this.orders = [];
        this.inventory = [];
        this.exchangeRate = 65;
        this.nextOrderId = 1;
        this.currentEditingOrder = null;
        this.currentEditingProduct = null;
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.renderAllTabs();
        this.updateAnalytics();
    }

    loadData() {
        // Load from localStorage or use sample data
        const savedOrders = localStorage.getItem('orders');
        const savedInventory = localStorage.getItem('inventory');
        const savedExchangeRate = localStorage.getItem('exchangeRate');
        const savedNextOrderId = localStorage.getItem('nextOrderId');

        if (savedOrders) {
            this.orders = JSON.parse(savedOrders);
        } else {
            // Use sample data
            this.orders = [
                {
                    id: 1,
                    date: "2025-06-25",
                    client: "Иван Петров",
                    product: "Футболка",
                    size: "M", 
                    color: "Красный",
                    quantity: 2,
                    city: "Алматы",
                    priceYuan: 25,
                    costKzt: 3250,
                    totalKzt: 4000,
                    prepayment: 2000,
                    remainder: 2000,
                    profit: 750,
                    paymentStatus: "Оплачен",
                    orderStatus: "Отправлен"
                }
            ];
        }

        if (savedInventory) {
            this.inventory = JSON.parse(savedInventory);
        } else {
            // Use sample data
            this.inventory = [
                {"key": "Футболка_M_Красный", "name": "Футболка", "size": "M", "color": "Красный", "priceYuan": 25, "stock": 10},
                {"key": "Футболка_L_Красный", "name": "Футболка", "size": "L", "color": "Красный", "priceYuan": 25, "stock": 8},
                {"key": "Футболка_M_Синий", "name": "Футболка", "size": "M", "color": "Синий", "priceYuan": 25, "stock": 12},
                {"key": "Джинсы_32_Черный", "name": "Джинсы", "size": "32", "color": "Черный", "priceYuan": 45, "stock": 5},
                {"key": "Джинсы_34_Черный", "name": "Джинсы", "size": "34", "color": "Черный", "priceYuan": 45, "stock": 7},
                {"key": "Кроссовки_42_Белый", "name": "Кроссовки", "size": "42", "color": "Белый", "priceYuan": 80, "stock": 3},
                {"key": "Кроссовки_43_Белый", "name": "Кроссовки", "size": "43", "color": "Белый", "priceYuan": 80, "stock": 4}
            ];
        }

        this.exchangeRate = savedExchangeRate ? parseFloat(savedExchangeRate) : 65;
        this.nextOrderId = savedNextOrderId ? parseInt(savedNextOrderId) : Math.max(...this.orders.map(o => o.id), 0) + 1;
    }

    saveData() {
        localStorage.setItem('orders', JSON.stringify(this.orders));
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
        localStorage.setItem('exchangeRate', this.exchangeRate.toString());
        localStorage.setItem('nextOrderId', this.nextOrderId.toString());
    }

    setupEventListeners() {
        // Tab navigation
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const tabName = e.target.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Order management
        document.getElementById('add-order-btn').addEventListener('click', () => this.openOrderModal());
        document.getElementById('close-order-modal').addEventListener('click', () => this.closeOrderModal());
        document.getElementById('cancel-order').addEventListener('click', () => this.closeOrderModal());
        document.getElementById('order-form').addEventListener('submit', (e) => this.handleOrderSubmit(e));

        // Product management
        document.getElementById('add-product-btn').addEventListener('click', () => this.openProductModal());
        document.getElementById('close-product-modal').addEventListener('click', () => this.closeProductModal());
        document.getElementById('cancel-product').addEventListener('click', () => this.closeProductModal());
        document.getElementById('product-form').addEventListener('submit', (e) => this.handleProductSubmit(e));

        // Settings
        document.getElementById('save-settings').addEventListener('click', () => this.saveSettings());

        // Filters
        document.getElementById('reset-filters').addEventListener('click', () => this.resetFilters());
        ['filter-product', 'filter-size', 'filter-color', 'filter-city', 'filter-payment-status', 'filter-order-status'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.applyFilters());
        });

        // Order form calculations
        ['product', 'size', 'color', 'quantity', 'total-kzt', 'prepayment', 'remainder'].forEach(id => {
            document.getElementById(id).addEventListener('change', () => this.updateOrderCalculations());
        });

        // Modal close on backdrop click
        document.getElementById('order-modal').addEventListener('click', (e) => {
            if (e.target.id === 'order-modal') this.closeOrderModal();
        });
        document.getElementById('product-modal').addEventListener('click', (e) => {
            if (e.target.id === 'product-modal') this.closeProductModal();
        });
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${tabName}-tab`).classList.add('active');

        // Render specific tab content
        if (tabName === 'orders') {
            this.renderOrders();
            this.setupFilters();
        } else if (tabName === 'inventory') {
            this.renderInventory();
        } else if (tabName === 'analytics') {
            this.updateAnalytics();
        } else if (tabName === 'settings') {
            document.getElementById('exchange-rate').value = this.exchangeRate;
        }
    }

    renderAllTabs() {
        this.renderOrders();
        this.renderInventory();
        this.setupFilters();
        document.getElementById('exchange-rate').value = this.exchangeRate;
    }

    setupFilters() {
        const products = [...new Set(this.inventory.map(item => item.name))];
        const sizes = [...new Set(this.inventory.map(item => item.size))];
        const colors = [...new Set(this.inventory.map(item => item.color))];
        const cities = ["Алматы", "Астана", "Шымкент", "Актобе", "Тараз", "Павлодар"];
        const paymentStatuses = ["Не оплачен", "Частично оплачен", "Оплачен"];
        const orderStatuses = ["Новый", "В обработке", "Отправлен", "Доставлен", "Отменен"];

        this.populateSelect('filter-product', products);
        this.populateSelect('filter-size', sizes);
        this.populateSelect('filter-color', colors);
        this.populateSelect('filter-city', cities);
        this.populateSelect('filter-payment-status', paymentStatuses);
        this.populateSelect('filter-order-status', orderStatuses);
    }

    populateSelect(selectId, options) {
        const select = document.getElementById(selectId);
        const currentValue = select.value;
        
        // Keep the first option (All...)
        const firstOption = select.options[0];
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        options.forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
        
        select.value = currentValue;
    }

    applyFilters() {
        const filters = {
            product: document.getElementById('filter-product').value,
            size: document.getElementById('filter-size').value,
            color: document.getElementById('filter-color').value,
            city: document.getElementById('filter-city').value,
            paymentStatus: document.getElementById('filter-payment-status').value,
            orderStatus: document.getElementById('filter-order-status').value
        };

        const filteredOrders = this.orders.filter(order => {
            return (!filters.product || order.product === filters.product) &&
                   (!filters.size || order.size === filters.size) &&
                   (!filters.color || order.color === filters.color) &&
                   (!filters.city || order.city === filters.city) &&
                   (!filters.paymentStatus || order.paymentStatus === filters.paymentStatus) &&
                   (!filters.orderStatus || order.orderStatus === filters.orderStatus);
        });

        this.renderOrdersList(filteredOrders);
    }

    resetFilters() {
        ['filter-product', 'filter-size', 'filter-color', 'filter-city', 'filter-payment-status', 'filter-order-status'].forEach(id => {
            document.getElementById(id).value = '';
        });
        this.renderOrders();
    }

    renderOrders() {
        this.renderOrdersList(this.orders);
    }

    renderOrdersList(orders) {
        const container = document.getElementById('orders-list');
        
        if (orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Заказы не найдены</h3>
                    <p>Добавьте новый заказ или измените фильтры</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => this.createOrderCard(order)).join('');
        
        // Add event listeners for edit/delete buttons
        orders.forEach(order => {
            const editBtn = document.getElementById(`edit-order-${order.id}`);
            const deleteBtn = document.getElementById(`delete-order-${order.id}`);
            
            if (editBtn) editBtn.addEventListener('click', () => this.editOrder(order.id));
            if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteOrder(order.id));
        });
    }

    createOrderCard(order) {
        const statusClass = this.getOrderStatusClass(order);
        
        return `
            <div class="order-card ${statusClass}">
                <div class="order-header">
                    <div class="order-info">
                        <div class="order-id">Заказ #${order.id}</div>
                        <div class="order-date">${this.formatDate(order.date)}</div>
                    </div>
                    <div class="order-actions">
                        <button class="btn btn--sm btn--secondary" id="edit-order-${order.id}">Изменить</button>
                        <button class="btn btn--sm btn--outline" id="delete-order-${order.id}">Удалить</button>
                    </div>
                </div>
                
                <div class="order-details">
                    <div class="order-detail">
                        <div class="order-detail-label">Клиент</div>
                        <div class="order-detail-value">${order.client}</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Товар</div>
                        <div class="order-detail-value">${order.product} ${order.size} ${order.color}</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Количество</div>
                        <div class="order-detail-value">${order.quantity} шт.</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Город</div>
                        <div class="order-detail-value">${order.city}</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Статус оплаты</div>
                        <div class="order-detail-value">
                            <span class="status-indicator status-indicator--${this.getPaymentStatusClass(order.paymentStatus)}">${order.paymentStatus}</span>
                        </div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Статус заказа</div>
                        <div class="order-detail-value">${order.orderStatus}</div>
                    </div>
                </div>
                
                <div class="order-financial">
                    <div class="order-detail">
                        <div class="order-detail-label">Цена ¥</div>
                        <div class="order-detail-value">${order.priceYuan} ¥</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Себестоимость</div>
                        <div class="order-detail-value">${this.formatMoney(order.costKzt)} ₸</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Итого</div>
                        <div class="order-detail-value">${this.formatMoney(order.totalKzt)} ₸</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Предоплата</div>
                        <div class="order-detail-value">${this.formatMoney(order.prepayment)} ₸</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Доплата</div>
                        <div class="order-detail-value">${this.formatMoney(order.remainder)} ₸</div>
                    </div>
                    <div class="order-detail">
                        <div class="order-detail-label">Прибыль</div>
                        <div class="order-detail-value">${this.formatMoney(order.profit)} ₸</div>
                    </div>
                </div>
            </div>
        `;
    }

    getOrderStatusClass(order) {
        const totalPaid = order.prepayment + order.remainder;
        
        if (totalPaid === 0) return 'unpaid';
        if (totalPaid < order.totalKzt) return 'partially-paid';
        if (totalPaid >= order.totalKzt && order.orderStatus === 'Отправлен') return 'paid-shipped';
        return '';
    }

    getPaymentStatusClass(status) {
        switch (status) {
            case 'Не оплачен': return 'unpaid';
            case 'Частично оплачен': return 'partial';
            case 'Оплачен': return 'paid';
            default: return 'unpaid';
        }
    }

    renderInventory() {
        const container = document.getElementById('inventory-list');
        
        if (this.inventory.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <h3>Товары не найдены</h3>
                    <p>Добавьте товары на склад</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.inventory.map(item => this.createInventoryCard(item)).join('');
        
        // Add event listeners
        this.inventory.forEach(item => {
            const editBtn = document.getElementById(`edit-product-${item.key}`);
            const deleteBtn = document.getElementById(`delete-product-${item.key}`);
            
            if (editBtn) editBtn.addEventListener('click', () => this.editProduct(item.key));
            if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteProduct(item.key));
        });
    }

    createInventoryCard(item) {
        return `
            <div class="inventory-card">
                <div class="inventory-header">
                    <div class="inventory-name">${item.name}</div>
                    <div class="order-actions">
                        <button class="btn btn--sm btn--secondary" id="edit-product-${item.key}">Изменить</button>
                        <button class="btn btn--sm btn--outline" id="delete-product-${item.key}">Удалить</button>
                    </div>
                </div>
                
                <div class="inventory-details">
                    <div class="inventory-detail">
                        <div class="inventory-detail-label">Размер</div>
                        <div class="inventory-detail-value">${item.size}</div>
                    </div>
                    <div class="inventory-detail">
                        <div class="inventory-detail-label">Цвет</div>
                        <div class="inventory-detail-value">${item.color}</div>
                    </div>
                    <div class="inventory-detail">
                        <div class="inventory-detail-label">Цена ¥</div>
                        <div class="inventory-detail-value">${item.priceYuan} ¥</div>
                    </div>
                    <div class="inventory-detail">
                        <div class="inventory-detail-label">Остаток</div>
                        <div class="inventory-detail-value ${item.stock <= 5 ? 'stock-low' : ''}">${item.stock} шт.</div>
                    </div>
                </div>
            </div>
        `;
    }

    openOrderModal(orderId = null) {
        this.currentEditingOrder = orderId;
        const modal = document.getElementById('order-modal');
        const form = document.getElementById('order-form');
        const title = document.getElementById('order-modal-title');
        
        title.textContent = orderId ? 'Редактировать заказ' : 'Новый заказ';
        
        // Setup form selects
        this.setupOrderFormSelects();
        
        if (orderId) {
            const order = this.orders.find(o => o.id === orderId);
            this.fillOrderForm(order);
        } else {
            form.reset();
            document.getElementById('order-id').value = this.nextOrderId;
            document.getElementById('order-date').value = new Date().toISOString().split('T')[0];
        }
        
        modal.classList.add('active');
    }

    setupOrderFormSelects() {
        const products = [...new Set(this.inventory.map(item => item.name))];
        const cities = ["Алматы", "Астана", "Шымкент", "Актобе", "Тараз", "Павлодар"];
        const orderStatuses = ["Новый", "В обработке", "Отправлен", "Доставлен", "Отменен"];

        this.populateSelect('product', products);
        this.populateSelect('city', cities);
        this.populateSelect('order-status', orderStatuses);
    }

    fillOrderForm(order) {
        Object.keys(order).forEach(key => {
            const element = document.getElementById(key.replace(/([A-Z])/g, '-$1').toLowerCase());
            if (element) {
                element.value = order[key];
            }
        });
        
        // Update dependent selects
        this.updateSizeOptions();
        this.updateColorOptions();
        this.updateOrderCalculations();
    }

    updateSizeOptions() {
        const product = document.getElementById('product').value;
        const sizes = [...new Set(this.inventory.filter(item => item.name === product).map(item => item.size))];
        this.populateSelect('size', sizes);
    }

    updateColorOptions() {
        const product = document.getElementById('product').value;
        const size = document.getElementById('size').value;
        const colors = [...new Set(this.inventory.filter(item => 
            item.name === product && item.size === size
        ).map(item => item.color))];
        this.populateSelect('color', colors);
    }

    updateOrderCalculations() {
        const product = document.getElementById('product').value;
        const size = document.getElementById('size').value;
        const color = document.getElementById('color').value;
        const quantity = parseInt(document.getElementById('quantity').value) || 0;
        const totalKzt = parseFloat(document.getElementById('total-kzt').value) || 0;
        const prepayment = parseFloat(document.getElementById('prepayment').value) || 0;
        const remainder = parseFloat(document.getElementById('remainder').value) || 0;

        // Find product in inventory
        const inventoryItem = this.inventory.find(item => 
            item.name === product && item.size === size && item.color === color
        );

        if (inventoryItem) {
            const priceYuan = inventoryItem.priceYuan;
            const costKzt = priceYuan * this.exchangeRate * quantity;
            const profit = totalKzt - costKzt;

            document.getElementById('price-yuan').value = priceYuan;
            document.getElementById('cost-kzt').value = costKzt.toFixed(2);
            document.getElementById('profit').value = profit.toFixed(2);

            // Update size and color options
            if (product) this.updateSizeOptions();
            if (product && size) this.updateColorOptions();
        }

        // Update payment status
        const totalPaid = prepayment + remainder;
        let paymentStatus = 'Не оплачен';
        if (totalPaid > 0 && totalPaid < totalKzt) paymentStatus = 'Частично оплачен';
        else if (totalPaid >= totalKzt) paymentStatus = 'Оплачен';

        document.getElementById('payment-status').value = paymentStatus;
    }

    closeOrderModal() {
        document.getElementById('order-modal').classList.remove('active');
        this.currentEditingOrder = null;
    }

    handleOrderSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const orderData = {};
        
        // Extract form data
        ['id', 'date', 'client', 'product', 'size', 'color', 'quantity', 'city', 
         'price-yuan', 'cost-kzt', 'total-kzt', 'prepayment', 'remainder', 
         'profit', 'payment-status', 'order-status'].forEach(field => {
            const element = document.getElementById(field);
            if (element) {
                orderData[this.camelCase(field)] = element.value;
            }
        });

        // Convert numeric fields
        orderData.id = parseInt(orderData.id);
        orderData.quantity = parseInt(orderData.quantity);
        orderData.priceYuan = parseFloat(orderData.priceYuan);
        orderData.costKzt = parseFloat(orderData.costKzt);
        orderData.totalKzt = parseFloat(orderData.totalKzt);
        orderData.prepayment = parseFloat(orderData.prepayment);
        orderData.remainder = parseFloat(orderData.remainder);
        orderData.profit = parseFloat(orderData.profit);

        if (this.currentEditingOrder) {
            // Update existing order
            const index = this.orders.findIndex(o => o.id === this.currentEditingOrder);
            const oldOrder = this.orders[index];
            
            // Restore stock if order status changed from "Отправлен"
            if (oldOrder.orderStatus === 'Отправлен' && orderData.orderStatus !== 'Отправлен') {
                this.restoreStock(oldOrder);
            }
            
            this.orders[index] = orderData;
        } else {
            // Create new order
            this.orders.push(orderData);
            this.nextOrderId++;
        }

        // Update stock if order status is "Отправлен"
        if (orderData.orderStatus === 'Отправлен') {
            this.updateStock(orderData);
        }

        this.saveData();
        this.closeOrderModal();
        this.renderOrders();
        this.updateAnalytics();
    }

    updateStock(order) {
        const inventoryItem = this.inventory.find(item => 
            item.name === order.product && 
            item.size === order.size && 
            item.color === order.color
        );
        
        if (inventoryItem) {
            inventoryItem.stock = Math.max(0, inventoryItem.stock - order.quantity);
            this.renderInventory();
        }
    }

    restoreStock(order) {
        const inventoryItem = this.inventory.find(item => 
            item.name === order.product && 
            item.size === order.size && 
            item.color === order.color
        );
        
        if (inventoryItem) {
            inventoryItem.stock += order.quantity;
            this.renderInventory();
        }
    }

    editOrder(orderId) {
        this.openOrderModal(orderId);
    }

    deleteOrder(orderId) {
        if (confirm('Вы уверены, что хотите удалить этот заказ?')) {
            const order = this.orders.find(o => o.id === orderId);
            
            // Restore stock if order was shipped
            if (order && order.orderStatus === 'Отправлен') {
                this.restoreStock(order);
            }
            
            this.orders = this.orders.filter(o => o.id !== orderId);
            this.saveData();
            this.renderOrders();
            this.updateAnalytics();
        }
    }

    openProductModal(productKey = null) {
        this.currentEditingProduct = productKey;
        const modal = document.getElementById('product-modal');
        const form = document.getElementById('product-form');
        const title = document.getElementById('product-modal-title');
        
        title.textContent = productKey ? 'Редактировать товар' : 'Добавить товар';
        
        if (productKey) {
            const product = this.inventory.find(p => p.key === productKey);
            this.fillProductForm(product);
        } else {
            form.reset();
        }
        
        modal.classList.add('active');
    }

    fillProductForm(product) {
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-size').value = product.size;
        document.getElementById('product-color').value = product.color;
        document.getElementById('product-price-yuan').value = product.priceYuan;
        document.getElementById('product-stock').value = product.stock;
    }

    closeProductModal() {
        document.getElementById('product-modal').classList.remove('active');
        this.currentEditingProduct = null;
    }

    handleProductSubmit(e) {
        e.preventDefault();
        
        const name = document.getElementById('product-name').value;
        const size = document.getElementById('product-size').value;
        const color = document.getElementById('product-color').value;
        const priceYuan = parseFloat(document.getElementById('product-price-yuan').value);
        const stock = parseInt(document.getElementById('product-stock').value);
        
        const key = `${name}_${size}_${color}`;
        const productData = { key, name, size, color, priceYuan, stock };

        if (this.currentEditingProduct) {
            // Update existing product
            const index = this.inventory.findIndex(p => p.key === this.currentEditingProduct);
            this.inventory[index] = productData;
        } else {
            // Check if product already exists
            const existingIndex = this.inventory.findIndex(p => p.key === key);
            if (existingIndex >= 0) {
                alert('Товар с такими характеристиками уже существует!');
                return;
            }
            
            // Add new product
            this.inventory.push(productData);
        }

        this.saveData();
        this.closeProductModal();
        this.renderInventory();
        this.setupFilters();
    }

    editProduct(productKey) {
        this.openProductModal(productKey);
    }

    deleteProduct(productKey) {
        if (confirm('Вы уверены, что хотите удалить этот товар?')) {
            this.inventory = this.inventory.filter(p => p.key !== productKey);
            this.saveData();
            this.renderInventory();
            this.setupFilters();
        }
    }

    saveSettings() {
        const exchangeRate = parseFloat(document.getElementById('exchange-rate').value);
        
        if (exchangeRate > 0) {
            this.exchangeRate = exchangeRate;
            this.saveData();
            alert('Настройки сохранены!');
        } else {
            alert('Введите корректный курс валют!');
        }
    }

    updateAnalytics() {
        const totalSales = this.orders.reduce((sum, order) => sum + order.totalKzt, 0);
        const totalCost = this.orders.reduce((sum, order) => sum + order.costKzt, 0);
        const totalProfit = this.orders.reduce((sum, order) => sum + order.profit, 0);
        const totalOrders = this.orders.length;
        const profitability = totalSales > 0 ? (totalProfit / totalSales * 100) : 0;

        document.getElementById('total-sales').textContent = this.formatMoney(totalSales) + ' ₸';
        document.getElementById('total-cost').textContent = this.formatMoney(totalCost) + ' ₸';
        document.getElementById('total-profit').textContent = this.formatMoney(totalProfit) + ' ₸';
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('profitability').textContent = profitability.toFixed(1) + '%';
    }

    // Utility functions
    camelCase(str) {
        return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU');
    }

    formatMoney(amount) {
        return new Intl.NumberFormat('ru-RU', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 2
        }).format(amount);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new OrderManagementSystem();
});