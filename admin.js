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

// ===== Check Admin Authentication =====
document.addEventListener('DOMContentLoaded', async function() {
    const isLoggedIn = localStorage.getItem('adminLoggedIn');
    
    if (!isLoggedIn || isLoggedIn !== 'true') {
        window.location.href = 'admin-login.html';
        return;
    }
    
    // Load users and orders from server if localStorage is empty
    await loadUsersFromServer();
    await loadOrdersFromServer();
    
    loadAdminProducts();
    loadCategories();
    displayRegisteredUsers();
    setupAdminEventListeners();
});

// ===== Load Users from Server =====
async function loadUsersFromServer() {
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_USERS));
        const result = await response.json();
        
        if (result.success && result.users.length > 0) {
            const localUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
            if (localUsers.length === 0) {
                localStorage.setItem('registeredUsers', JSON.stringify(result.users));
            }
        }
    } catch (error) {
        console.error('Error loading users from server:', error);
    }
}

// ===== Load Orders from Server =====
async function loadOrdersFromServer() {
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_ORDERS));
        const result = await response.json();
        
        if (result.success && result.orders.length > 0) {
            const localOrders = JSON.parse(localStorage.getItem('ayurvedaOrders') || '[]');
            if (localOrders.length === 0) {
                localStorage.setItem('ayurvedaOrders', JSON.stringify(result.orders));
            }
        }
    } catch (error) {
        console.error('Error loading orders from server:', error);
    }
}


// ===== Image Upload Handler =====
async function handleImageUpload(input) {
    const file = input.files[0];
    if (file) {
        // Show file name
        document.getElementById('imageFileName').textContent = file.name;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('previewImg').src = e.target.result;
            const imagePreview = document.getElementById('imagePreview');
            imagePreview.style.display = 'block';
            
            // Scroll to the preview
            setTimeout(() => {
                imagePreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        };
        reader.readAsDataURL(file);
        
        // Upload to server
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_IMAGE), {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store the image path
                document.getElementById('productImagePath').value = result.imagePath;
                
                // Clear URL input
                document.getElementById('productImage').value = '';
                
                // Scroll to bottom of form
                setTimeout(() => {
                    const imagePreview = document.getElementById('imagePreview');
                    if (imagePreview) {
                        imagePreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 200);
            } else {
                showNotification('Upload failed: ' + result.error, 'error');
            }
        } catch (error) {
            showNotification('Upload error: ' + error.message + '. Make sure the server is running with: npm start', 'error');
        }
    }
}

// ===== Edit Image Upload Handler =====
async function handleEditImageUpload(input) {
    const file = input.files[0];
    if (file) {
        // Show file name
        document.getElementById('editImageFileName').textContent = file.name;
        
        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('editPreviewImg').src = e.target.result;
            const editImagePreview = document.getElementById('editImagePreview');
            editImagePreview.style.display = 'block';
            
            // Scroll to the preview in modal
            setTimeout(() => {
                editImagePreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        };
        reader.readAsDataURL(file);
        
        // Upload to server
        const formData = new FormData();
        formData.append('image', file);
        
        try {
            const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.UPLOAD_IMAGE), {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Store the image path
                document.getElementById('editProductImagePath').value = result.imagePath;
                
                // Clear URL input
                document.getElementById('editProductImage').value = '';
                
                // Scroll to bottom of modal form
                setTimeout(() => {
                    const editImagePreview = document.getElementById('editImagePreview');
                    if (editImagePreview) {
                        editImagePreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 200);
            } else {
                showNotification('Upload failed: ' + result.error, 'error');
            }
        } catch (error) {
            showNotification('Upload error: ' + error.message + '. Make sure the server is running with: npm start', 'error');
        }
    }
}

// ===== Logout Function =====
function logout() {
    localStorage.removeItem('adminLoggedIn');
    window.location.href = 'admin-login.html';
}

// ===== Load Products =====
let products = [];

async function loadAdminProducts() {
    // Try loading from server first
    await loadProductsFromServer();
    
    const storedProducts = localStorage.getItem('ayurvedaProducts');
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    } else {
        products = [];
    }
    displayAdminProducts();
    displayAdminOrders('all');
}

// ===== Load Products from Server =====
async function loadProductsFromServer() {
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_PRODUCTS));
        const result = await response.json();
        
        if (result.success && result.products.length > 0) {
            localStorage.setItem('ayurvedaProducts', JSON.stringify(result.products));
        }
    } catch (error) {
        console.error('Error loading products from server:', error);
    }
}

