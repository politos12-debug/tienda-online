// Categorías

let categoriaActual = '';
let productosActuales = [];

// Cargar productos de la categoría
async function cargarCategoria() {
    const urlParams = new URLSearchParams(window.location.search);
    categoriaActual = urlParams.get('categoria') || 'Anillos';

    // Esperar a que Supabase esté listo
    let intentos = 0;
    while (!window.supabaseClient && intentos < 50) {
        await new Promise(resolve => setTimeout(resolve, 100));
        intentos++;
    }

    if (!window.supabaseClient) {
        console.error('Supabase no se inicializó');
        return;
    }

    try {
        const { data: productos, error } = await window.supabaseClient
            .from('products')
            .select('*')
            .eq('categoria', categoriaActual)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error cargando productos:', error);
            return;
        }

        productosActuales = productos || [];

        // Actualizar título
        const categoriaMap = {
            'Anillos': 'Anillos Exclusivos',
            'Collares': 'Collares Sofisticados',
            'Pendientes': 'Pendientes Elegantes',
            'Pulseras': 'Pulseras de Diseño'
        };

        document.getElementById('categoria-titulo').textContent = categoriaMap[categoriaActual] || categoriaActual;
        document.getElementById('categoria-desc').textContent = `Descubre nuestra colección de ${categoriaActual.toLowerCase()}`;

        renderizarProductos(productosActuales);
        updateCartCount();

    } catch (err) {
        console.error('Error:', err);
    }
}

// Renderizar productos
function renderizarProductos(productos) {
    const grid = document.getElementById('productos-grid');
    const sinProductos = document.getElementById('sin-productos');

    if (productos.length === 0) {
        grid.style.display = 'none';
        sinProductos.style.display = 'block';
        return;
    }

    grid.style.display = 'grid';
    sinProductos.style.display = 'none';
    grid.innerHTML = '';

    productos.forEach(producto => {
        // Obtener primera imagen
        let imagenURL = '';
        try {
            const imagenes = Array.isArray(producto.imagen_url)
                ? producto.imagen_url
                : JSON.parse(producto.imagen_url || '[]');
            imagenURL = imagenes[0] || '';
        } catch (e) { }

        const card = document.createElement('div');
        card.className = 'producto-card';

        const etiqueta = producto.etiqueta ? `<div class="producto-etiqueta">${producto.etiqueta}</div>` : '';
        const badgeOferta = producto.descuento_oferta && producto.descuento_oferta > 0
            ? `<div class="oferta-badge">-${producto.descuento_oferta}%</div>`
            : '';

        // Calcular precio con descuento si existe
        let precioHTML = `<div class="producto-precio">€${parseFloat(producto.precio).toFixed(2)}</div>`;
        if (producto.descuento_oferta && producto.descuento_oferta > 0) {
            const precioConDescuento = producto.precio * (1 - producto.descuento_oferta / 100);
            precioHTML = `
                <div class="producto-precio">
                    <span style="text-decoration: line-through;color: #888;font-size:0.85em;">€${parseFloat(producto.precio).toFixed(2)}</span>
                    <span style="font-weight: bold;color: #d4af37;font-size:1.1em;">€${precioConDescuento.toFixed(2)}</span>
                </div>
            `;
        }

        card.innerHTML = `
            ${etiqueta}
            ${badgeOferta}
            <div class="producto-imagen">
                ${imagenURL ? `<img src="${imagenURL}" alt="${producto.nombre}">` : '<div class="producto-imagen-vacia">💎</div>'}
            </div>
            <div class="producto-content">
                <div class="producto-nombre">${producto.nombre}</div>
                ${precioHTML}
                <div class="producto-acciones">
                    <button class="btn-ver-detalle" onclick="window.location.href='/product-detail.html?id=${producto.id}'">Ver Detalle</button>
                    <button class="btn-carrito" onclick="agregarAlCarrito({id: ${producto.id}, nombre: '${producto.nombre.replace(/'/g, "\\'")}', precio: ${producto.precio}, imagen: '${imagenURL.replace(/'/g, "\\'")}'})">Agregar</button>
                </div>
            </div>
        `;

        grid.appendChild(card);
    });
}

// Aplicar filtros
function aplicarFiltros() {
    const filtro = document.getElementById('filtro-precio').value;
    let productosOrdenados = [...productosActuales];

    switch (filtro) {
        case 'precio-asc':
            productosOrdenados.sort((a, b) => a.precio - b.precio);
            break;
        case 'precio-desc':
            productosOrdenados.sort((a, b) => b.precio - a.precio);
            break;
        case 'nombre':
            productosOrdenados.sort((a, b) => a.nombre.localeCompare(b.nombre));
            break;
        case 'nuevo':
        default:
            productosOrdenados.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    renderizarProductos(productosOrdenados);
}

// Función global para agregar al carrito
window.agregarAlCarrito = function (producto) {
    let cart = JSON.parse(localStorage.getItem('carrito') || '[]');

    const item = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        imagen: producto.imagen || ''
    };

    const existingItem = cart.find(i => i.id === item.id);

    if (existingItem) {
        existingItem.cantidad += 1;
    } else {
        cart.push(item);
    }

    localStorage.setItem('carrito', JSON.stringify(cart));
    updateCartCount();
};

// Actualizar contador del carrito
function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('carrito') || '[]');
    const total = cart.reduce((sum, item) => sum + item.cantidad, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = total;
    }
}

// Login modal
window.openLoginModal = function () {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'flex';
};

window.closeLoginModal = function () {
    const modal = document.getElementById('login-modal');
    if (modal) modal.style.display = 'none';
    const form = document.getElementById('login-form');
    if (form) form.reset();
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        cargarCategoria();
    }, 500);
});
