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

// ========== AUTENTICACIÓN ==========
let supabaseClient = null;
let currentUser = null;
let userRole = null;

// ========== CARGAR DATOS DE LA BD ==========

// Variable global para almacenar productos
let allProductos = [];
let filtroActual = 'Todos';

// Cargar productos y renderizar
async function cargarProductosWeb() {
    if (!supabaseClient) return;

    const { data: productos, error } = await supabaseClient
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error al cargar productos:', error);
        return;
    }

    allProductos = productos;
    // Aplicar filtro inicial a Anillos (solo 2 productos)
    aplicarFiltroTendencias('Anillos');
}

// Renderizar productos con filtro
function renderizarProductos(productos) {
    const grid = document.querySelector('.productos-grid');
    if (!grid) return;

    grid.innerHTML = '';

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.style.cursor = 'pointer';

        const etiqueta = producto.etiqueta ? `<div class="producto-etiqueta">${producto.etiqueta}</div>` : '';

        // Badge de oferta si tiene descuento
        const badgeOferta = producto.descuento_oferta && producto.descuento_oferta > 0
            ? `<div class="oferta-badge">-${producto.descuento_oferta}%</div>`
            : '';

        // Parsear imágenes (pueden ser JSON array o string simple)
        let imagenHTML = '<div class="producto-imagen">💎</div>';
        if (producto.imagen_url) {
            try {
                const imagenes = JSON.parse(producto.imagen_url);
                if (Array.isArray(imagenes) && imagenes.length > 0) {
                    imagenHTML = `<img src="${imagenes[0]}" alt="${producto.nombre}" style="width: 100%; height: 200px; object-fit: cover;">`;
                }
            } catch (e) {
                // Si no es JSON, intenta como URL directa
                if (producto.imagen_url.startsWith('http')) {
                    imagenHTML = `<img src="${producto.imagen_url}" alt="${producto.nombre}" style="width: 100%; height: 200px; object-fit: cover;">`;
                }
            }
        }

        // Calcular precio con descuento si existe
        let precioHTML = `<p class="precio">€${parseFloat(producto.precio).toFixed(2)}</p>`;
        if (producto.descuento_oferta && producto.descuento_oferta > 0) {
            const precioConDescuento = producto.precio * (1 - producto.descuento_oferta / 100);
            precioHTML = `
                <div class="precio">
                    <span style="text-decoration: line-through;color: #888;font-size:0.85em;">€${parseFloat(producto.precio).toFixed(2)}</span>
                    <span style="font-weight: bold;color: #d4af37;font-size:1.1em;">€${precioConDescuento.toFixed(2)}</span>
                </div>
            `;
        }

        // Calcular precio final (con descuento si aplica)
        let precioFinal = producto.precio;
        if (producto.descuento_oferta && producto.descuento_oferta > 0) {
            precioFinal = producto.precio * (1 - producto.descuento_oferta / 100);
        }

        // Extraer URL de imagen para el carrito
        let imagenUrl = '';
        if (producto.imagen_url) {
            try {
                const imagenes = JSON.parse(producto.imagen_url);
                imagenUrl = Array.isArray(imagenes) ? imagenes[0] : imagenes;
            } catch (e) {
                imagenUrl = producto.imagen_url;
            }
        }

        card.innerHTML = `
            ${etiqueta}
            ${badgeOferta}
            <div class="producto-imagen">${imagenHTML}</div>
            <h3>${producto.nombre}</h3>
            ${precioHTML}
            <button class="btn-agregar" onclick="agregarAlCarrito({id: ${producto.id}, nombre: '${producto.nombre}', precio: ${precioFinal}, imagen: '${imagenUrl}'})">Agregar al carrito</button>
        `;

        // Hacer el card clickeable para ir a detalle
        card.addEventListener('click', function (e) {
            // Si se hace clic en el botón, no navegar
            if (e.target.className === 'btn-agregar') return;
            window.location.href = `/product-detail.html?id=${producto.id}`;
        });

        grid.appendChild(card);
    });
}


