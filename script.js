// ===== Custom Notification System =====
function showNotification(message, type = 'success') {
    const notification = document.getElementById('customNotification');
    const icon = document.getElementById('notificationIcon');
    const messageEl = document.getElementById('notificationMessage');
    const content = notification.querySelector('.notification-content');
    
    // Set icon based on type
    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };
    
    icon.textContent = icons[type] || icons.success;
    messageEl.textContent = message;
    
    // Remove all type classes
    content.classList.remove('success', 'error', 'warning', 'info');
    // Add current type class
    content.classList.add(type);
    
    // Show notification
    notification.classList.add('show');
    
    // Auto hide after 4 seconds
    setTimeout(() => {
        closeNotification();
    }, 4000);
}

function closeNotification() {
    const notification = document.getElementById('customNotification');
    notification.classList.remove('show');
}

// ===== Custom Confirm Dialog =====
function showConfirm(message, title = 'localhost:3000 says') {
    return new Promise((resolve) => {
        const overlay = document.getElementById('customConfirm');
        const titleEl = document.getElementById('confirmTitle');
        const messageEl = document.getElementById('confirmMessage');
        const okBtn = document.getElementById('confirmOkBtn');
        const cancelBtn = document.getElementById('confirmCancelBtn');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        overlay.classList.add('show');
        
        function handleOk() {
            overlay.classList.remove('show');
            cleanup();
            resolve(true);
        }
        
        function handleCancel() {
            overlay.classList.remove('show');
            cleanup();
            resolve(false);
        }
        
        function cleanup() {
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
        }
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        
        // Close on escape key
        function handleEscape(e) {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        }
        document.addEventListener('keydown', handleEscape);
    });
}

// ===== Custom Prompt Dialog =====
function showPrompt(message, defaultValue = '', title = 'localhost:3000 says') {
    return new Promise((resolve) => {
        const overlay = document.getElementById('customPrompt');
        const titleEl = document.getElementById('promptTitle');
        const messageEl = document.getElementById('promptMessage');
        const input = document.getElementById('promptInput');
        const okBtn = document.getElementById('promptOkBtn');
        const cancelBtn = document.getElementById('promptCancelBtn');
        
        titleEl.textContent = title;
        messageEl.textContent = message;
        input.value = defaultValue;
        overlay.classList.add('show');
        
        // Focus on input
        setTimeout(() => input.focus(), 100);
        
        function handleOk() {
            const value = input.value;
            overlay.classList.remove('show');
            cleanup();
            resolve(value);
        }
        
        function handleCancel() {
            overlay.classList.remove('show');
            cleanup();
            resolve(null);
        }
        
        function cleanup() {
            okBtn.removeEventListener('click', handleOk);
            cancelBtn.removeEventListener('click', handleCancel);
            input.removeEventListener('keypress', handleEnter);
        }
        
        function handleEnter(e) {
            if (e.key === 'Enter') {
                handleOk();
            }
        }
        
        okBtn.addEventListener('click', handleOk);
        cancelBtn.addEventListener('click', handleCancel);
        input.addEventListener('keypress', handleEnter);
        
        // Close on escape key
        function handleEscape(e) {
            if (e.key === 'Escape') {
                handleCancel();
                document.removeEventListener('keydown', handleEscape);
            }
        }
        document.addEventListener('keydown', handleEscape);
    });
}

// ===== Product Data & State Management =====
let products = [];
let filteredProducts = [];
let customerOrderFilter = 'all';

// ===== Initialize App =====
document.addEventListener('DOMContentLoaded', async function() {
    // Load users and orders from server if localStorage is empty
    await loadUsersFromServer();
    await loadOrdersFromServer();
    
    // Load products from server
    await loadProductsFromServer();
    
    // Load categories for filter dropdown
    await loadCategoriesForFilter();
    
    // Update auth button state
    updateAuthButton();
    
    // Check if user needs to be logged in for My Orders page
    if (window.location.pathname.includes('myorder.html')) {
        const loggedInUser = JSON.parse(localStorage.getItem('customerInfo') || 'null');
        if (!loggedInUser) {
            showNotification('Please login to view your orders!', 'warning');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            return;
        }
    }
    
    loadProducts();
    
    // Only display products if we're on a page with product grid
    const productsGrid = document.getElementById('productsGrid');
    if (productsGrid) {
        displayProducts();
        setupEventListeners();
    }
    
    // Always try to display orders (will only work on My Orders page)
    displayOrders('all');
});

// ===== Load Products from LocalStorage =====
async function loadProducts() {
    const storedProducts = localStorage.getItem('ayurvedaProducts');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    } else {
        products = [];
    }
    filteredProducts = [...products];
}

// ===== Save Products to LocalStorage and Server =====
async function saveProducts() {
    localStorage.setItem('ayurvedaProducts', JSON.stringify(products));
    
    // Save to server
    await saveProductsToServer(products);
}

// ===== Save Products to Server =====
async function saveProductsToServer(products) {
    try {
        await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SAVE_PRODUCTS), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products: products })
        });
    } catch (error) {
        console.error('Error saving products to server:', error);
    }
}

