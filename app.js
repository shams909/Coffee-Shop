
let currentBannerIndex = 0;
let cart = [];
let userBalance = 1000;
let appliedCoupon = null;
let isDarkMode = false;
let reviews = [];


const products = [
    { id: 1, name: "Ethiopian Yirgacheffe", price: 918.99, rating: 4.8, category: "Coffee", image: "/public/ethiopian-coffee-beans.jpg", description: "Floral and fruity notes with hints of lemon and wine" },
    { id: 2, name: "Colombian Supreme", price: 916.99, rating: 4.7, category: "Coffee", image: "/public/colombian-coffee.jpg", description: "Rich and balanced flavor with chocolate undertones" },
    { id: 3, name: "Green Tea Matcha", price: 924.99, rating: 4.9, category: "Tea", image: "/public/matcha-green-tea.jpg", description: "Pure organic matcha powder from Japan" },
    { id: 4, name: "Oolong Dragon", price: 920.99, rating: 4.6, category: "Tea", image: "/public/oolong-tea-leaves.jpg", description: "Premium aged oolong with complex flavor profile" },
    { id: 5, name: "Brazilian Santos", price: 915.99, rating: 4.5, category: "Coffee", image: "/public/brazilian-coffee.jpg", description: "Nutty and smooth with caramel notes" },
    { id: 6, name: "Chamomile Blend", price: 912.99, rating: 4.4, category: "Tea", image: "/public/chamomile-tea-flowers.jpg", description: "Calming herbal tea with honey-like sweetness" },
    { id: 7, name: "French Roast", price: 917.99, rating: 4.6, category: "Coffee", image: "/public/french-roast-coffee.jpg", description: "Bold and intense dark roast with smoky finish" },
    { id: 8, name: "Earl Grey Premium", price: 14.99, rating: 4.5, category: "Tea", image: "/public/assam-black-tea.jpg", description: "Classic bergamot blend with citrus aroma" }
];


const coupons = {
    'SAVE10': { discount: 10, type: 'percentage' },
    'BREW50': { discount: 50, type: 'fixed' },
    'NEWUSER': { discount: 15, type: 'percentage' }
};


async function init() {
    loadFromLocalStorage();
    loadTheme();
    await loadReviews();
    renderProducts();
    renderReviews();
    updateCart();
    setupEventListeners();
    updateBalance();
}


function nextBanner() {
    const slides = document.querySelectorAll('.banner-slide');
    slides[currentBannerIndex].classList.remove('opacity-100');
    slides[currentBannerIndex].classList.add('opacity-0');
    currentBannerIndex = (currentBannerIndex + 1) % slides.length;
    slides[currentBannerIndex].classList.remove('opacity-0');
    slides[currentBannerIndex].classList.add('opacity-100');
}

function prevBanner() {
    const slides = document.querySelectorAll('.banner-slide');
    slides[currentBannerIndex].classList.remove('opacity-100');
    slides[currentBannerIndex].classList.add('opacity-0');
    currentBannerIndex = currentBannerIndex === 0 ? slides.length - 1 : currentBannerIndex - 1;
    slides[currentBannerIndex].classList.remove('opacity-0');
    slides[currentBannerIndex].classList.add('opacity-100');
}


function renderProducts(filter = 'all') {
    const grid = document.getElementById('productsGrid');
    const filteredProducts = filter === 'all' ? products : products.filter(p => p.category === filter);
    
    grid.innerHTML = filteredProducts.map(product => `
        <div class="glass-card rounded-2xl overflow-hidden hover:bg-glass-white hover:scale-105 transition-all duration-300 flex flex-col group hover:shadow-2xl">
            <div class="relative w-full h-64 overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex'">
                <div class="w-full h-full glass flex items-center justify-center text-white text-6xl font-bold" style="display: none;">
                    ${product.category === 'Coffee' ? '☕' : '🍃'}
                </div>
                <div class="absolute top-4 right-4 glass px-3 py-1 rounded-full">
                    <span class="text-white text-sm font-semibold">${product.category}</span>
                </div>
            </div>
            <div class="p-6 flex-grow flex flex-col">
                <h3 class="text-xl font-bold text-white mb-3 group-hover:text-accent-light transition-colors duration-300">${product.name}</h3>
                <p class="text-text-secondary text-sm mb-4 leading-relaxed">${product.description}</p>
                <div class="flex items-center justify-between mb-4">
                    <div class="text-yellow-400 text-lg">${'⭐'.repeat(Math.floor(product.rating))}</div>
                    <span class="text-text-secondary text-sm">${product.rating}/5</span>
                </div>
                <div class="text-2xl font-bold text-white mb-6 mt-auto">
                    <span class="bg-gradient-to-r from-accent-light to-accent bg-clip-text text-transparent">${product.price}</span>
                    <span class="text-lg text-text-secondary"> BDT</span>
                </div>
                <button data-product-id="${product.id}" class="add-to-cart-btn w-full glass-button text-white py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg">
                    <span class="mr-2">🛒</span> Add to Cart
                </button>
            </div>
        </div>
    `).join('');
    
    
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const productId = parseInt(this.getAttribute('data-product-id'));
            addToCart(productId);
        });
    });
}