// Renderizar Últimas Tendencias (2 de cada categoría)
function renderizarUltimasTendencias(productos) {
    const grid = document.getElementById('tendencias-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const categorias = ['Anillos', 'Collares', 'Pendientes', 'Pulseras', 'Relojes'];

    categorias.forEach(categoria => {
        // Obtener los primeros 2 productos de esta categoría
        const productosCat = productos.filter(p => p.categoria === categoria).slice(0, 2);

        productosCat.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'producto-card';
            card.style.cursor = 'pointer';

            const etiqueta = producto.etiqueta ? `<div class="producto-etiqueta">${producto.etiqueta}</div>` : '';
            const badgeOferta = producto.descuento_oferta && producto.descuento_oferta > 0
                ? `<div class="oferta-badge">-${producto.descuento_oferta}%</div>`
                : '';

            let imagenHTML = '<div class="producto-imagen">💎</div>';
            if (producto.imagen_url) {
                try {
                    const imagenes = JSON.parse(producto.imagen_url);
                    if (Array.isArray(imagenes) && imagenes.length > 0) {
                        imagenHTML = `<img src="${imagenes[0]}" alt="${producto.nombre}" style="width: 100%; height: 200px; object-fit: cover;">`;
                    }
                } catch (e) {
                    if (producto.imagen_url.startsWith('http')) {
                        imagenHTML = `<img src="${producto.imagen_url}" alt="${producto.nombre}" style="width: 100%; height: 200px; object-fit: cover;">`;
                    }
                }
            }

            let precioHTML = `<p class="precio">€${parseFloat(producto.precio).toFixed(2)}</p>`;
            if (producto.descuento_oferta && producto.descuento_oferta > 0) {
                const precioConDescuento = producto.precio * (1 - producto.descuento_oferta / 100);
                precioHTML = `
                    <div style="display:flex;gap:10px;align-items:center;">
                        <span style="text-decoration: line-through;color: #888;font-size:0.9em;">€${parseFloat(producto.precio).toFixed(2)}</span>
                        <span style="margin-left: 5px;font-weight: bold;color: #d4af37;">€${precioConDescuento.toFixed(2)}</span>
                    </div>
                `;
            }

            let precioFinal = producto.precio;
            if (producto.descuento_oferta && producto.descuento_oferta > 0) {
                precioFinal = producto.precio * (1 - producto.descuento_oferta / 100);
            }

            // Extraer URL de imagen para el carrito
            let imagenUrl = '';
            if (producto.imagen_url) {
                try {
                    const imagenes = JSON.parse(producto.imagen_url);
                    imagenUrl = Array.isArray(imagenes) ? imagenes[0] : imagenes;
                } catch (e) {
                    imagenUrl = producto.imagen_url;
                }
            }

            card.innerHTML = `
                ${etiqueta}
                ${badgeOferta}
                <div class="producto-imagen">${imagenHTML}</div>
                <h3>${producto.nombre}</h3>
                ${precioHTML}
                <button class="btn-agregar" onclick="agregarAlCarrito({id: ${producto.id}, nombre: '${producto.nombre}', precio: ${precioFinal}, imagen: '${imagenUrl}'})">Agregar al carrito</button>
            `;

            card.addEventListener('click', function (e) {
                if (e.target.className === 'btn-agregar') return;
                window.location.href = `/product-detail.html?id=${producto.id}`;
            });

            grid.appendChild(card);
        });
    });
}