// ===== Load Products from Server =====
async function loadProductsFromServer() {
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCTS));
        const result = await response.json();
        
        if (result.success && result.products.length > 0) {
            // Load products from server
            products = result.products;
            localStorage.setItem('ayurvedaProducts', JSON.stringify(products));
        } else {
            // If no products on server, use default products
            const localProducts = JSON.parse(localStorage.getItem('ayurvedaProducts') || '[]');
            if (localProducts.length === 0) {
                // Set default products
                products = [
                    {
                        id: 1,
                        name: 'Rajwadiprash Gold - Ayurvedic Hair Oil',
                        category: 'oils',
                        price: 799,
                        discount: 25,
                        image: '',
                        description: 'Sugar-free Ayurvedic hair oil enriched with gold, silver & saffron. Natural blend of 21 precious herbs for strong, lustrous and healthy hair growth'
                    },
                    {
                        id: 2,
                        name: 'Dantmanjan - Triphala Dental Powder',
                        category: 'powders',
                        price: 450,
                        discount: 15,
                        image: '',
                        description: 'Traditional Ayurvedic dental powder with Triphala for strong teeth and healthy gums. Ancient herbal blend for complete oral care and fresh breath'
                    },
                    {
                        id: 3,
                        name: 'Ashwagandha Tablets - Premium Quality',
                        category: 'tablets',
                        price: 1299,
                        discount: 30,
                        image: '',
                        description: 'Premium quality Ashwagandha tablets for stress relief, vitality and overall wellness. Powerful adaptogen for energy, immunity and mental clarity'
                    },
                    {
                        id: 4,
                        name: 'Triphaladi Guggulu - Ayurvedic Face Cream',
                        category: 'creams',
                        price: 599,
                        discount: 20,
                        image: '',
                        description: 'Natural Ayurvedic face cream with Triphala and saffron. Enriched with turmeric for glowing, radiant and youthful skin. Suitable for all skin types'
                    },
                    {
                        id: 5,
                        name: 'Maha Yograj Guggulu - Herbal Tea',
                        category: 'tea',
                        price: 350,
                        discount: 10,
                        image: '',
                        description: 'Refreshing Ayurvedic herbal tea with holy basil (Tulsi) for immunity boost, digestive health and natural detoxification. Rich in antioxidants'
                    },
                    {
                        id: 6,
                        name: 'Pushpanjali Ras - Neem Face Pack Powder',
                        category: 'powders',
                        price: 299,
                        discount: 15,
                        image: '',
                        description: 'Pure natural neem powder face pack for clear, radiant and acne-free skin. Deep cleanses pores and removes impurities for healthy glowing complexion'
                    },
                    {
                        id: 7,
                        name: 'Vatshekhar Ras - Joint Pain Relief Oil',
                        category: 'oils',
                        price: 899,
                        discount: 35,
                        image: '',
                        description: 'Traditional Ayurvedic oil blend for effective joint pain relief, improved mobility and flexibility. Helps reduce inflammation and stiffness naturally'
                    },
                    {
                        id: 8,
                        name: 'Brahmi Capsules - Memory & Brain Tonic',
                        category: 'tablets',
                        price: 1499,
                        discount: 40,
                        image: '',
                        description: 'Premium Brahmi capsules for enhanced memory, concentration and mental clarity. Ancient Ayurvedic brain tonic for cognitive support and stress relief'
                    }
                ];
                localStorage.setItem('ayurvedaProducts', JSON.stringify(products));
                // Save default products to server
                await saveProductsToServer(products);
            } else {
                products = localProducts;
            }
        }
        filteredProducts = [...products];
    } catch (error) {
        console.error('Error loading products from server:', error);
        // Fallback to localStorage
        await loadProducts();
    }
}

