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

// Carrito de compras - localStorage

let carrito = [];
let descuentoAplicado = 0;

// Cargar carrito al abrir la página
function cargarCarrito() {
    carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    renderizarCarrito();
    calcularTotales();
}

// Renderizar tabla del carrito
function renderizarCarrito() {
    const tbody = document.getElementById('carrito-tbody');
    const vacioMsg = document.getElementById('carrito-vacio');
    const table = document.getElementById('carrito-table');
    
    if (carrito.length === 0) {
        table.style.display = 'none';
        vacioMsg.style.display = 'block';
        updateCartCount();
        return;
    }
    
    table.style.display = 'table';
    vacioMsg.style.display = 'none';
    
    tbody.innerHTML = '';
    
    carrito.forEach((item, index) => {
        const row = document.createElement('tr');
        const subtotal = item.precio * item.cantidad;
        
        row.innerHTML = `
            <td>
                <div class="producto-carrito">
                    ${item.imagen ? `
                        <div class="producto-carrito-img">
                            <img src="${item.imagen}" alt="${item.nombre}">
                        </div>
                    ` : ''}
                    <div class="producto-carrito-nombre">${item.nombre}</div>
                </div>
            </td>
            <td>€${parseFloat(item.precio).toFixed(2)}</td>
            <td>
                <input type="number" class="cantidad-input" value="${item.cantidad}" min="1" 
                    onchange="actualizarCantidad(${index}, this.value)">
            </td>
            <td>€${subtotal.toFixed(2)}</td>
            <td>
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${index})">Eliminar</button>
            </td>
        `;
        
        tbody.appendChild(row);
    });
    
    updateCartCount();
}

// Actualizar cantidad
function actualizarCantidad(index, nuevaCantidad) {
    const cantidad = parseInt(nuevaCantidad);
    
    if (cantidad < 1) {
        eliminarDelCarrito(index);
        return;
    }
    
    carrito[index].cantidad = cantidad;
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    calcularTotales();
}

// Eliminar del carrito
function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    calcularTotales();
}

// Calcular totales
function calcularTotales() {
    let subtotal = 0;
    
    carrito.forEach(item => {
        subtotal += item.precio * item.cantidad;
    });
    
    // Envío gratis si es mayor a 100€
    const envio = subtotal > 100 ? 0 : 9.99;
    
    // Aplicar descuento
    const descuento = subtotal * (descuentoAplicado / 100);
    
    const total = subtotal + envio - descuento;
    
    // Actualizar elementos
    document.getElementById('subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('envio').textContent = envio > 0 ? `€${envio.toFixed(2)}` : 'Gratis';
    
    if (descuentoAplicado > 0) {
        document.getElementById('descuento-row').style.display = 'flex';
        document.getElementById('descuento-amount').textContent = `-€${descuento.toFixed(2)}`;
    } else {
        document.getElementById('descuento-row').style.display = 'none';
    }
    
    document.getElementById('total').textContent = `€${total.toFixed(2)}`;
}

// Aplicar descuento
function aplicarDescuento() {
    const codigo = document.getElementById('codigo-descuento').value.toUpperCase().trim();
    
    if (!codigo) {
        alert('Por favor ingresa un código de descuento');
        return;
    }
    
    // Códigos de ejemplo
    const codigos = {
        'NAVI2025': 10,      // 10% de descuento
        'GALIANA10': 10,     // 10% de descuento
        'DICIEMBRE': 15,     // 15% de descuento
        'OFERTA20': 20       // 20% de descuento
    };
    
    if (codigos[codigo]) {
        descuentoAplicado = codigos[codigo];
        alert(`✓ Descuento de ${descuentoAplicado}% aplicado correctamente`);
        document.getElementById('codigo-descuento').disabled = true;
        calcularTotales();
    } else {
        alert('❌ Código de descuento inválido');
        descuentoAplicado = 0;
    }
}

// Ir a checkout
function irACheckout() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Guardar carrito en sesión para checkout
    sessionStorage.setItem('carrito-checkout', JSON.stringify(carrito));
    sessionStorage.setItem('descuento', descuentoAplicado);
    
    window.location.href = '/checkout.html';
}

// Actualizar contador
function updateCartCount() {
    const count = carrito.reduce((total, item) => total + item.cantidad, 0);
    document.getElementById('cart-count').textContent = count;
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    cargarCarrito();
});