// Aplicar filtro en Últimas Tendencias
function aplicarFiltroTendencias(categoria) {
    const grid = document.getElementById('tendencias-grid');
    if (!grid) return;

    // Actualizar botones activos
    const botones = document.querySelectorAll('.filtros-productos .filtro-btn');
    botones.forEach(btn => {
        btn.classList.remove('activo');
        if (btn.textContent.trim() === categoria) {
            btn.classList.add('activo');
        }
    });

    // Filtrar y mostrar 2 productos de la categoría
    const productosCat = allProductos.filter(p => p.categoria === categoria).slice(0, 2);

    grid.innerHTML = '';

    productosCat.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        card.style.cursor = 'pointer';

        const etiqueta = producto.etiqueta ? `<div class="producto-etiqueta">${producto.etiqueta}</div>` : '';
        const badgeOferta = producto.descuento_oferta && producto.descuento_oferta > 0
            ? `<div class="oferta-badge">-${producto.descuento_oferta}%</div>`
            : '';

        let imagenHTML = '<div class="producto-imagen">💎</div>';
        if (producto.imagen_url) {
            try {
                const imagenes = JSON.parse(producto.imagen_url);
                if (Array.isArray(imagenes) && imagenes.length > 0) {
                    imagenHTML = `<img src="${imagenes[0]}" alt="${producto.nombre}" style="width: 100%; height: 200px; object-fit: cover;">`;
                }
            } catch (e) {
                if (producto.imagen_url.startsWith('http')) {
                    imagenHTML = `<img src="${producto.imagen_url}" alt="${producto.nombre}" style="width: 100%; height: 200px; object-fit: cover;">`;
                }
            }
        }

        let precioHTML = `<p class="precio">€${parseFloat(producto.precio).toFixed(2)}</p>`;
        if (producto.descuento_oferta && producto.descuento_oferta > 0) {
            const precioConDescuento = producto.precio * (1 - producto.descuento_oferta / 100);
            precioHTML = `
                <div style="display:flex;gap:10px;align-items:center;">
                    <span style="text-decoration: line-through;color: #888;font-size:0.9em;">€${parseFloat(producto.precio).toFixed(2)}</span>
                    <span style="margin-left: 5px;font-weight: bold;color: #d4af37;">€${precioConDescuento.toFixed(2)}</span>
                </div>
            `;
        }

        let precioFinal = producto.precio;
        if (producto.descuento_oferta && producto.descuento_oferta > 0) {
            precioFinal = producto.precio * (1 - producto.descuento_oferta / 100);
        }

        // Extraer URL de imagen para el carrito
        let imagenUrl = '';
        if (producto.imagen_url) {
            try {
                const imagenes = JSON.parse(producto.imagen_url);
                imagenUrl = Array.isArray(imagenes) ? imagenes[0] : imagenes;
            } catch (e) {
                imagenUrl = producto.imagen_url;
            }
        }

        card.innerHTML = `
            ${etiqueta}
            ${badgeOferta}
            <div class="producto-imagen">${imagenHTML}</div>
            <h3>${producto.nombre}</h3>
            ${precioHTML}
            <button class="btn-agregar" onclick="agregarAlCarrito({id: ${producto.id}, nombre: '${producto.nombre}', precio: ${precioFinal}, imagen: '${imagenUrl}'})">Agregar al carrito</button>
        `;

        card.addEventListener('click', function (e) {
            if (e.target.className === 'btn-agregar') return;
            window.location.href = `/product-detail.html?id=${producto.id}`;
        });

        grid.appendChild(card);
    });
}


// Renderizar Últimas Tendencias (2 de cada categoría)
function renderizarUltimasTendencias(productos) {
    const grid = document.getElementById('tendencias-grid');
    if (!grid) return;

    grid.innerHTML = '';

    const categorias = ['Anillos', 'Collares', 'Pendientes', 'Pulseras', 'Relojes'];

    categorias.forEach(categoria => {
        // Obtener los primeros 2 productos de esta categoría
        const productosCat = productos.filter(p => p.categoria === categoria).slice(0, 2);

        productosCat.forEach(producto => {
            const card = document.createElement('div');
            card.className = 'producto-card';
            card.style.cursor = 'pointer';

            const etiqueta = producto.etiqueta ? `<div class="producto-etiqueta">${producto.etiqueta}</div>` : '';
            const badgeOferta = producto.descuento_oferta && producto.descuento_oferta > 0
                ? `<div class="oferta-badge">-${producto.descuento_oferta}%</div>`
                : '';

            let imagenHTML = '<div class="producto-imagen">💎</div>';
            if (producto.imagen_url) {
                try {
                    const imagenes = JSON.parse(producto.imagen_url);
                    if (Array.isArray(imagenes) && imagenes.length > 0) {
                        imagenHTML = `<img src="${imagenes[0]}" alt="${producto.nombre}" style="width: 100%; height: 200px; object-fit: cover;">`;
                    }
                } catch (e) {
                    if (producto.imagen_url.startsWith('http')) {
                        imagenHTML = `<img src="${producto.imagen_url}" alt="${producto.nombre}" style="width: 100%; height: 200px; object-fit: cover;">`;
                    }
                }
            }

            let precioHTML = `<p class="precio">€${parseFloat(producto.precio).toFixed(2)}</p>`;
            if (producto.descuento_oferta && producto.descuento_oferta > 0) {
                const precioConDescuento = producto.precio * (1 - producto.descuento_oferta / 100);
                precioHTML = `
                    <div style="display:flex;gap:10px;align-items:center;">
                        <span style="text-decoration: line-through;color: #888;font-size:0.9em;">€${parseFloat(producto.precio).toFixed(2)}</span>
                        <span style="margin-left: 5px;font-weight: bold;color: #d4af37;">€${precioConDescuento.toFixed(2)}</span>
                    </div>
                `;
            }

            let precioFinal = producto.precio;
            if (producto.descuento_oferta && producto.descuento_oferta > 0) {
                precioFinal = producto.precio * (1 - producto.descuento_oferta / 100);
            }

            // Extraer URL de imagen para el carrito
            let imagenUrl = '';
            if (producto.imagen_url) {
                try {
                    const imagenes = JSON.parse(producto.imagen_url);
                    imagenUrl = Array.isArray(imagenes) ? imagenes[0] : imagenes;
                } catch (e) {
                    imagenUrl = producto.imagen_url;
                }
            }

            card.innerHTML = `
                ${etiqueta}
                ${badgeOferta}
                <div class="producto-imagen">${imagenHTML}</div>
                <h3>${producto.nombre}</h3>
                ${precioHTML}
                <button class="btn-agregar" onclick="agregarAlCarrito({id: ${producto.id}, nombre: '${producto.nombre}', precio: ${precioFinal}, imagen: '${imagenUrl}'})">Agregar al carrito</button>
            `;

            card.addEventListener('click', function (e) {
                if (e.target.className === 'btn-agregar') return;
                window.location.href = `/product-detail.html?id=${producto.id}`;
            });

            grid.appendChild(card);
        });
    });
}