// ===== Display Products =====
function displayProducts() {
    const productsGrid = document.getElementById('productsGrid');
    const noProducts = document.getElementById('noProducts');
    
    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '';
        noProducts.style.display = 'block';
        return;
    }
    
    noProducts.style.display = 'none';
    productsGrid.innerHTML = filteredProducts.map(product => {
        const discountedPrice = Math.round(product.price - (product.price * product.discount / 100));
        
        return `
            <div class="product-card">
                <img src="${product.image || 'images/placeholder.png'}" alt="${product.name}" class="product-image" onerror="this.style.display='none'">
                <div class="product-info">
                    <span class="product-badge">${getCategoryName(product.category)}</span>
                    <h3 class="product-name">${product.name}</h3>
                    ${product.description ? `<p class="product-description">${product.description}</p>` : ''}
                    <div class="product-pricing">
                        <span class="product-price">₹${discountedPrice}</span>
                        <span class="product-original-price">₹${product.price}</span>
                        <span class="product-discount">${product.discount}% OFF</span>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="openOrderModal(${product.id})">Book Order</button>
                        <button class="btn btn-whatsapp" onclick="bookOnWhatsApp(${product.id})">📱 WhatsApp</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Get Category Name =====
function getCategoryName(category) {
    const categories = {
        'oils': 'Herbal Oils',
        'powders': 'Ayurvedic Powders',
        'tablets': 'Herbal Tablets',
        'creams': 'Ayurvedic Creams',
        'tea': 'Herbal Teas'
    };
    return categories[category] || category;
}

// ===== Setup Event Listeners =====
function setupEventListeners() {
    // Search filter
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }
    
    // Category filter
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', applyFilters);
    }
    
    // Price filter
    const priceFilter = document.getElementById('priceFilter');
    if (priceFilter) {
        priceFilter.addEventListener('change', applyFilters);
    }
    
    // Discount filter
    const discountFilter = document.getElementById('discountFilter');
    if (discountFilter) {
        discountFilter.addEventListener('change', applyFilters);
    }
    
    // Order form
    const orderForm = document.getElementById('orderForm');
    if (orderForm) {
        orderForm.addEventListener('submit', handleOrderSubmit);
    }
    
    // Modal close buttons
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modal on outside click
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.style.display = 'none';
        }
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            const nav = document.querySelector('.nav');
            this.classList.toggle('active');
            nav.classList.toggle('mobile-active');
        });
        
        // Close mobile menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                const nav = document.querySelector('.nav');
                const toggle = document.querySelector('.mobile-menu-toggle');
                nav.classList.remove('mobile-active');
                toggle.classList.remove('active');
            });
        });
    }
}

// ===== Apply Filters =====
function applyFilters() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const category = document.getElementById('categoryFilter').value;
    const priceRange = document.getElementById('priceFilter').value;
    const minDiscount = document.getElementById('discountFilter').value;
    
    filteredProducts = products.filter(product => {
        // Search filter
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) ||
                            (product.description && product.description.toLowerCase().includes(searchTerm));
        
        // Category filter
        const matchesCategory = !category || product.category === category;
        
        // Price filter
        let matchesPrice = true;
        if (priceRange) {
            const discountedPrice = product.price - (product.price * product.discount / 100);
            if (priceRange === '0-500') {
                matchesPrice = discountedPrice <= 500;
            } else if (priceRange === '500-1000') {
                matchesPrice = discountedPrice > 500 && discountedPrice <= 1000;
            } else if (priceRange === '1000-2000') {
                matchesPrice = discountedPrice > 1000 && discountedPrice <= 2000;
            } else if (priceRange === '2000+') {
                matchesPrice = discountedPrice > 2000;
            }
        }
        
        // Discount filter
        const matchesDiscount = !minDiscount || product.discount >= parseInt(minDiscount);
        
        return matchesSearch && matchesCategory && matchesPrice && matchesDiscount;
    });
    
    displayProducts();
}

// ===== Open Order Modal =====
function openOrderModal(productId) {
    // Check if user is logged in
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || 'null');
    
    if (!customerInfo) {
        showNotification('Please login or sign up to place an order!', 'info');
        openAuthModal();
        return;
    }
    
    const modal = document.getElementById('orderModal');
    document.getElementById('selectedProductId').value = productId;
    
    // Find the product
    const product = products.find(p => p.id === productId);
    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }
    
    // Calculate pricing
    const originalPrice = product.price;
    const discountAmount = Math.round(originalPrice * product.discount / 100);
    const finalPrice = originalPrice - discountAmount;
    
    // Populate product summary
    document.getElementById('orderProductImage').src = product.image;
    document.getElementById('orderProductName').textContent = product.name;
    document.getElementById('orderProductDesc').textContent = product.description || '';
    document.getElementById('orderOriginalPrice').textContent = '₹' + originalPrice;
    document.getElementById('orderDiscountPercent').textContent = product.discount + '%';
    document.getElementById('orderDiscountAmount').textContent = '- ₹' + discountAmount;
    document.getElementById('orderFinalPrice').textContent = '₹' + finalPrice;
    document.getElementById('orderSavingsAmount').textContent = '₹' + discountAmount;
    
    // Customer is already logged in (checked at function start)
    // Show registered customer info
    document.getElementById('displayName').textContent = customerInfo.name;
    document.getElementById('displayMobile').textContent = customerInfo.mobile;
    document.getElementById('displayAddress').textContent = customerInfo.address;
    document.getElementById('registeredCustomerInfo').style.display = 'block';
    document.getElementById('orderForm').style.display = 'none';
    
    modal.style.display = 'block';
}

// ===== Handle Order Submit =====
function handleOrderSubmit(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('selectedProductId').value);
    const customerName = document.getElementById('customerName').value;
    const customerMobile = document.getElementById('customerMobile').value;
    const customerAddress = document.getElementById('customerAddress').value;
    
    // Get selected payment method
    const paymentMethod = document.querySelector('input[name=\"newPaymentMethod\"]:checked').value;
    
    // Save customer info for future orders
    const customerInfo = {
        name: customerName,
        mobile: customerMobile,
        address: customerAddress
    };
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
    
    // Update user info (don't create duplicate, just update existing)
    updateRegisteredUser(customerName, customerMobile, customerAddress, customerInfo.email || '');
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }
    
    const discountedPrice = Math.round(product.price - (product.price * product.discount / 100));
    
    // Calculate delivery date (7 days from now)
    const orderDate = new Date();
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    
    // Create order object
    const order = {
        id: 'ORD' + Date.now(),
        productId: productId,
        productName: product.name,
        productImage: product.image,
        price: discountedPrice,
        originalPrice: product.price,
        discount: product.discount,
        customerName: customerName,
        customerMobile: customerMobile,
        customerAddress: customerAddress,
        customerEmail: customerInfo.email || '',
        orderDate: orderDate.toISOString(),
        deliveryDate: deliveryDate.toISOString(),
        status: 'in-progress',
        paymentMethod: paymentMethod
    };
    
    // Save to localStorage
    let orders = JSON.parse(localStorage.getItem('ayurvedaOrders') || '[]');
    orders.push(order);
    localStorage.setItem('ayurvedaOrders', JSON.stringify(orders));
    
    // Save to server
    saveOrdersToServer(orders);
    
    // Send confirmation email
    if (customerInfo.email) {
        sendOrderConfirmationEmail(order);
    }
    
    // Close order modal
    document.getElementById('orderModal').style.display = 'none';
    
    // Reset form
    document.getElementById('orderForm').reset();
    
    // Show success modal with order details
    showOrderSuccess(order);
    
    // Refresh orders display
    displayOrders();
}

// ===== Show Order Success =====
function showOrderSuccess(order) {
    const orderDetailsDiv = document.getElementById('orderDetailsSuccess');
    const deliveryDate = new Date(order.deliveryDate);
    const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
    
    orderDetailsDiv.innerHTML = `
        <div class="order-success-details">
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Product:</strong> ${order.productName}</p>
            <p><strong>Amount:</strong> ₹${order.price}</p>
            <p><strong>Expected Delivery:</strong> ${formattedDeliveryDate}</p>
            <p><strong>Status:</strong> <span class="status-badge status-progress">In Progress</span></p>
            <p style="margin-top: 15px; color: #666;">Thank you for your order. We will contact you soon.</p>
        </div>
    `;
    
    document.getElementById('successModal').style.display = 'block';
}

// ===== Close Success Modal =====
function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
    // Scroll to orders section
    document.getElementById('orders').scrollIntoView({ behavior: 'smooth' });
}

// ===== Display Orders =====
function displayOrders(filter = 'all') {
    customerOrderFilter = filter;
    const ordersContainer = document.getElementById('ordersContainer');
    const transactionsContainer = document.getElementById('transactionsContainer');
    
    // If elements don't exist (not on My Orders page), skip
    if (!ordersContainer || !transactionsContainer) {
        return;
    }
    
    let orders = JSON.parse(localStorage.getItem('ayurvedaOrders') || '[]');
    
    // Update counts
    const allCount = orders.length;
    const progressCount = orders.filter(o => o.status === 'in-progress').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;
    const cancelledCount = orders.filter(o => o.status === 'cancelled').length;
    
    const allCountEl = document.getElementById('customerAllCount');
    const progressCountEl = document.getElementById('customerProgressCount');
    const completedCountEl = document.getElementById('customerCompletedCount');
    const cancelledCountEl = document.getElementById('customerCancelledCount');
    
    if (allCountEl) allCountEl.textContent = allCount;
    if (progressCountEl) progressCountEl.textContent = progressCount;
    if (completedCountEl) completedCountEl.textContent = completedCount;
    if (cancelledCountEl) cancelledCountEl.textContent = cancelledCount;
    
    // Handle transactions view
    if (filter === 'transactions') {
        ordersContainer.style.display = 'none';
        transactionsContainer.style.display = 'block';
        displayTransactions(orders);
        return;
    }
    
    ordersContainer.style.display = 'block';
    transactionsContainer.style.display = 'none';
    
    // Filter orders
    let displayOrdersList = [...orders];
    if (filter === 'in-progress') {
        displayOrdersList = displayOrdersList.filter(o => o.status === 'in-progress');
    } else if (filter === 'completed') {
        displayOrdersList = displayOrdersList.filter(o => o.status === 'completed');
    } else if (filter === 'cancelled') {
        displayOrdersList = displayOrdersList.filter(o => o.status === 'cancelled');
    }
    
    if (displayOrdersList.length === 0) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <p>No orders found in this category.</p>
                <a href="index.html#products" class="banner-btn">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    // Sort orders by date (newest first)
    displayOrdersList.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    ordersContainer.innerHTML = displayOrdersList.map(order => {
        const orderDate = new Date(order.orderDate);
        const deliveryDate = new Date(order.deliveryDate);
        const formattedOrderDate = orderDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
        const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const statusClass = order.status === 'completed' ? 'status-completed' : (order.status === 'cancelled' ? 'status-cancelled' : 'status-progress');
        const statusText = order.status === 'completed' ? 'Completed' : (order.status === 'cancelled' ? 'Cancelled' : 'In Progress');
        const statusIcon = order.status === 'completed' ? '✓ Delivered' : (order.status === 'cancelled' ? '✗ Cancelled' : '⏳ Processing');
        const cancelledInfo = order.status === 'cancelled' && order.cancelledAt ? `<p class="cancelled-info"><strong>Cancelled on:</strong> ${new Date(order.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>${order.cancellationReason ? `<p class="cancelled-info"><strong>Reason:</strong> ${order.cancellationReason}</p>` : ''}` : '';
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id-section">
                        <h3>Order #${order.id}</h3>
                        <span class="order-date">Placed on: ${formattedOrderDate}</span>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="order-body">
                    <div class="order-product-info">
                        <img src="${order.productImage || 'images/placeholder.png'}" alt="${order.productName}" class="order-product-image" onerror="this.style.display='none'">
                        <div class="order-product-details">
                            <h4>${order.productName}</h4>
                            <p class="order-price">₹${order.price} <span class="order-original-price">₹${order.originalPrice}</span> <span class="order-discount">(${order.discount}% OFF)</span></p>
                        </div>
                    </div>
                    <div class="order-customer-info">
                        <p><strong>Customer:</strong> ${order.customerName}</p>
                        <p><strong>Mobile:</strong> ${order.customerMobile}</p>
                        <p><strong>Address:</strong> ${order.customerAddress}</p>
                    </div>
                    <div class="order-delivery-info">
                        <p class="delivery-date"><strong>Expected Delivery:</strong> ${formattedDeliveryDate}</p>
                        <span class="delivery-status-text">${statusIcon}</span>
                        ${cancelledInfo}
                    </div>
                    <div class="order-actions-btns">
                        ${order.status === 'in-progress' ? `<button class="btn-cancel-order" onclick="cancelOrder('${order.id}')">
                            ✗ Cancel Order
                        </button>` : ''}
                        <button class="btn-download-receipt" onclick="downloadReceipt('${order.id}')">
                            📄 Download Receipt
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Close Success Modal =====
function closeSuccessModal() {
    document.getElementById('successModal').style.display = 'none';
}

// ===== Book on WhatsApp =====
function bookOnWhatsApp(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }
    
    const discountedPrice = Math.round(product.price - (product.price * product.discount / 100));
    const message = `Hello, I want to book this product: ${product.name}, Price: ₹${discountedPrice}`;
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
}

// ===== Edit Customer Info =====
function editCustomerInfo() {
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || 'null');
    
    if (customerInfo) {
        // Pre-fill form with existing data
        document.getElementById('customerName').value = customerInfo.name;
        document.getElementById('customerMobile').value = customerInfo.mobile;
        document.getElementById('customerAddress').value = customerInfo.address;
    }
    
    // Show form, hide info display
    document.getElementById('registeredCustomerInfo').style.display = 'none';
    document.getElementById('orderForm').style.display = 'block';
}

// ===== Cancel Order =====
async function cancelOrder(orderId) {
    const reason = await showPrompt('Please provide a reason for cancellation (optional):');
    
    if (reason === null) {
        // User clicked Cancel
        return;
    }
    
    const confirmCancel = await showConfirm('Are you sure you want to cancel this order?');
    
    if (!confirmCancel) {
        return;
    }
    
    // Get orders from localStorage
    let orders = JSON.parse(localStorage.getItem('ayurvedaOrders') || '[]');
    
    // Find and update the order
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
        showNotification('Order not found!', 'error');
        return;
    }
    
    // Update order status
    orders[orderIndex].status = 'cancelled';
    orders[orderIndex].cancelledAt = new Date().toISOString();
    if (reason.trim()) {
        orders[orderIndex].cancellationReason = reason.trim();
    }
    
    // Save to localStorage
    localStorage.setItem('ayurvedaOrders', JSON.stringify(orders));
    
    // Save to server
    saveOrdersToServer(orders);
    
    // Refresh display
    displayOrders(customerOrderFilter);
    
    showNotification('Order cancelled successfully!', 'success');
}

// ===== Quick Book Order (for registered customers) =====
function quickBookOrder() {
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || 'null');
    const productId = parseInt(document.getElementById('selectedProductId').value);
    
    if (!customerInfo) {
        showNotification('Customer information not found!', 'error');
        return;
    }
    
    // Get selected payment method
    const paymentMethod = document.querySelector('input[name=\"paymentMethod\"]:checked').value;
    
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }
    
    const discountedPrice = Math.round(product.price - (product.price * product.discount / 100));
    
    // Calculate delivery date (7 days from now)
    const orderDate = new Date();
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + 7);
    
    // Create order object
    const order = {
        id: 'ORD' + Date.now(),
        productId: productId,
        productName: product.name,
        productImage: product.image,
        price: discountedPrice,
        originalPrice: product.price,
        discount: product.discount,
        customerName: customerInfo.name,
        customerMobile: customerInfo.mobile,
        customerEmail: customerInfo.email || '',
        customerAddress: customerInfo.address,
        orderDate: orderDate.toISOString(),
        deliveryDate: deliveryDate.toISOString(),
        status: 'in-progress',
        paymentMethod: paymentMethod
    };
    
    // Save to localStorage
    let orders = JSON.parse(localStorage.getItem('ayurvedaOrders') || '[]');
    orders.push(order);
    localStorage.setItem('ayurvedaOrders', JSON.stringify(orders));
    
    // Save to server
    saveOrdersToServer(orders);
    
    // Send confirmation email
    if (customerInfo.email) {
        sendOrderConfirmationEmail(order);
    }
    
    // Close order modal
    document.getElementById('orderModal').style.display = 'none';
    
    // Show success modal with order details
    showOrderSuccess(order);
    
    // Refresh orders display
    displayOrders();
}

// ===== Filter Customer Orders =====
function filterCustomerOrders(filter) {
    // Update active tab
    document.querySelectorAll('.customer-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayOrders(filter);
}

// ===== Display Transactions =====
function displayTransactions(orders) {
    const transactionsContainer = document.getElementById('transactionsContainer');
    
    if (orders.length === 0) {
        transactionsContainer.innerHTML = `
            <div class="no-orders">
                <p>No transactions found.</p>
                <a href="#products" class="banner-btn">Start Shopping</a>
            </div>
        `;
        return;
    }
    
    // Sort by date (newest first)
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    // Calculate totals
    const totalAmount = orders.reduce((sum, order) => sum + order.price, 0);
    const totalSavings = orders.reduce((sum, order) => sum + (order.originalPrice - order.price), 0);
    
    transactionsContainer.innerHTML = `
        <div class="transaction-summary">
            <div class="summary-card">
                <h3>Total Orders</h3>
                <p class="summary-value">${orders.length}</p>
            </div>
            <div class="summary-card">
                <h3>Total Amount Spent</h3>
                <p class="summary-value">₹${totalAmount}</p>
            </div>
            <div class="summary-card">
                <h3>Total Savings</h3>
                <p class="summary-value savings">₹${totalSavings}</p>
            </div>
        </div>
        
        <div class="transactions-table">
            <table>
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Date</th>
                        <th>Product</th>
                        <th>Amount</th>
                        <th>Savings</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${orders.map(order => {
                        const orderDate = new Date(order.orderDate);
                        const formattedDate = orderDate.toLocaleDateString('en-IN', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric'
                        });
                        const savings = order.originalPrice - order.price;
                        const statusClass = order.status === 'completed' ? 'status-completed' : (order.status === 'cancelled' ? 'status-cancelled' : 'status-progress');
                        const statusText = order.status === 'completed' ? 'Delivered' : (order.status === 'cancelled' ? 'Cancelled' : 'Processing');
                        
                        return `
                            <tr>
                                <td><strong>${order.id}</strong></td>
                                <td>${formattedDate}</td>
                                <td>${order.productName}</td>
                                <td class="amount">₹${order.price}</td>
                                <td class="savings">₹${savings}</td>
                                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                                <td>
                                    <button class="btn-receipt-small" onclick="downloadReceipt('${order.id}')">
                                        📄 Receipt
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

// ===== Download Receipt =====
function downloadReceipt(orderId) {
    const orders = JSON.parse(localStorage.getItem('ayurvedaOrders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        showNotification('Order not found!', 'error');
        return;
    }
    
    const orderDate = new Date(order.orderDate);
    const deliveryDate = new Date(order.deliveryDate);
    
    const receiptHTML = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Receipt - ${order.id}</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
                .receipt { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border: 2px solid #228B22; }
                .header { text-align: center; border-bottom: 3px solid #228B22; padding-bottom: 20px; margin-bottom: 30px; }
                .header h1 { color: #228B22; font-size: 32px; margin-bottom: 10px; }
                .header p { color: #666; font-size: 14px; }
                .receipt-info { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
                .info-section h3 { color: #228B22; margin-bottom: 15px; font-size: 16px; border-bottom: 2px solid #90EE90; padding-bottom: 5px; }
                .info-section p { margin: 8px 0; color: #333; font-size: 14px; }
                .product-details { background: #FFF8DC; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
                .product-details h3 { color: #228B22; margin-bottom: 15px; }
                .product-item { display: flex; justify-content: space-between; margin: 10px 0; padding: 10px; background: white; border-radius: 5px; }
                .pricing { border-top: 2px solid #228B22; padding-top: 20px; }
                .pricing-row { display: flex; justify-content: space-between; margin: 10px 0; font-size: 16px; }
                .pricing-row.total { font-size: 20px; font-weight: bold; color: #228B22; margin-top: 15px; padding-top: 15px; border-top: 2px solid #90EE90; }
                .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 2px solid #228B22; color: #666; font-size: 12px; }
                .status-badge { display: inline-block; padding: 5px 15px; border-radius: 15px; font-size: 12px; font-weight: bold; }
                .status-completed { background: #4CAF50; color: white; }
                .status-progress { background: #FFA500; color: white; }
                .status-cancelled { background: #ff4444; color: white; }
                .cancelled-section { background: #ffebee; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ff4444; }
                .cancelled-section h3 { color: #ff4444; margin-bottom: 10px; }
                @media print { body { padding: 0; background: white; } .receipt { border: none; } }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <h1>🌿 AyurVeda</h1>
                    <p>Natural Healing Products | Order Receipt</p>
                </div>
                
                <div class="receipt-info">
                    <div class="info-section">
                        <h3>Order Information</h3>
                        <p><strong>Order ID:</strong> ${order.id}</p>
                        <p><strong>Order Date:</strong> ${orderDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p><strong>Expected Delivery:</strong> ${deliveryDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                        <p><strong>Status:</strong> <span class="status-badge status-${order.status === 'completed' ? 'completed' : (order.status === 'cancelled' ? 'cancelled' : 'progress')}">${order.status === 'completed' ? 'Delivered' : (order.status === 'cancelled' ? 'Cancelled' : 'In Progress')}</span></p>
                    </div>
                    
                    <div class="info-section">
                        <h3>Customer Details</h3>
                        <p><strong>Name:</strong> ${order.customerName}</p>
                        <p><strong>Mobile:</strong> ${order.customerMobile}</p>
                        <p><strong>Address:</strong> ${order.customerAddress}</p>
                    </div>
                </div>
                
                ${order.status === 'cancelled' ? `
                <div class="cancelled-section">
                    <h3>⚠️ Order Cancelled</h3>
                    <p><strong>Cancelled on:</strong> ${order.cancelledAt ? new Date(order.cancelledAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}</p>
                    ${order.cancellationReason ? `<p><strong>Reason:</strong> ${order.cancellationReason}</p>` : ''}
                </div>
                ` : ''}
                
                <div class="product-details">
                    <h3>Product Details</h3>
                    <div class="product-item">
                        <span><strong>${order.productName}</strong></span>
                        <span>₹${order.originalPrice}</span>
                    </div>
                </div>
                
                <div class="pricing">
                    <div class="pricing-row">
                        <span>Original Price:</span>
                        <span>₹${order.originalPrice}</span>
                    </div>
                    <div class="pricing-row">
                        <span>Discount (${order.discount}%):</span>
                        <span style="color: #ff4444;">- ₹${order.originalPrice - order.price}</span>
                    </div>
                    <div class="pricing-row total">
                        <span>Total Amount:</span>
                        <span>₹${order.price}</span>
                    </div>
                </div>
                
                <div class="footer">
                    <p>Thank you for choosing AyurVeda - Natural Healing for Better Living</p>
                    <p>For any queries, please contact us at support@ayurveda.com</p>
                    <p style="margin-top: 10px;">This is a computer-generated receipt and does not require a signature.</p>
                </div>
            </div>
            <script>
                window.onload = function() {
                    window.print();
                };
            </script>
        </body>
        </html>
    `;
    
    // Create a new window with the receipt
    const printWindow = window.open('', '_blank');
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
}

// ===== Update Registered User (Create or Update) =====
async function updateRegisteredUser(name, mobile, address, email) {
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Check if user already exists (by mobile number)
    const existingUserIndex = users.findIndex(u => u.mobile === mobile);
    
    if (existingUserIndex !== -1) {
        // Update existing user info
        users[existingUserIndex].name = name;
        users[existingUserIndex].address = address;
        users[existingUserIndex].email = email;
        // Keep the same userId and registeredOn date
    } else {
        // Generate unique user ID for new user
        const userId = 'USER' + Date.now();
        
        const newUser = {
            userId: userId,
            name: name,
            mobile: mobile,
            email: email,
            address: address,
            registeredOn: new Date().toISOString()
        };
        
        users.push(newUser);
    }
    
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Save to server text file
    try {
        await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SAVE_USERS), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ users: users })
        });
    } catch (error) {
        console.error('Error saving users to server:', error);
    }
}

// ===== Load Users from Server =====
async function loadUsersFromServer() {
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_USERS));
        const result = await response.json();
        
        if (result.success && result.users.length > 0) {
            // If localStorage is empty, load from server
            const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            if (localUsers.length === 0) {
                localStorage.setItem('registeredUsers', JSON.stringify(result.users));
            }
        }
    } catch (error) {
        console.error('Error loading users from server:', error);
    }
}