// ===== Save Products =====
async function saveProducts() {
    localStorage.setItem('ayurvedaProducts', JSON.stringify(products));
    
    // Save to server
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

// ===== Display Admin Products =====
function displayAdminProducts() {
    const productsList = document.getElementById('adminProductsList');
    const totalProducts = document.getElementById('totalProducts');
    
    totalProducts.textContent = products.length;
    
    if (products.length === 0) {
        productsList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No products added yet. Start by adding your first product!</p>';
        return;
    }
    
    productsList.innerHTML = products.map(product => {
        const discountedPrice = Math.round(product.price - (product.price * product.discount / 100));
        
        return `
            <div class="admin-product-item">
                <img src="${product.image}" alt="${product.name}" class="admin-product-image" onerror="this.src='https://via.placeholder.com/80x80/228B22/FFFFFF?text=Product'">
                <div class="admin-product-details">
                    <h3>${product.name}</h3>
                    <p><strong>Category:</strong> ${getCategoryName(product.category)}</p>
                    <p><strong>Price:</strong> ₹${discountedPrice} <span style="text-decoration: line-through; color: #999;">₹${product.price}</span> <span style="color: #ff4444;">(${product.discount}% OFF)</span></p>
                    ${product.description ? `<p><strong>Description:</strong> ${product.description}</p>` : ''}
                </div>
                <div class="admin-product-actions">
                    <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
                    <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
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
function setupAdminEventListeners() {
    // Add product form
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }
    
    // Edit product form
    const editProductForm = document.getElementById('editProductForm');
    if (editProductForm) {
        editProductForm.addEventListener('submit', handleEditProduct);
    }
}

// ===== Add Product =====
function handleAddProduct(e) {
    e.preventDefault();
    
    const name = document.getElementById('productName').value.trim();
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const discount = parseFloat(document.getElementById('productDiscount').value);
    const imagePath = document.getElementById('productImagePath').value;
    const imageUrl = document.getElementById('productImage').value.trim();
    const description = document.getElementById('productDescription').value.trim();
    
    // Get image source (uploaded file path or URL)
    const image = imagePath || imageUrl;
    
    // Validation
    if (!name || !category || !price || isNaN(price) || !discount || isNaN(discount) || !image) {
        showNotification('Please fill in all required fields including an image!', 'warning');
        return;
    }
    
    if (price < 0) {
        showNotification('Price cannot be negative!', 'error');
        return;
    }
    
    if (discount < 0 || discount > 100) {
        showNotification('Discount must be between 0 and 100!', 'error');
        return;
    }
    
    // Create new product
    const newProduct = {
        id: Date.now(),
        name: name,
        category: category,
        price: price,
        discount: discount,
        image: image,
        description: description
    };
    
    products.push(newProduct);
    saveProducts();
    displayAdminProducts();
    
    // Reset form
    e.target.reset();
    document.getElementById('imageFileName').textContent = 'No file chosen';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('productImagePath').value = '';
    
    // Show success message
    showNotification('Product added successfully!', 'success');
}

// ===== Edit Product =====
function editProduct(productId) {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        showNotification('Product not found!', 'error');
        return;
    }
    
    // Populate edit form
    document.getElementById('editProductId').value = product.id;
    document.getElementById('editProductName').value = product.name;
    document.getElementById('editProductCategory').value = product.category;
    document.getElementById('editProductPrice').value = product.price;
    document.getElementById('editProductDiscount').value = product.discount;
    document.getElementById('editProductImage').value = product.image;
    document.getElementById('editProductDescription').value = product.description || '';
    
    // Show edit modal
    document.getElementById('editModal').style.display = 'block';
}

// ===== Handle Edit Product Submit =====
function handleEditProduct(e) {
    e.preventDefault();
    
    const productId = parseInt(document.getElementById('editProductId').value);
    const name = document.getElementById('editProductName').value.trim();
    const category = document.getElementById('editProductCategory').value;
    const price = parseFloat(document.getElementById('editProductPrice').value);
    const discount = parseFloat(document.getElementById('editProductDiscount').value);
    const imagePath = document.getElementById('editProductImagePath').value;
    const imageUrl = document.getElementById('editProductImage').value.trim();
    const description = document.getElementById('editProductDescription').value.trim();
    
    // Get image source (uploaded file path or URL)
    const image = imagePath || imageUrl;
    
    // Validation
    if (!name || !category || !price || isNaN(price) || !discount || isNaN(discount) || !image) {
        showNotification('Please fill in all required fields including an image!', 'warning');
        return;
    }
    
    if (price < 0) {
        showNotification('Price cannot be negative!', 'error');
        return;
    }
    
    if (discount < 0 || discount > 100) {
        showNotification('Discount must be between 0 and 100!', 'error');
        return;
    }
    
    // Find and update product
    const productIndex = products.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
        showNotification('Product not found!', 'error');
        return;
    }
    
    products[productIndex] = {
        id: productId,
        name: name,
        category: category,
        price: price,
        discount: discount,
        image: image,
        description: description
    };
    
    saveProducts();
    displayAdminProducts();
    
    // Close modal
    closeEditModal();
    
    // Show success message
    showNotification('Product updated successfully!', 'success');
}

// ===== Delete Product =====
async function deleteProduct(productId) {
    if (!await showConfirm('Are you sure you want to delete this product?')) {
        return;
    }
    
    products = products.filter(p => p.id !== productId);
    saveProducts();
    displayAdminProducts();
    
    showNotification('Product deleted successfully!', 'success');
}

// ===== Close Edit Modal =====
function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    document.getElementById('editProductForm').reset();
    document.getElementById('editImageFileName').textContent = 'No file chosen';
    document.getElementById('editImagePreview').style.display = 'none';
    document.getElementById('editProductImagePath').value = '';
}

// ===== Close Modal on Outside Click =====
window.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal')) {
        e.target.style.display = 'none';
    }
});

// ===== Display Admin Orders =====
let currentOrderFilter = 'all';

function displayAdminOrders(filter = 'all') {
    currentOrderFilter = filter;
    const ordersListDiv = document.getElementById('adminOrdersList');
    let orders = JSON.parse(localStorage.getItem('ayurvedaOrders') || '[]');
    
    // Update counts
    const allCount = orders.length;
    const progressCount = orders.filter(o => o.status === 'in-progress').length;
    const completedCount = orders.filter(o => o.status === 'completed').length;
    
    document.getElementById('allOrdersCount').textContent = allCount;
    document.getElementById('progressOrdersCount').textContent = progressCount;
    document.getElementById('completedOrdersCount').textContent = completedCount;
    
    // Filter orders
    if (filter === 'in-progress') {
        orders = orders.filter(o => o.status === 'in-progress');
    } else if (filter === 'completed') {
        orders = orders.filter(o => o.status === 'completed');
    }
    
    if (orders.length === 0) {
        ordersListDiv.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No orders found.</p>';
        return;
    }
    
    // Sort by newest first
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
    
    ordersListDiv.innerHTML = orders.map(order => {
        const orderDate = new Date(order.orderDate);
        const deliveryDate = new Date(order.deliveryDate);
        const formattedOrderDate = orderDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        
        const statusClass = order.status === 'completed' ? 'status-completed' : 'status-progress';
        const statusText = order.status === 'completed' ? 'Completed' : 'In Progress';
        
        return `
            <div class="admin-order-card">
                <div class="admin-order-header">
                    <div>
                        <h3>Order #${order.id}</h3>
                        <span class="admin-order-date">${formattedOrderDate}</span>
                    </div>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </div>
                <div class="admin-order-body">
                    <div class="admin-order-row">
                        <div class="admin-order-product">
                            <img src="${order.productImage}" alt="${order.productName}" onerror="this.src='https://via.placeholder.com/60x60/228B22/FFFFFF?text=Product'">
                            <div>
                                <strong>${order.productName}</strong>
                                <p>₹${order.price} <span style="text-decoration: line-through; color: #999;">₹${order.originalPrice}</span> <span style="color: #ff4444;">(${order.discount}% OFF)</span></p>
                            </div>
                        </div>
                        <div class="admin-order-customer">
                            <p><strong>Customer:</strong> ${order.customerName}</p>
                            <p><strong>Mobile:</strong> ${order.customerMobile}</p>
                            <p><strong>Address:</strong> ${order.customerAddress}</p>
                        </div>
                    </div>
                    <div class="admin-order-footer">
                        <p><strong>Expected Delivery:</strong> ${formattedDeliveryDate}</p>
                        ${order.status === 'in-progress' 
                            ? `<button class="btn-complete" onclick="markOrderAsCompleted('${order.id}')">✓ Mark as Completed</button>`
                            : '<span class="completed-badge">✓ Order Delivered</span>'
                        }
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// ===== Filter Orders =====
function filterOrders(filter) {
    // Update active tab
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    displayAdminOrders(filter);
}

// ===== Mark Order as Completed =====
async function markOrderAsCompleted(orderId) {
    if (!await showConfirm('Mark this order as completed and delivered?')) {
        return;
    }
    
    let orders = JSON.parse(localStorage.getItem('ayurvedaOrders') || '[]');
    const orderIndex = orders.findIndex(o => o.id === orderId);
    
    if (orderIndex !== -1) {
        orders[orderIndex].status = 'completed';
        localStorage.setItem('ayurvedaOrders', JSON.stringify(orders));
        
        // Save to server
        try {
            await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SAVE_ORDERS), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orders: orders })
            });
        } catch (error) {
            console.error('Error saving orders to server:', error);
        }
        
        displayAdminOrders(currentOrderFilter);
        showNotification('Order marked as completed!', 'success');
    }
}