// Cargar ofertas y renderizar
async function cargarOfertasWeb() {
    if (!supabaseClient) return;

    const { data: productosOfertas, error } = await supabaseClient
        .from('products')
        .select('*')
        .gt('descuento_oferta', 0)  // Solo productos con descuento
        .order('created_at', { ascending: false });

    if (error) {
        console.error('Error al cargar ofertas:', error);
        return;
    }

    const grid = document.querySelector('.ofertas-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (productosOfertas.length === 0) {
        grid.innerHTML = '<p style="text-align:center;padding:20px;">No hay ofertas disponibles en este momento</p>';
        return;
    }

    productosOfertas.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'oferta-card';

        // Procesar imagen
        let imagenUrl = '';
        if (producto.imagen_url) {
            try {
                const imagenes = JSON.parse(producto.imagen_url);
                imagenUrl = Array.isArray(imagenes) ? imagenes[0] : imagenes;
            } catch {
                imagenUrl = producto.imagen_url;
            }
        }

        const precioConDescuento = producto.precio * (1 - producto.descuento_oferta / 100);

        card.innerHTML = `
            <div class="oferta-descuento">-${producto.descuento_oferta}%</div>
            <img src="${imagenUrl || 'https://via.placeholder.com/250x200?text=Producto'}" alt="${producto.nombre}" style="width: 100%; height: 200px; object-fit: cover; cursor: pointer;" onclick="irAlProducto(${producto.id})">
            <h3>${producto.nombre}</h3>
            <div style="margin: 10px 0;">
            <span style="text-decoration: line-through; color: #888; margin-right: 10px;">€${producto.precio.toFixed(2)}</span>
                    <span style="font-weight: bold; color: #d4af37; font-size: 1.2em;">€${precioConDescuento.toFixed(2)}</span>
            </div>
            <button onclick="irAlProducto(${producto.id})" class="btn-principal">Ver Producto</button>
        `;
        grid.appendChild(card);
    });
}

function irAlProducto(id) {
    window.location.href = `/product-detail.html?id=${id}`;
}

// Cargar slides de galería (ya está en iniciarGaleriaAutomatica)
async function cargarSlidesBD() {
    if (!supabaseClient) return;

    const { data: slides, error } = await supabaseClient
        .from('gallery_slides')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true });

    if (error) {
        console.error('Error al cargar slides:', error);
        return;
    }

    const container = document.querySelector('.galeria-container');
    if (!container) return;

    container.innerHTML = '';

    slides.forEach((slide, index) => {
        const slideEl = document.createElement('div');
        slideEl.className = `galeria-slide ${index === 0 ? 'activo' : ''}`;
        slideEl.innerHTML = `
            <div class="slide-content">
                <h2>${slide.titulo}</h2>
                <p>${slide.descripcion || ''}</p>
                <button class="btn-principal">Ver Más</button>
            </div>
            ${slide.imagen_url ? `<img src="${slide.imagen_url}" alt="${slide.titulo}" style="position: absolute; width: 100%; height: 100%; object-fit: cover; top: 0; left: 0; z-index: -1;">` : '<div class="slide-bg" style="background: linear-gradient(135deg, var(--color-secundario) 0%, #501429 100%);"></div>'}
        `;
        container.appendChild(slideEl);
    });

    // Actualizar indicadores
    actualizarIndicadores();
}