// ===== Load Categories for Filter Dropdown =====
async function loadCategoriesForFilter() {
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_CATEGORIES));
        const result = await response.json();
        
        if (result.success && result.categories) {
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                // Keep "All Categories" option and add server categories
                const optionsHTML = '<option value="">All Categories</option>' + 
                    result.categories.map(cat => 
                        `<option value="${cat.toLowerCase().replace(/\s+/g, '-')}">${cat}</option>`
                    ).join('');
                categoryFilter.innerHTML = optionsHTML;
            }
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// ===== Save Orders to Server =====
async function saveOrdersToServer(orders) {
    try {
        await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SAVE_ORDERS), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ orders: orders })
        });
    } catch (error) {
        console.error('Error saving orders to server:', error);
    }
}

// ===== Send Order Confirmation Email =====
async function sendOrderConfirmationEmail(order) {
    try {
        const deliveryDate = new Date(order.deliveryDate).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const emailData = {
            toEmail: order.customerEmail,
            customerName: order.customerName,
            orderId: order.id,
            productName: order.productName,
            price: order.price,
            deliveryDate: deliveryDate
        };
        
        await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SEND_EMAIL), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(emailData)
        });
        
        console.log('Confirmation email sent successfully');
    } catch (error) {
        console.error('Error sending confirmation email:', error);
    }
}

