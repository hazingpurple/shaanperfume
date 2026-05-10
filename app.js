// 1. Updated Product Data with Categories
const attarImages = [
    "https://images.unsplash.com/photo-1615484477201-9f4953340fab?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1563170351-be82bc888bb4?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1585232351009-aa87416fca90?auto=format&fit=crop&w=600&q=80"
];

const categories = ["Woody", "Floral", "Fresh", "Spicy"];
const prefixes = ["Oud", "Royal", "Kashmir", "Mysore", "Vedic", "Midnight", "Golden", "Temple", "Saffron", "Celestial"];
const suffixes = ["Musk", "Amber", "Rose", "Sandal", "Mist", "Soul", "Bloom", "Earth", "Essence", "Spice"];

const products = [];
for (let i = 1; i <= 60; i++) {
    products.push({
        id: i,
        name: `${prefixes[i % 10]} ${suffixes[Math.floor(Math.random() * 10)]}`,
        price: 800 + (i * 50),
        image: attarImages[i % attarImages.length],
        category: categories[i % categories.length]
    });
}

// 2. Global State & DOM Elements
let cart = JSON.parse(localStorage.getItem('shaan_haute_cart')) || [];
let currentProducts = [...products];

const grid = document.getElementById('product-grid');
const searchInput = document.getElementById('shop-search');
const categoryFilter = document.getElementById('category-filter');
const priceSort = document.getElementById('price-sort');

// --- SCROLL ANIMATION OBSERVER ---
const observerOptions = { threshold: 0.1 };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// --- NAVIGATION ---
function navigate(view) {
    document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    const targetView = document.getElementById(`view-${view}`);
    if (targetView) targetView.classList.remove('hidden');
    
    const btn = document.getElementById(`btn-${view}`);
    if (btn) btn.classList.add('active');
    
    document.getElementById('nav-links').classList.remove('mobile-active');
    window.scrollTo(0, 0);
    closeCart(null);
}

// --- RENDER FUNCTION (Animated & Reactive) ---
function renderGrid(data) {
    if (!grid) return;
    
    if (data.length === 0) {
        grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 50px; color: #888;">No fragrances found matching your criteria.</div>`;
        return;
    }

    grid.innerHTML = data.map((p, index) => `
        <div class="p-card reveal" style="animation-delay: ${(index % 10) * 0.05}s">
            <div class="img-container">
                <img src="${p.image}" alt="${p.name}" loading="lazy">
            </div>
            <div class="p-details">
                <small class="gold-text" style="letter-spacing: 1px;">${p.category}</small>
                <h3 class="serif-text">${p.name}</h3>
                <span class="p-price">₹${p.price.toLocaleString('en-IN')}</span>
                <button class="cta-gold" onclick="addToCart(${p.id})">ADD TO BAG</button>
            </div>
        </div>
    `).join('');
    
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// --- FILTER & SEARCH LOGIC ---
function applyFilters() {
    const searchTerm = searchInput.value.toLowerCase();
    const cat = categoryFilter.value;
    const sort = priceSort.value;

    let filtered = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(searchTerm);
        const matchesCat = cat === 'all' || p.category === cat;
        return matchesSearch && matchesCat;
    });

    if (sort === 'low') filtered.sort((a, b) => a.price - b.price);
    if (sort === 'high') filtered.sort((a, b) => b.price - a.price);

    renderGrid(filtered);
}

if (searchInput) searchInput.addEventListener('input', applyFilters);
if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
if (priceSort) priceSort.addEventListener('change', applyFilters);

// --- CART LOGIC ---
function addToCart(id) {
    const item = products.find(p => p.id === id);
    const cartItem = { ...item, instanceId: Date.now() + Math.random() };
    cart.push(cartItem);
    updateCartUI();
    triggerMorphingToast(item.name);
}

function removeItem(instanceId) {
    cart = cart.filter(item => item.instanceId !== instanceId);
    updateCartUI();
}