// ========== AUTENTICACIÓN ==========
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

window.logout = async function () {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    currentUser = null;
    userRole = null;
    window.location.href = '/';
};

// Inicializar autenticación
function initAuth() {
    if (!window.supabaseClient) {
        setTimeout(initAuth, 100);
        return;
    }

    supabaseClient = window.supabaseClient;

    const form = document.getElementById('login-form');
    if (form) {
        form.addEventListener('submit', handleLogin);
    }

    const modal = document.getElementById('login-modal');
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) window.closeLoginModal();
        });
    }

    checkSession();
}

async function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const btn = this.querySelector('button[type="submit"]');

    btn.disabled = true;
    btn.textContent = 'Cargando...';

    try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

        if (error) throw error;

        currentUser = data.user;
        console.log('Usuario logueado:', currentUser.id);

        // Obtener rol - versión tolerante sin .single()
        const { data: roles, error: roleError } = await supabaseClient
            .from('user_roles')
            .select('role')
            .eq('user_id', currentUser.id);

        console.log('Roles encontrados:', roles);

        if (roles && roles.length > 0) {
            userRole = roles[0].role;
            console.log('Rol asignado:', userRole);
        } else {
            console.log('No se encontró rol para este usuario');
            userRole = 'user';
        }

        if (userRole === 'admin') {
            console.log('Redirigiendo a admin...');
            window.location.href = '/admin.html';
        } else {
            console.log('Usuario normal, cerrando modal');
            window.closeLoginModal();
            updateAuthUI();
        }
    } catch (error) {
        console.error('Error en login:', error);
        alert('Error: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = 'Iniciar Sesión';
    }
}

async function checkSession() {
    try {
        const { data: { session } } = await supabaseClient.auth.getSession();

        if (session) {
            currentUser = session.user;
            const { data: roles } = await supabaseClient
                .from('user_roles')
                .select('role')
                .eq('user_id', currentUser.id);

            if (roles && roles.length > 0) {
                userRole = roles[0].role;
            }
        }

        updateAuthUI();
    } catch (error) {
        console.error('Error verificando sesión:', error);
    }
}

function updateAuthUI() {
    const authBtn = document.getElementById('auth-button');
    if (!authBtn) return;

    if (currentUser) {
        authBtn.innerHTML = `
            <div class="user-menu">
                <button id="user-info-btn" class="btn-usuario">👤 ${currentUser.email.split('@')[0]}</button>
                <div id="user-dropdown" class="user-dropdown" style="display:none;">
                    ${userRole === 'admin' ? '<a href="/admin.html">Panel Admin</a>' : ''}
                    <button onclick="window.logout()">Cerrar Sesión</button>
                </div>
            </div>
        `;

        document.getElementById('user-info-btn').addEventListener('click', function (e) {
            e.stopPropagation();
            const dd = document.getElementById('user-dropdown');
            dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
        });

        document.addEventListener('click', function (e) {
            const dd = document.getElementById('user-dropdown');
            if (dd && !e.target.closest('.user-menu')) {
                dd.style.display = 'none';
            }
        });
    } else {
        authBtn.innerHTML = `<button onclick="window.openLoginModal()" class="btn-login">Iniciar Sesión</button>`;
    }
}

// Iniciar auth cuando Supabase esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
} else {
    initAuth();
}

// ========== GALERÍA Y CARRITO ==========
// Variables globales para la galería

let slideActual = 0;
let autoSlideInterval;

// Funcionalidad del carrito
let carrito = [];