// ===== Load Orders from Server =====
async function loadOrdersFromServer() {
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_ORDERS));
        const result = await response.json();
        
        if (result.success && result.orders.length > 0) {
            // If localStorage is empty, load from server
            const localOrders = JSON.parse(localStorage.getItem('ayurvedaOrders') || '[]');
            if (localOrders.length === 0) {
                localStorage.setItem('ayurvedaOrders', JSON.stringify(result.orders));
            }
        }
    } catch (error) {
        console.error('Error loading orders from server:', error);
    }
}

// ===== Open Profile Modal =====
function openProfileModal() {
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || 'null');
    const profileModal = document.getElementById('profileModal');
    
    if (customerInfo) {
        // Pre-fill form with existing data
        document.getElementById('profileName').value = customerInfo.name;
        document.getElementById('profileMobile').value = customerInfo.mobile;
        document.getElementById('profileEmail').value = customerInfo.email || '';
        document.getElementById('profileAddress').value = customerInfo.address;
    } else {
        // Clear form for new user
        document.getElementById('profileName').value = '';
        document.getElementById('profileMobile').value = '';
        document.getElementById('profileEmail').value = '';
        document.getElementById('profileAddress').value = '';
        document.getElementById('profileMobile').readOnly = false;
        document.getElementById('profileMobile').style.background = '';
        document.getElementById('profileMobile').style.cursor = '';
    }
    
    profileModal.style.display = 'block';
}