// ===== Display Registered Users =====
function displayRegisteredUsers() {
    const usersTableBody = document.getElementById('usersTableBody');
    const totalUsersSpan = document.getElementById('totalUsers');
    
    if (!usersTableBody || !totalUsersSpan) {
        return;
    }
    
    // Get all registered users
    let users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    // Get all orders to count orders per user
    const orders = JSON.parse(localStorage.getItem('ayurvedaOrders') || '[]');
    
    totalUsersSpan.textContent = users.length;
    
    if (users.length === 0) {
        usersTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px; color: #999;">
                    No registered users yet.
                </td>
            </tr>
        `;
        return;
    }
    
    // Sort by registration date (newest first)
    users.sort((a, b) => new Date(b.registeredOn) - new Date(a.registeredOn));
    
    usersTableBody.innerHTML = users.map(user => {
        // Count orders for this user
        const userOrders = orders.filter(order => 
            order.customerMobile === user.mobile
        ).length;
        
        const registeredDate = new Date(user.registeredOn);
        const formattedDate = registeredDate.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        return `
            <tr>
                <td><strong>${user.userId}</strong></td>
                <td>${user.name}</td>
                <td>${user.mobile}</td>
                <td>${user.address}</td>
                <td>${formattedDate}</td>
                <td><span style="color: #228B22; font-weight: bold;">${userOrders}</span></td>
            </tr>
        `;
    }).join('');
}

// ===== Category Management Functions =====

// Load categories from server
async function loadCategories() {
    try {
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_CATEGORIES));
        const result = await response.json();
        
        if (result.success && result.categories) {
            displayCategories(result.categories);
            updateCategoryDropdowns(result.categories);
        }
    } catch (error) {
        console.error('Error loading categories:', error);
    }
}

// Display categories in admin panel
function displayCategories(categories) {
    const categoriesList = document.getElementById('categoriesList');
    if (!categoriesList) return;
    
    if (categories.length === 0) {
        categoriesList.innerHTML = '<p style="text-align: center; color: #666;">No categories found</p>';
        return;
    }
    
    categoriesList.innerHTML = categories.map((category, index) => `
        <div class="category-item">
            <span class="category-name">${category}</span>
            <div class="category-actions">
                <button onclick="editCategory(${index}, '${category.replace(/'/g, "\\'")}')" class="edit-btn-small">Edit</button>
                <button onclick="deleteCategory(${index}, '${category.replace(/'/g, "\\'")}')" class="delete-btn-small">Delete</button>
            </div>
        </div>
    `).join('');
}

// Update category dropdowns in product forms
function updateCategoryDropdowns(categories) {
    const addCategorySelect = document.getElementById('productCategory');
    const editCategorySelect = document.getElementById('editProductCategory');
    
    const optionsHTML = '<option value="">Select Category</option>' + 
        categories.map(cat => `<option value="${cat.toLowerCase().replace(/\s+/g, '-')}">${cat}</option>`).join('');
    
    if (addCategorySelect) addCategorySelect.innerHTML = optionsHTML;
    if (editCategorySelect) editCategorySelect.innerHTML = optionsHTML;
}

// Add new category
async function addCategory() {
    const input = document.getElementById('newCategoryInput');
    const categoryName = input.value.trim();
    
    if (!categoryName) {
        showNotification('Please enter a category name', 'warning');
        return;
    }
    
    try {
        // Get current categories
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_CATEGORIES));
        const result = await response.json();
        
        if (!result.success) {
            showNotification('Error loading categories', 'error');
            return;
        }
        
        const categories = result.categories;
        
        // Check if category already exists
        if (categories.some(cat => cat.toLowerCase() === categoryName.toLowerCase())) {
            showNotification('Category already exists!', 'warning');
            return;
        }
        
        // Add new category
        categories.push(categoryName);
        
        // Save to server
        const saveResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SAVE_CATEGORIES), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categories: categories })
        });
        
        const saveResult = await saveResponse.json();
        
        if (saveResult.success) {
            showNotification('Category added successfully!', 'success');
            input.value = '';
            loadCategories();
        } else {
            showNotification('Error saving category', 'error');
        }
    } catch (error) {
        console.error('Error adding category:', error);
        showNotification('Error adding category', 'error');
    }
}

// Edit category
async function editCategory(index, oldName) {
    const newName = await showPrompt('Enter new category name:', oldName);
    
    if (!newName || newName.trim() === '') {
        return;
    }
    
    if (newName.trim() === oldName) {
        return;
    }
    
    try {
        // Get current categories
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_CATEGORIES));
        const result = await response.json();
        
        if (!result.success) {
            showNotification('Error loading categories', 'error');
            return;
        }
        
        const categories = result.categories;
        
        // Check if new name already exists
        if (categories.some((cat, i) => i !== index && cat.toLowerCase() === newName.trim().toLowerCase())) {
            showNotification('Category name already exists!', 'warning');
            return;
        }
        
        // Update category
        categories[index] = newName.trim();
        
        // Save to server
        const saveResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SAVE_CATEGORIES), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categories: categories })
        });
        
        const saveResult = await saveResponse.json();
        
        if (saveResult.success) {
            showNotification('Category updated successfully!', 'success');
            loadCategories();
        } else {
            showNotification('Error updating category', 'error');
        }
    } catch (error) {
        console.error('Error editing category:', error);
        showNotification('Error editing category', 'error');
    }
}

// Delete category
async function deleteCategory(index, categoryName) {
    if (!await showConfirm(`Are you sure you want to delete "${categoryName}" category?`)) {
        return;
    }
    
    try {
        // Get current categories
        const response = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.GET_CATEGORIES));
        const result = await response.json();
        
        if (!result.success) {
            showNotification('Error loading categories', 'error');
            return;
        }
        
        const categories = result.categories;
        
        // Remove category
        categories.splice(index, 1);
        
        // Save to server
        const saveResponse = await fetch(getApiUrl(API_CONFIG.ENDPOINTS.SAVE_CATEGORIES), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ categories: categories })
        });
        
        const saveResult = await saveResponse.json();
        
        if (saveResult.success) {
            showNotification('Category deleted successfully!', 'success');
            loadCategories();
        } else {
            showNotification('Error deleting category', 'error');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        showNotification('Error deleting category', 'error');
    }
}