// Inicialización
document.addEventListener('DOMContentLoaded', function () {
    // Iniciar galería automática
    iniciarGaleriaAutomatica();

    // Agregarde eventos a los botones de agregar al carrito
    const botonesAgregar = document.querySelectorAll('.btn-agregar');

    botonesAgregar.forEach(boton => {
        boton.addEventListener('click', function () {
            const card = this.closest('.producto-card');
            const nombre = card.querySelector('h3').textContent;
            const precio = card.querySelector('.precio').textContent;

            agregarAlCarrito(nombre, precio);
            mostrarNotificacion('Producto agregado al carrito');
        });
    });

    // Botón principal del hero
    const botonesHero = document.querySelectorAll('.slide-content .btn-principal');
    botonesHero.forEach(btn => {
        btn.addEventListener('click', function () {
            document.getElementById('productos').scrollIntoView({ behavior: 'smooth' });
        });
    });

    // Navegación suave
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Formulario de contacto
    const formulario = document.querySelector('.formulario-contacto');
    if (formulario) {
        formulario.addEventListener('submit', function (e) {
            e.preventDefault();
            mostrarNotificacion('¡Mensaje enviado correctamente! Nos pondremos en contacto pronto.');
            this.reset();
        });
    }

    // Formulario newsletter
    const formularioNewsletter = document.querySelector('.formulario-newsletter');
    if (formularioNewsletter) {
        formularioNewsletter.addEventListener('submit', function (e) {
            e.preventDefault();
            mostrarNotificacion('¡Te has suscrito correctamente!');
            this.reset();
        });
    }
});

// Funciones de Galería
function cambiarSlide(n) {
    mostrarSlide(slideActual += n);
    reiniciarTimer();
}

function irAlSlide(n) {
    mostrarSlide(slideActual = n);
    reiniciarTimer();
}

function mostrarSlide(n) {
    const slides = document.querySelectorAll('.galeria-slide');
    const indicadores = document.querySelectorAll('.indicador');

    if (n >= slides.length) {
        slideActual = 0;
    }
    if (n < 0) {
        slideActual = slides.length - 1;
    }

    slides.forEach((slide, index) => {
        slide.classList.remove('activo', 'anterior');
        if (index === slideActual) {
            slide.classList.add('activo');
        } else if (index < slideActual) {
            slide.classList.add('anterior');
        }
    });

    indicadores.forEach((ind, index) => {
        ind.classList.remove('activo');
        if (index === slideActual) {
            ind.classList.add('activo');
        }
    });
}

function actualizarIndicadores() {
    const container = document.querySelector('.galeria-indicadores');
    const slides = document.querySelectorAll('.galeria-slide');
    if (!container) return;

    container.innerHTML = '';
    slides.forEach((slide, index) => {
        const span = document.createElement('span');
        span.className = `indicador ${index === 0 ? 'activo' : ''}`;
        span.onclick = () => irAlSlide(index);
        container.appendChild(span);
    });
}

function iniciarGaleriaAutomatica() {
    autoSlideInterval = setInterval(() => {
        slideActual++;
        mostrarSlide(slideActual);
    }, 5000);
}

function reiniciarTimer() {
    clearInterval(autoSlideInterval);
    iniciarGaleriaAutomatica();
}

// Función para agregar al carrito
function agregarAlCarrito(producto) {
    // Obtener carrito actual desde localStorage
    let cart = JSON.parse(localStorage.getItem('carrito') || '[]');

    // Si el argumento es un objeto simple, convertirlo
    if (typeof producto === 'object') {
        const item = {
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1,
            imagen: producto.imagen || ''
        };

        // Buscar si el producto ya está en el carrito
        const existingItem = cart.find(i => i.id === item.id);

        if (existingItem) {
            existingItem.cantidad += 1;
        } else {
            cart.push(item);
        }
    }

    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(cart));
    actualizarCarrito();
}

// Función para actualizar el carrito
function actualizarCarrito() {
    const cart = JSON.parse(localStorage.getItem('carrito') || '[]');
    const total = cart.reduce((sum, item) => sum + item.cantidad, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = total;
    }
}

// Función para mostrar notificaciones
function mostrarNotificacion(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, var(--color-principal), #E5C158);
        color: var(--color-secundario);
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
        z-index: 1000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;

    notificacion.textContent = mensaje;
    document.body.appendChild(notificacion);

    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notificacion.remove(), 300);
    }, 3000);
}

// Agregar animación de notificación
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Cargar el carrito desde localStorage al iniciar
window.addEventListener('load', function () {
    const carritoGuardado = localStorage.getItem('carrito');
    if (carritoGuardado) {
        carrito = JSON.parse(carritoGuardado);
        actualizarCarrito();
    }

    // Cargar datos de la BD
    setTimeout(() => {
        cargarSlidesBD();
        cargarProductosWeb();
        cargarOfertasWeb();
    }, 500);
});

// Configurar botones de filtro