// ===== Close Profile Modal =====
function closeProfileModal() {
    document.getElementById('profileModal').style.display = 'none';
}

// ===== Update Profile =====
async function updateProfile(e) {
    e.preventDefault();
    
    const name = document.getElementById('profileName').value.trim();
    const mobile = document.getElementById('profileMobile').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const address = document.getElementById('profileAddress').value.trim();
    
    // Save customer info
    const customerInfo = {
        name: name,
        mobile: mobile,
        email: email,
        address: address
    };
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
    
    // Update registered user
    await updateRegisteredUser(name, mobile, address, email);
    
    // Close modal
    closeProfileModal();
    
    // Show success message
    showNotification('Profile updated successfully!', 'success');
    
    // Reload page to update header profile link
    setTimeout(() => {
        location.reload();
    }, 1000);
}

// ===== Close Modal on Outside Click =====
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// ===== Authentication Functions =====

// Update Auth Button State
function updateAuthButton() {
    const authLink = document.getElementById('authLink');
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || 'null');
    
    if (authLink) {
        if (customerInfo) {
            authLink.innerHTML = '👤 ' + customerInfo.name;
            authLink.onclick = function(e) {
                e.preventDefault();
                showUserMenu();
                return false;
            };
        } else {
            authLink.innerHTML = '🔐 Login';
            authLink.onclick = function(e) {
                e.preventDefault();
                toggleUserAuth();
                return false;
            };
        }
    }
}

