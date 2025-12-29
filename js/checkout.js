// Checkout

let carrito = [];
let descuentoAplicado = 0;

// Cargar datos del checkout
function cargarCheckout() {
    carrito = JSON.parse(sessionStorage.getItem('carrito-checkout') || '[]');
    descuentoAplicado = parseInt(sessionStorage.getItem('descuento') || '0');
    
    if (carrito.length === 0) {
        window.location.href = '/carrito.html';
        return;
    }
    
    renderizarOrden();
    configurarMetodoPago();
}

// Renderizar orden
function renderizarOrden() {
    let subtotal = 0;
    const orderItems = document.getElementById('order-items');
    orderItems.innerHTML = '';
    
    carrito.forEach(item => {
        const itemTotal = item.precio * item.cantidad;
        subtotal += itemTotal;
        
        const itemEl = document.createElement('div');
        itemEl.className = 'order-item';
        itemEl.innerHTML = `
            <span class="order-item-name">${item.nombre}</span>
            <span class="order-item-qty">x${item.cantidad}</span>
            <span class="order-item-price">€${itemTotal.toFixed(2)}</span>
        `;
        orderItems.appendChild(itemEl);
    });
    
    // Calcular totales
    const envio = subtotal > 100 ? 0 : 9.99;
    const descuento = subtotal * (descuentoAplicado / 100);
    const total = subtotal + envio - descuento;
    
    document.getElementById('checkout-subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('checkout-envio').textContent = envio > 0 ? `€${envio.toFixed(2)}` : 'Gratis';
    
    if (descuentoAplicado > 0) {
        document.getElementById('checkout-descuento-row').style.display = 'flex';
        document.getElementById('checkout-descuento').textContent = `-€${descuento.toFixed(2)}`;
    }
    
    document.getElementById('checkout-total').textContent = `€${total.toFixed(2)}`;
}

// Configurar método de pago
function configurarMetodoPago() {
    const radios = document.querySelectorAll('input[name="metodo-pago"]');
    const tarjetaDatos = document.getElementById('tarjeta-datos');
    
    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            if (radio.value === 'tarjeta') {
                tarjetaDatos.style.display = 'block';
            } else {
                tarjetaDatos.style.display = 'none';
            }
        });
    });
}

// Formatear número de tarjeta
document.addEventListener('DOMContentLoaded', () => {
    const numeroTarjeta = document.getElementById('numero-tarjeta');
    const expiracion = document.getElementById('expiracion');
    const cvv = document.getElementById('cvv');
    
    if (numeroTarjeta) {
        numeroTarjeta.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '');
            let formatted = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formatted;
        });
    }
    
    if (expiracion) {
        expiracion.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    if (cvv) {
        cvv.addEventListener('input', (e) => {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    cargarCheckout();
});

// Procesar pago
async function procesarPago(e) {
    e.preventDefault();
    
    const metodo = document.querySelector('input[name="metodo-pago"]:checked').value;
    
    // Validar datos
    const nombre = document.getElementById('nombre').value;
    const email = document.getElementById('email').value;
    const telefono = document.getElementById('telefono').value;
    const direccion = document.getElementById('direccion').value;
    const ciudad = document.getElementById('ciudad').value;
    const codigoPostal = document.getElementById('codigo-postal').value;
    const pais = document.getElementById('pais').value;
    
    if (!nombre || !email || !telefono || !direccion || !ciudad || !codigoPostal || !pais) {
        alert('Por favor completa todos los datos de envío');
        return;
    }
    
    // Validar tarjeta si es necesario
    if (metodo === 'tarjeta') {
        const titular = document.getElementById('titular').value;
        const numeroTarjeta = document.getElementById('numero-tarjeta').value;
        const expiracion = document.getElementById('expiracion').value;
        const cvv = document.getElementById('cvv').value;
        
        if (!titular || !numeroTarjeta || !expiracion || !cvv) {
            alert('Por favor completa los datos de la tarjeta');
            return;
        }
        
        // Validar formato de tarjeta
        if (numeroTarjeta.replace(/\s/g, '').length !== 16) {
            alert('El número de tarjeta debe tener 16 dígitos');
            return;
        }
        
        if (expiracion.replace(/\//g, '').length !== 4) {
            alert('Formato de vencimiento inválido (use MM/YY)');
            return;
        }
        
        if (cvv.length !== 3) {
            alert('El CVV debe tener 3 dígitos');
            return;
        }
    }
    
    // Crear pedido
    const pedido = {
        id: `PED-${Date.now()}`,
        cliente: {
            nombre,
            email,
            telefono
        },
        envio: {
            direccion,
            ciudad,
            codigoPostal,
            pais
        },
        carrito: carrito,
        metodoPago: metodo,
        fechaCreacion: new Date().toISOString(),
        estado: 'pendiente'
    };
    
    // Guardar pedido
    let pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    
    // Limpiar carrito
    localStorage.removeItem('carrito');
    sessionStorage.removeItem('carrito-checkout');
    sessionStorage.removeItem('descuento');
    
    // Mostrar confirmación
    mostrarConfirmacion(pedido);
}

// Mostrar confirmación
function mostrarConfirmacion(pedido) {
    // Crear modal de confirmación
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    `;
    
    let total = 0;
    pedido.carrito.forEach(item => {
        total += item.precio * item.cantidad;
    });
    
    const descuento = total * (descuentoAplicado / 100);
    const envio = total > 100 ? 0 : 9.99;
    const totalFinal = total + envio - descuento;
    
    modal.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 40px;
            max-width: 500px;
            text-align: center;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        ">
            <div style="font-size: 60px; margin-bottom: 20px;">✓</div>
            <h1 style="color: var(--color-secundario); margin-bottom: 12px;">¡Compra Confirmada!</h1>
            <p style="color: #666; margin-bottom: 24px;">Tu pedido ha sido procesado exitosamente.</p>
            
            <div style="
                background: #f9f9f9;
                padding: 20px;
                border-radius: 8px;
                text-align: left;
                margin-bottom: 24px;
            ">
                <p><strong>Número de Pedido:</strong> ${pedido.id}</p>
                <p><strong>Cliente:</strong> ${pedido.cliente.nombre}</p>
                <p><strong>Email:</strong> ${pedido.cliente.email}</p>
                <p><strong>Total:</strong> €${totalFinal.toFixed(2)}</p>
                <p><strong>Método de Pago:</strong> ${pedido.metodoPago === 'tarjeta' ? 'Tarjeta de Crédito' : pedido.metodoPago === 'transferencia' ? 'Transferencia Bancaria' : 'PayPal'}</p>
                <p><strong>Estado:</strong> <span style="color: #ff9800;">Procesando</span></p>
            </div>
            
            <p style="color: #999; font-size: 14px; margin-bottom: 24px;">
                Se ha enviado una confirmación a tu email. Tu pedido llegará en 2-3 días laborales.
            </p>
            
            <a href="/" style="
                display: inline-block;
                background: var(--color-primario);
                color: #000;
                padding: 12px 24px;
                border-radius: 6px;
                text-decoration: none;
                font-weight: bold;
                transition: background 0.3s;
            " onmouseover="this.style.background='#c69c2b'" onmouseout="this.style.background='var(--color-primario)'">
                Volver a Inicio
            </a>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Redirect después de 5 segundos
    setTimeout(() => {
        window.location.href = '/';
    }, 5000);
}
