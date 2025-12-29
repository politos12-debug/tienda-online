// ========== MOBILE MENU TOGGLE ==========
function toggleMobileMenu() {
    const navMenu = document.getElementById('nav-menu');
    const hamburger = document.getElementById('hamburger');
    
    if (navMenu) {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active');
    }
}

// Cerrar menú móvil cuando se hace clic en un enlace
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navMenu = document.getElementById('nav-menu');
            const hamburger = document.getElementById('hamburger');
            if (navMenu) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });
});

let currentProduct = null;
let currentImageIndex = 0;
let allProducts = [];

// Cargar el producto desde la URL
async function loadProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    if (!productId) {
        window.location.href = '/';
        return;
    }

    // Esperar a que supabase esté listo
    let intentos = 0;
    while (!window.supabaseClient && intentos < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        intentos++;
    }

    if (!window.supabaseClient) {
        console.error('Supabase no se inicializó');
        window.location.href = '/';
        return;
    }

    try {
        const { data: product, error } = await window.supabaseClient
            .from('products')
            .select('*')
            .eq('id', productId)
            .single();

        if (error || !product) {
            console.error('Producto no encontrado', error);
            window.location.href = '/';
            return;
        }

        currentProduct = product;
        renderProduct(product);
        loadRelatedProducts(product.categoria);
        loadAllProducts();

    } catch (err) {
        console.error('Error cargando producto:', err);
        window.location.href = '/';
    }
}

// Renderizar el producto
function renderProduct(product) {
    // Obtener imágenes
    let imagenes = [];
    try {
        if (product.imagen_url) {
            imagenes = Array.isArray(product.imagen_url)
                ? product.imagen_url
                : JSON.parse(product.imagen_url);
        }
    } catch (e) {
        console.error('Error parsing imágenes:', e);
        imagenes = [];
    }

    if (!Array.isArray(imagenes)) {
        imagenes = [];
    }

    // Titulo y básico
    document.getElementById('product-name').textContent = product.nombre;

    // Precio con descuento si aplica
    const priceElement = document.getElementById('product-price');
    if (product.descuento_oferta && product.descuento_oferta > 0) {
        const precioConDescuento = product.precio * (1 - product.descuento_oferta / 100);
        priceElement.innerHTML = `
            <span style="text-decoration: line-through;color: #888;font-size:0.8em;">€${parseFloat(product.precio).toFixed(2)}</span>
            <span style="margin-left: 10px;color: #d4af37;font-weight: bold;">€${precioConDescuento.toFixed(2)}</span>
            <span style="margin-left: 10px;background: linear-gradient(135deg, #ff4444, #cc0000);color: white;padding: 4px 8px;border-radius: 4px;font-size: 0.85em;font-weight: bold;">-${product.descuento_oferta}%</span>
        `;

        // Mostrar badge de oferta en la galería
        const badgeContainer = document.getElementById('oferta-badge-container');
        if (badgeContainer) {
            badgeContainer.innerHTML = `<div class="oferta-badge">-${product.descuento_oferta}%</div>`;
        }
    } else {
        priceElement.textContent = `€${parseFloat(product.precio).toFixed(2)}`;
        const badgeContainer = document.getElementById('oferta-badge-container');
        if (badgeContainer) {
            badgeContainer.innerHTML = '';
        }
    }

    document.getElementById('product-category').textContent = product.categoria;
    document.getElementById('product-description').textContent = product.descripcion || 'Sin descripción disponible';

    // Badge de etiqueta
    const badge = document.getElementById('product-badge');
    if (product.etiqueta) {
        badge.textContent = product.etiqueta;
        badge.style.display = 'inline-block';
    } else {
        badge.style.display = 'none';
    }

    // Stock
    const stockStatus = document.getElementById('product-stock-status');
    if (product.stock > 5) {
        stockStatus.textContent = `${product.stock} unidades disponibles`;
        stockStatus.className = 'stock-status in-stock';
    } else if (product.stock > 0) {
        stockStatus.textContent = `Solo ${product.stock} unidades disponibles`;
        stockStatus.className = 'stock-status low-stock';
    } else {
        stockStatus.textContent = 'Agotado';
        stockStatus.className = 'stock-status out-stock';
    }

    // Imagen principal y miniaturas
    if (imagenes.length > 0) {
        currentImageIndex = 0;
        document.getElementById('main-image').src = imagenes[0];
        renderThumbnails(imagenes);
    } else {
        document.getElementById('main-image').src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="400"%3E%3Crect fill="%23f0f0f0" width="400" height="400"/%3E%3C/svg%3E';
    }

    // Habilitar/deshabilitar botones según stock
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    const buyBtn = document.querySelector('.btn-secundario.btn-large');

    if (product.stock === 0) {
        addToCartBtn.disabled = true;
        addToCartBtn.style.opacity = '0.5';
        addToCartBtn.style.cursor = 'not-allowed';
        buyBtn.disabled = true;
        buyBtn.style.opacity = '0.5';
        buyBtn.style.cursor = 'not-allowed';
    } else {
        addToCartBtn.disabled = false;
        addToCartBtn.style.opacity = '1';
        addToCartBtn.style.cursor = 'pointer';
        buyBtn.disabled = false;
        buyBtn.style.opacity = '1';
        buyBtn.style.cursor = 'pointer';
    }
}