// Toggle User Auth (Login/Logout)
function toggleUserAuth() {
    const customerInfo = JSON.parse(localStorage.getItem('customerInfo') || 'null');
    
    if (customerInfo) {
        showUserMenu();
    } else {
        openAuthModal();
    }
}

// Show User Menu
async function showUserMenu() {
    const choice = await showConfirm('Choose an action:\nOK = View Profile\nCancel = Logout');
    
    if (choice) {
        // View Profile
        openProfileModal();
    } else {
        // Logout
        handleLogout();
    }
}

// Handle Logout
async function handleLogout() {
    const confirmLogout = await showConfirm('Are you sure you want to logout?');
    
    if (confirmLogout) {
        localStorage.removeItem('customerInfo');
        updateAuthButton();
        showNotification('You have been logged out successfully!', 'success');
        
        // Redirect to home if on My Orders page
        if (window.location.pathname.includes('myorder.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        }
    }
}

// Open Auth Modal
function openAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        showLoginForm();
        modal.style.display = 'block';
    }
}

// Close Auth Modal
function closeAuthModal() {
    const modal = document.getElementById('authModal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('loginForm').reset();
        document.getElementById('signupForm').reset();
    }
}

// Show Login Form
function showLoginForm() {
    document.getElementById('authModalTitle').textContent = '🔐 Login';
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('signupForm').style.display = 'none';
}

