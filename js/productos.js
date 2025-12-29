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

// Variables globales
let supabaseClient = null;
let allProductosPage = [];
let filtroActivoPage = 'Todos';

// Cargar productos
async function cargarProductosPagina() {
    if (!supabaseClient) return;

    const { data: productos, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error al cargar productos:', error);
        return;
    }

    allProductosPage = productos || [];

    // Obtener categoría de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const categoria = urlParams.get('categoria');

    if (categoria) {
        filtroActivoPage = categoria;
        activarFiltro(categoria);
        // Filtrar productos por categoría
        const productosFiltrados = allProductosPage.filter(p => p.categoria === categoria);
        mostrarProductos(productosFiltrados);
    } else {
        mostrarProductos(allProductosPage);
    }
}

// Mostrar productos
function mostrarProductos(productos) {
    const grid = document.querySelector('.productos-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (!productos || productos.length === 0) {
        grid.innerHTML = '<p style="text-align:center;grid-column:1/-1;padding:40px;">No hay productos disponibles</p>';
        return;
    }

    productos.forEach(producto => {
        const precioFinal = producto.descuento_oferta > 0
            ? producto.precio * (1 - producto.descuento_oferta / 100)
            : producto.precio;

        const card = document.createElement('div');
        card.className = 'producto-card';

        let imagenUrl = 'https://via.placeholder.com/250x200?text=Producto';
        if (producto.imagen_url) {
            try {
                const imagenes = JSON.parse(producto.imagen_url);
                imagenUrl = Array.isArray(imagenes) ? imagenes[0] : imagenes;
            } catch {
                imagenUrl = producto.imagen_url;
            }
        }

        const badgeOferta = producto.descuento_oferta && producto.descuento_oferta > 0
            ? `<div class="oferta-badge">-${producto.descuento_oferta}%</div>`
            : '';


        let precioHtml = `€${producto.precio.toFixed(2)}`;
        if (producto.descuento_oferta > 0) {
            precioHtml = `
                <span style="text-decoration: line-through;color: #888;font-size:0.85em;">€${producto.precio.toFixed(2)}</span>
                <span style="font-weight:bold;color:#d4af37;font-size:1.1em;">€${precioFinal.toFixed(2)}</span>
            `;
        }


        card.innerHTML = `
            ${badgeOferta}
            <img src="${imagenUrl}" alt="${producto.nombre}" style="width:100%;height:200px;object-fit:cover;">
            <h3>${producto.nombre}</h3>
            <div class="precio">${precioHtml}</div>
            <button class="btn-agregar" onclick="agregarAlCarritoProductos({id: ${producto.id}, nombre: '${producto.nombre}', precio: ${precioFinal}, imagen: '${imagenUrl}'})">Agregar al carrito</button>
        `;

        card.style.cursor = 'pointer';
        card.addEventListener('click', function (e) {
            if (e.target.className === 'btn-agregar') return;
            window.location.href = `/product-detail.html?id=${producto.id}`;
        });

        grid.appendChild(card);
    });

    updateCartCount();
}

// Agregar al carrito
function agregarAlCarritoProductos(item) {
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const existe = carrito.find(i => i.id === item.id);

    if (existe) {
        existe.cantidad += 1;
    } else {
        carrito.push({ ...item, cantidad: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    updateCartCount();
}

// Actualizar contador
function updateCartCount() {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const count = carrito.reduce((total, item) => total + item.cantidad, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}

// Aplicar filtro
function aplicarFiltroProductos(categoria) {
    filtroActivoPage = categoria;

    let productosFiltrados = allProductosPage;

    if (categoria === 'Ofertas') {
        // Filtrar solo productos con descuento
        productosFiltrados = allProductosPage.filter(p => p.descuento_oferta && p.descuento_oferta > 0);
    } else if (categoria !== 'Todos') {
        // Filtrar por categoría
        productosFiltrados = allProductosPage.filter(p => p.categoria === categoria);
    }

    const buscador = document.getElementById('buscador-productos');
    if (buscador && buscador.value) {
        const busqueda = buscador.value.toLowerCase();
        productosFiltrados = productosFiltrados.filter(p =>
            p.nombre.toLowerCase().includes(busqueda) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(busqueda))
        );
    }

    mostrarProductos(productosFiltrados);
    activarFiltro(categoria);
}

// Filtrar por búsqueda
function filtrarPorBusquedaProductos() {
    const busqueda = document.getElementById('buscador-productos').value.toLowerCase();

    let productosFiltrados = allProductosPage;

    if (filtroActivoPage === 'Ofertas') {
        // Filtrar solo productos con descuento
        productosFiltrados = productosFiltrados.filter(p => p.descuento_oferta && p.descuento_oferta > 0);
    } else if (filtroActivoPage !== 'Todos') {
        // Filtrar por categoría
        productosFiltrados = productosFiltrados.filter(p => p.categoria === filtroActivoPage);
    }

    if (busqueda) {
        productosFiltrados = productosFiltrados.filter(p =>
            p.nombre.toLowerCase().includes(busqueda) ||
            (p.descripcion && p.descripcion.toLowerCase().includes(busqueda))
        );
    }

    mostrarProductos(productosFiltrados);
}

// Activar filtro visualmente
function activarFiltro(categoria) {
    const botones = document.querySelectorAll('.filtro-btn');
    botones.forEach(btn => {
        btn.classList.remove('activo');
        if (btn.textContent.trim() === categoria) {
            btn.classList.add('activo');
        }
    });
}

// auth.js already provides openLoginModal and closeLoginModal functions

// Iniciar cuando todo está listo
window.addEventListener('load', function () {
    // Esperar a que Supabase esté disponible
    let intentos = 0;
    function iniciar() {
        if (window.supabaseClient) {
            supabaseClient = window.supabaseClient;
            cargarProductosPagina();
            updateCartCount();
        } else if (intentos < 50) {
            intentos++;
            setTimeout(iniciar, 100);
        }
    }

    iniciar();
});