function filterProducts(category, activeBtn) {
    renderProducts(category);
    
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.className = 'filter-btn glass text-white border border-glass-border px-8 py-3 rounded-2xl font-semibold hover:bg-glass-white transition-all duration-300 hover:scale-105';
    });
    
    if (activeBtn) {
        activeBtn.className = 'filter-btn glass-button text-white px-8 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-105';
    }
}


function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    updateCart();
    showNotification(`${product.name} added to cart!`);
    saveToLocalStorage();
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCart();
    saveToLocalStorage();
}

function updateQuantity(productId, newQuantity) {
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = newQuantity;
        updateCart();
        saveToLocalStorage();
    }
}

function updateCart() {
    const cartItems = document.getElementById('cartItems');
    const cartCount = document.getElementById('cartCount');
    const totalElement = document.getElementById('total');
    
    cartCount.textContent = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="glass p-8 rounded-2xl text-center">
                <div class="mb-4">
                    <svg class="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 5.2m0 0h12.6M7 13l-4-10"></path>
                    </svg>
                </div>
                <p class="text-white text-lg font-medium">Your cart is empty</p>
                <p class="text-gray-300 mt-2">Add some products to get started</p>
            </div>
        `;
        totalElement.textContent = '0';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="glass p-4 rounded-xl border border-glass-border hover:bg-glass-white transition-all duration-300 mb-4">
            <div class="flex items-center gap-4">
                <div class="w-16 h-16 glass-strong rounded-xl flex items-center justify-center text-white font-bold text-xl flex-shrink-0 bg-gradient-to-br from-blue-500/20 to-purple-600/20">
                    ${item.name.charAt(0)}
                </div>
                <div class="flex-grow">
                    <h4 class="text-white font-semibold text-lg">${item.name}</h4>
                    <p class="text-blue-300 font-bold text-lg">${item.price} BDT</p>
                    <div class="flex items-center gap-3 mt-3">
                        <button onclick="updateQuantity(${item.id}, ${item.quantity - 1})" 
                                class="glass-button w-8 h-8 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-300">-</button>
                        <span class="text-white font-medium min-w-[2rem] text-center">${item.quantity}</span>
                        <button onclick="updateQuantity(${item.id}, ${item.quantity + 1})" 
                                class="glass-button w-8 h-8 rounded-lg flex items-center justify-center text-white hover:scale-110 transition-all duration-300">+</button>
                        <button onclick="removeFromCart(${item.id})" 
                                class="ml-auto text-red-400 hover:text-red-300 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all duration-300 font-medium">Remove</button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
    
    calculateTotal();
}

function calculateTotal() {
    let subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let total = subtotal;
    
    if (appliedCoupon) {
        const coupon = coupons[appliedCoupon];
        if (coupon.type === 'percentage') {
            total = subtotal * (1 - coupon.discount / 100);
        } else {
            total = Math.max(0, subtotal - coupon.discount);
        }
    }
    
    document.getElementById('total').textContent = total.toFixed(2);
}

function applyCoupon() {
    const code = document.getElementById('couponCode').value.toUpperCase();
    
    if (!code) {
        showNotification('Please enter a coupon code');
        return;
    }
    
    if (coupons[code]) {
        if (appliedCoupon === code) {
            showNotification('Coupon already applied');
            return;
        }
        
        appliedCoupon = code;
        calculateTotal();
        showNotification(`Coupon ${code} applied successfully!`);
        document.getElementById('couponCode').value = '';
        saveToLocalStorage();
    } else {
        showNotification('Invalid coupon code');
    }
}

function checkout() {
    const total = parseFloat(document.getElementById('total').textContent);
    
    if (cart.length === 0) {
        showNotification('Your cart is empty');
        return;
    }
    
    if (total > userBalance) {
        showNotification('Insufficient balance. Please add money to your account.');
        return;
    }
    
    userBalance -= total;
    updateBalance();
    cart = [];
    appliedCoupon = null;
    updateCart();
    toggleCart();
    showNotification('Order placed successfully! Thank you for shopping with us.');
    saveToLocalStorage();
}


function toggleCart() {
    const sidebar = document.getElementById('cartSidebar');
    sidebar.classList.toggle('translate-x-full');
}

function toggleMenu() {
    const menu = document.getElementById('mobileMenu');
    menu.classList.toggle('hidden');
}

function updateBalance() {
    document.getElementById('userBalance').textContent = userBalance.toFixed(2);
}

function addMoney() {
    const amount = prompt('Enter amount to add (BDT):');
    if (amount && !isNaN(amount) && parseFloat(amount) > 0) {
        userBalance += parseFloat(amount);
        updateBalance();
        showNotification(`${amount} BDT added successfully!`);
        saveToLocalStorage();
    } else if (amount !== null) {
        showNotification('Please enter a valid amount');
    }
}

function scrollToProducts() {
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
}

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}


function toggleTheme() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode', isDarkMode);
    const themeIcon = document.getElementById('themeIcon');
    themeIcon.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    isDarkMode = savedTheme === 'dark';
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
        const themeIcon = document.getElementById('themeIcon');
        if (themeIcon) themeIcon.textContent = '☀️';
    }
}


async function loadReviews() {
    try {
        const response = await fetch('reviews.json');
        if (response.ok) {
            reviews = await response.json();
        } else {
            
            reviews = [
                { id: 1, name: "Ahmed Rahman", rating: 5, comment: "The Ethiopian Yirgacheffe is absolutely amazing! Best coffee I've ever tasted.", avatar: "👨" },
                { id: 2, name: "Sarah Khan", rating: 5, comment: "Love the matcha quality! Fast delivery and excellent packaging.", avatar: "👩" },
                { id: 3, name: "Mohammad Ali", rating: 4, comment: "Great variety and reasonable prices. The coffee selection is impressive.", avatar: "👨‍🦱" }
            ];
        }
    } catch (error) {
        console.error('Error loading reviews:', error);
        
        reviews = [
            { id: 1, name: "Ahmed Rahman", rating: 5, comment: "The Ethiopian Yirgacheffe is absolutely amazing! Best coffee I've ever tasted.", avatar: "👨" },
            { id: 2, name: "Sarah Khan", rating: 5, comment: "Love the matcha quality! Fast delivery and excellent packaging.", avatar: "👩" },
            { id: 3, name: "Mohammad Ali", rating: 4, comment: "Great variety and reasonable prices. The coffee selection is impressive.", avatar: "👨‍🦱" }
        ];
    }
}

function renderReviews() {
    const reviewsContainer = document.getElementById('reviewsGrid');
    if (!reviewsContainer) return;
    
    reviewsContainer.innerHTML = reviews.map(review => {
        const stars = '⭐'.repeat(review.rating) + (review.rating < 5 ? '☆'.repeat(5 - review.rating) : '');
        const avatarColors = [
            'from-accent to-accent-light',
            'from-purple-500 to-pink-500',
            'from-green-500 to-teal-500',
            'from-orange-500 to-red-500',
            'from-blue-500 to-cyan-500',
            'from-pink-500 to-rose-500'
        ];
        const colorClass = avatarColors[(review.id - 1) % avatarColors.length];
        
        return `
            <div class="glass-card p-6 rounded-2xl hover:bg-glass-white transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                <div class="flex items-center mb-4">
                    <div class="w-14 h-14 bg-gradient-to-r ${colorClass} rounded-full flex items-center justify-center text-white text-2xl mr-4 shadow-lg">
                        ${review.avatar || review.name.charAt(0)}
                    </div>
                    <div>
                        <h4 class="text-white font-semibold text-lg">${review.name}</h4>
                        <div class="text-yellow-400 text-lg">${stars}</div>
                    </div>
                </div>
                <p class="text-text-secondary leading-relaxed">${review.comment}</p>
                ${review.date ? `<p class="text-text-secondary text-xs mt-2 opacity-70">${new Date(review.date).toLocaleDateString()}</p>` : ''}
            </div>
        `;
    }).join('');
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.className = 'fixed top-4 right-4 glass-strong text-white px-6 py-4 rounded-2xl z-50 border border-glass-border shadow-2xl transform translate-x-full opacity-0 transition-all duration-300';
    document.body.appendChild(notification);
    
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full', 'opacity-0');
        notification.classList.add('translate-x-0', 'opacity-100');
    }, 10);
    
    
    setTimeout(() => {
        notification.classList.add('translate-x-full', 'opacity-0');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function handleContactSubmit(event) {
    event.preventDefault();
    showNotification('Thank you for your message! We\'ll get back to you soon.');
    event.target.reset();
}


function setupEventListeners() {
    
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const category = this.getAttribute('data-filter');
            filterProducts(category, this);
        });
    });

    
    const themeToggleBtn = document.getElementById('themeToggleBtn');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    }

    
    const addMoneyBtn = document.getElementById('addMoneyBtn');
    if (addMoneyBtn) {
        addMoneyBtn.addEventListener('click', addMoney);
    }

    // Cart toggle button
    const cartToggleBtn = document.getElementById('cartToggleBtn');
    if (cartToggleBtn) {
        cartToggleBtn.addEventListener('click', toggleCart);
    }

    // Menu toggle button
    const menuToggleBtn = document.getElementById('menuToggleBtn');
    if (menuToggleBtn) {
        menuToggleBtn.addEventListener('click', toggleMenu);
    }

    // Close cart button
    const closeCartBtn = document.getElementById('closeCartBtn');
    if (closeCartBtn) {
        closeCartBtn.addEventListener('click', toggleCart);
    }

    // Apply coupon button
    const applyCouponBtn = document.getElementById('applyCouponBtn');
    if (applyCouponBtn) {
        applyCouponBtn.addEventListener('click', applyCoupon);
    }

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }

    // Banner navigation buttons
    const prevBannerBtn = document.getElementById('prevBannerBtn');
    const nextBannerBtn = document.getElementById('nextBannerBtn');
    if (prevBannerBtn) prevBannerBtn.addEventListener('click', prevBanner);
    if (nextBannerBtn) nextBannerBtn.addEventListener('click', nextBanner);

    // Back to top button
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        backToTop.addEventListener('click', scrollToTop);
    }

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Back to top button visibility
    window.addEventListener('scroll', () => {
        const backToTop = document.getElementById('backToTop');
        if (backToTop) {
            if (window.scrollY > 300) {
                backToTop.classList.remove('opacity-0', 'pointer-events-none');
                backToTop.classList.add('opacity-100');
            } else {
                backToTop.classList.add('opacity-0', 'pointer-events-none');
                backToTop.classList.remove('opacity-100');
            }
        }
    });

    // Close cart when clicking outside
    document.addEventListener('click', (e) => {
        const sidebar = document.getElementById('cartSidebar');
        const cartButton = document.getElementById('cartToggleBtn');
        
        if (sidebar && !sidebar.contains(e.target) && e.target !== cartButton && !cartButton.contains(e.target) && !sidebar.classList.contains('translate-x-full')) {
            toggleCart();
        }
    });
}

// Local storage
function saveToLocalStorage() {
    localStorage.setItem('cart', JSON.stringify(cart));
    localStorage.setItem('userBalance', userBalance.toString());
    localStorage.setItem('appliedCoupon', appliedCoupon || '');
}

function loadFromLocalStorage() {
    const savedCart = localStorage.getItem('cart');
    const savedBalance = localStorage.getItem('userBalance');
    const savedCoupon = localStorage.getItem('appliedCoupon');
    
    if (savedCart) cart = JSON.parse(savedCart);
    if (savedBalance) userBalance = parseFloat(savedBalance);
    if (savedCoupon) appliedCoupon = savedCoupon || null;
}


setInterval(nextBanner, 5000);


document.addEventListener('DOMContentLoaded', init);