// Show Signup Form
function showSignupForm() {
    document.getElementById('authModalTitle').textContent = '📝 Sign Up';
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('signupForm').style.display = 'block';
}

// Handle Login
async function handleLogin(e) {
    e.preventDefault();
    
    const mobile = document.getElementById('loginMobile').value.trim();
    
    // Get all registered users
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // If empty, try loading from server
    if (users.length === 0) {
        await loadUsersFromServer();
        users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    }
    
    // Find user by mobile number
    const user = users.find(u => u.mobile === mobile);
    
    if (!user) {
        const signup = await showConfirm('Mobile number not found!\n\nWould you like to sign up?');
        if (signup) {
            showSignupForm();
            document.getElementById('signupMobile').value = mobile;
        }
        return;
    }
    
    // Login successful
    const customerInfo = {
        name: user.name,
        mobile: user.mobile,
        email: user.email || '',
        address: user.address
    };
    
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
    
    closeAuthModal();
    updateAuthButton();
    
    showNotification('Welcome back, ' + user.name + '!', 'success');
}

// Handle Signup
function handleSignup(e) {
    e.preventDefault();
    
    const name = document.getElementById('signupName').value.trim();
    const mobile = document.getElementById('signupMobile').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const address = document.getElementById('signupAddress').value.trim();
    
    // Check if mobile already exists
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const existingUser = users.find(u => u.mobile === mobile);
    
    if (existingUser) {
        showNotification('This mobile number is already registered. Please login instead.', 'warning');
        showLoginForm();
        document.getElementById('loginMobile').value = mobile;
        return;
    }
    
    // Save customer info for login
    const customerInfo = {
        name: name,
        mobile: mobile,
        email: email,
        address: address
    };
    
    localStorage.setItem('customerInfo', JSON.stringify(customerInfo));
    
    // Register user
    updateRegisteredUser(name, mobile, address, email);
    
    closeAuthModal();
    updateAuthButton();
    
    showNotification('Account created successfully! Welcome, ' + name + '!', 'success');
}