function updateCartUI() {
    const list = document.getElementById('cart-list');
    const totalEl = document.getElementById('cart-total');
    const countEl = document.getElementById('cart-count');
    const checkoutSum = document.getElementById('checkout-sum-total');

    let subtotal = 0;
    countEl.innerText = cart.length;

    if (cart.length === 0) {
        list.innerHTML = `<div style="text-align: center; color: #555; margin-top: 50px;">Your bag is empty.</div>`;
    } else {
        list.innerHTML = cart.map((item) => {
            subtotal += item.price;
            return `
                <div class="cart-item-row">
                    <div>
                        <h4>${item.name}</h4>
                        <span class="gold-text">₹${item.price.toLocaleString('en-IN')}</span>
                    </div>
                    <button class="delete-item" onclick="removeItem(${item.instanceId})">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    const formattedTotal = `₹${subtotal.toLocaleString('en-IN')}`;
    totalEl.innerText = formattedTotal;
    if (checkoutSum) checkoutSum.innerText = formattedTotal;
    localStorage.setItem('shaan_haute_cart', JSON.stringify(cart));
}

// --- UI COMPONENTS ---
function triggerMorphingToast(perfumeName) {
    const wrapper = document.getElementById('toast-wrapper');
    const msgStep = document.getElementById('toast-msg-step');
    const viewStep = document.getElementById('toast-view-step');
    
    document.getElementById('added-perfume-name').innerText = perfumeName;

    viewStep.style.display = 'none';
    msgStep.style.display = 'flex';
    wrapper.classList.add('toast-show');

    setTimeout(() => {
        if (wrapper.classList.contains('toast-show')) {
            msgStep.style.opacity = '0';
            setTimeout(() => {
                msgStep.style.display = 'none';
                msgStep.style.opacity = '1';
                viewStep.style.display = 'flex';
            }, 400);
        }
    }, 2500);
}

function dismissToast() { document.getElementById('toast-wrapper').classList.remove('toast-show'); }
function toggleCartDisplay() { document.getElementById('cart-overlay').classList.toggle('open'); dismissToast(); }
function openCart() { document.getElementById('cart-overlay').classList.add('open'); dismissToast(); }
function closeCart(e) { if (!e || e.target.id === 'cart-overlay') document.getElementById('cart-overlay').classList.remove('open'); }

// --- CHECKOUT LOGIC ---
function openCheckout() {
    if (cart.length === 0) return alert("Your bag is empty. Add some items to proceed.");
    closeCart(null);
    document.getElementById('checkout-overlay').classList.remove('hidden');
}

function closeCheckout() { document.getElementById('checkout-overlay').classList.add('hidden'); }

function finalizeOrder(e) {
    e.preventDefault();
    const name = document.getElementById('cust-name').value;
    const phone = document.getElementById('cust-phone').value;
    const address = document.getElementById('cust-address').value;
    const payment = document.querySelector('input[name="pay_method"]:checked').value;

    if (phone.length < 10) return alert("Please enter a valid phone number.");

    const shaanWhatsapp = "919876543210"; 
    let msg = `*SHAAN PERFUMES ORDER*%0A%0A*Logistics:*%0A- Name: ${name}%0A- Phone: ${phone}%0A- Address: ${address}%0A%0A*Items:*%0A`;
    
    let subtotal = 0;
    cart.forEach(item => {
        msg += `• ${item.name} (₹${item.price})%0A`;
        subtotal += item.price;
    });

    if (payment === 'COD') subtotal += 100;
    msg += `%0A*TOTAL: ₹${subtotal}*%0A*Payment:* ${payment}`;

    window.open(`https://wa.me/${shaanWhatsapp}?text=${msg}`, '_blank');
    
    cart = [];
    updateCartUI();
    localStorage.removeItem('shaan_haute_cart');
    closeCheckout();
    navigate('home');
}

// --- MOBILE NAVIGATION CLICK-AWAY ---
document.addEventListener('click', (e) => {
    const nav = document.getElementById('nav-links');
    const toggle = document.getElementById('mobile-toggle');
    
    if (toggle && toggle.contains(e.target)) {
        nav.classList.toggle('mobile-active');
    } else if (nav && nav.classList.contains('mobile-active') && !nav.contains(e.target)) {
        nav.classList.remove('mobile-active');
    }
});

// Initialize
window.onload = () => {
    applyFilters(); 
    updateCartUI();
};