// Renderizar miniaturas
function renderThumbnails(imagenes) {
    const gallery = document.getElementById('thumbnail-gallery');
    gallery.innerHTML = '';

    imagenes.forEach((img, index) => {
        const thumb = document.createElement('div');
        thumb.className = `thumbnail ${index === 0 ? 'active' : ''}`;
        thumb.innerHTML = `<img src="${img}" alt="Foto ${index + 1}">`;
        thumb.onclick = () => selectImage(index);
        gallery.appendChild(thumb);
    });
}

// Seleccionar imagen
function selectImage(index) {
    let imagenes = [];
    try {
        if (currentProduct.imagen_url) {
            imagenes = Array.isArray(currentProduct.imagen_url)
                ? currentProduct.imagen_url
                : JSON.parse(currentProduct.imagen_url);
        }
    } catch (e) {
        console.error('Error parsing imágenes:', e);
    }

    if (index >= 0 && index < imagenes.length) {
        currentImageIndex = index;
        document.getElementById('main-image').src = imagenes[index];

        // Actualizar thumbnails activas
        document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
}

// Navegación de imágenes
function previousImage() {
    let imagenes = [];
    try {
        if (currentProduct.imagen_url) {
            imagenes = Array.isArray(currentProduct.imagen_url)
                ? currentProduct.imagen_url
                : JSON.parse(currentProduct.imagen_url);
        }
    } catch (e) { }

    if (imagenes.length > 0) {
        currentImageIndex = (currentImageIndex - 1 + imagenes.length) % imagenes.length;
        selectImage(currentImageIndex);
    }
}

function nextImage() {
    let imagenes = [];
    try {
        if (currentProduct.imagen_url) {
            imagenes = Array.isArray(currentProduct.imagen_url)
                ? currentProduct.imagen_url
                : JSON.parse(currentProduct.imagen_url);
        }
    } catch (e) { }

    if (imagenes.length > 0) {
        currentImageIndex = (currentImageIndex + 1) % imagenes.length;
        selectImage(currentImageIndex);
    }
}

// Controlar cantidad
function increaseQuantity() {
    const qty = document.getElementById('quantity');
    const maxStock = currentProduct ? currentProduct.stock : 999;
    if (parseInt(qty.value) < maxStock) {
        qty.value = parseInt(qty.value) + 1;
    }
}

function decreaseQuantity() {
    const qty = document.getElementById('quantity');
    if (parseInt(qty.value) > 1) {
        qty.value = parseInt(qty.value) - 1;
    }
}

// Agregar al carrito
function agregarAlCarrito() {
    if (!currentProduct) return;

    const quantity = parseInt(document.getElementById('quantity').value);

    // Calcular precio final (con descuento si aplica)
    let precioFinal = currentProduct.precio;
    if (currentProduct.descuento_oferta && currentProduct.descuento_oferta > 0) {
        precioFinal = currentProduct.precio * (1 - currentProduct.descuento_oferta / 100);
    }

    // Obtener carrito actual desde localStorage
    let cart = JSON.parse(localStorage.getItem('carrito') || '[]');

    // Buscar si el producto ya está en el carrito
    const existingItem = cart.find(item => item.id === currentProduct.id);

    if (existingItem) {
        existingItem.cantidad += quantity;
    } else {
        cart.push({
            id: currentProduct.id,
            nombre: currentProduct.nombre,
            precio: precioFinal,
            cantidad: quantity,
            imagen: (() => {
                try {
                    const imgs = Array.isArray(currentProduct.imagen_url)
                        ? currentProduct.imagen_url
                        : JSON.parse(currentProduct.imagen_url || '[]');
                    return imgs[0] || '';
                } catch {
                    return '';
                }
            })()
        });
    }

    localStorage.setItem('carrito', JSON.stringify(cart));
    updateCartCount();

    // Resetear cantidad
    document.getElementById('quantity').value = 1;
}

// Comprar ahora
function comprarAhora() {
    agregarAlCarrito();
    setTimeout(() => {
        window.location.href = '/carrito.html';
    }, 500);
}

// Cargar productos relacionados
async function loadRelatedProducts(categoria) {
    let intentos = 0;
    while (!window.supabaseClient && intentos < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        intentos++;
    }

    if (!window.supabaseClient) return;

    try {
        const { data: products } = await window.supabaseClient
            .from('products')
            .select('*')
            .eq('categoria', categoria)
            .neq('id', currentProduct.id)
            .limit(4);

        renderRelatedProducts(products || []);
    } catch (err) {
        console.error('Error cargando productos relacionados:', err);
    }
}

// Renderizar productos relacionados
function renderRelatedProducts(products) {
    const grid = document.getElementById('related-products-grid');
    grid.innerHTML = '';

    products.forEach(product => {
        let imagenURL = '';
        try {
            const imgs = Array.isArray(product.imagen_url)
                ? product.imagen_url
                : JSON.parse(product.imagen_url || '[]');
            imagenURL = imgs[0] || '';
        } catch (e) { }

        const card = document.createElement('div');
        card.className = 'producto-card';
        card.onclick = () => {
            window.location.href = `/product-detail.html?id=${product.id}`;
        };

        card.innerHTML = `
            <div class="producto-imagen">
                ${imagenURL ? `<img src="${imagenURL}" alt="${product.nombre}">` : '📦'}
            </div>
            <div class="producto-content">
                <div class="producto-nombre">${product.nombre}</div>
                <div class="producto-precio">€${parseFloat(product.precio).toFixed(2)}</div>
            </div>
        `;

        grid.appendChild(card);
    });
}

// Cargar todos los productos (para carrito)
async function loadAllProducts() {
    let intentos = 0;
    while (!window.supabaseClient && intentos < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        intentos++;
    }

    if (!window.supabaseClient) return;

    try {
        const { data: products } = await window.supabaseClient
            .from('products')
            .select('*');

        allProducts = products || [];
        updateCartCount();
    } catch (err) {
        console.error('Error cargando productos:', err);
    }
}

// Actualizar contador del carrito
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('carrito') || '[]');
    const count = cart.reduce((total, item) => total + item.cantidad, 0);
    document.getElementById('cart-count').textContent = count;
}

// Abrir modal de login
window.openLoginModal = function () {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'flex';
};

// Cerrar modal de login
window.closeLoginModal = function () {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('login-form');
    if (form) form.reset();
};

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Esperar a que Supabase esté listo
    setTimeout(() => {
        loadProduct();
        updateCartCount();
    }, 500);
});

// Teclas de navegación
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') previousImage();
    if (e.key === 'ArrowRight') nextImage();
});
