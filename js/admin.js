// JS del Panel Admin
let supabaseAdmin = null;

let productoEditar = null;
let ofertaEditar = null;
let slideEditar = null;

// Función para verificar/crear columna descuento_oferta en productos
async function verificarColumenDescuentoOferta() {
    try {
        // Intentar leer un producto para ver si la columna existe
        const { data, error } = await supabaseAdmin
            .from('products')
            .select('descuento_oferta')
            .limit(1);
        
        if (error && error.message.includes('descuento_oferta')) {
            // La columna no existe, intentar crearla con RPC
            console.log('Agregando columna descuento_oferta...');
            const { error: rpcError } = await supabaseAdmin.rpc('create_descuento_oferta_column');
            if (rpcError) {
                console.log('No se puede crear la columna automáticamente. Asegúrate de que exista en la BD.');
            }
        }
    } catch (err) {
        console.error('Error al verificar columna:', err);
    }
}

// Función para subir imagen a Storage
async function subirImagen(file, carpeta) {
    if (!file) return null;
    
    const nombreArchivo = `${Date.now()}_${file.name}`;
    const ruta = `${carpeta}/${nombreArchivo}`;
    
    try {
        const { data, error } = await supabaseAdmin.storage
            .from('images')
            .upload(ruta, file);
        
        if (error) {
            console.error('Error al subir imagen:', error);
            alert('Error al subir imagen: ' + error.message);
            return null;
        }
        
        // Obtener URL pública
        const { data: urlData } = supabaseAdmin.storage
            .from('images')
            .getPublicUrl(ruta);
        
        return urlData.publicUrl;
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
        return null;
    }
}

// Verificar si es admin y cargar datos
async function initAdmin() {
    // Esperar a que supabase esté disponible
    if (!window.supabaseClient) {
        setTimeout(initAdmin, 100);
        return;
    }
    
    supabaseAdmin = window.supabaseClient;
    
    // Verificar sesión
    const { data: { session } } = await supabaseAdmin.auth.getSession();
    
    if (!session) {
        window.location.href = '/';
        return;
    }
    
    // Verificar si es admin
    const { data: roleData } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
    
    if (!roleData || roleData.role !== 'admin') {
        alert('No tienes permisos para acceder al panel admin');
        window.location.href = '/';
        return;
    }
    
    // Mostrar email del usuario
    document.getElementById('user-email').textContent = session.user.email;
    
    // Verificar que la columna descuento_oferta existe en products
    await verificarColumenDescuentoOferta();
    
    // Cargar datos
    cargarProductos();
    cargarOfertas();
    cargarGaleria();
    actualizarStats();
    
    // Configurar navegación de secciones
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const section = link.getAttribute('data-section');
            cambiarSeccion(section);
        });
    });
}

// Iniciar cuando esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
        setTimeout(async () => {
            await initAdmin();
        }, 500);
    });
} else {
    setTimeout(async () => {
        await initAdmin();
    }, 500);
}

// Cambiar sección activa
function cambiarSeccion(section) {
    // Ocultar todas las secciones
    document.querySelectorAll('.admin-section').forEach(sec => {
        sec.classList.remove('active');
    });
    
    // Mostrar la sección seleccionada
    document.getElementById(section).classList.add('active');
    
    // Actualizar nav
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
}

// ========== PRODUCTOS ==========

async function cargarProductos() {
    const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error al cargar productos:', error);
        return;
    }
    
    const tbody = document.getElementById('productos-tbody');
    tbody.innerHTML = '';
    
    data.forEach(producto => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.nombre}</td>
            <td>€${parseFloat(producto.precio).toFixed(2)}</td>
            <td>${producto.categoria}</td>
            <td>${producto.stock}</td>
            <td>
                <button class="btn-editar" onclick="editarProducto(${producto.id})">Editar</button>
                <button class="btn-eliminar" onclick="eliminarProducto(${producto.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function abrirFormularioProducto() {
    productoEditar = null;
    
    // Verificar que los elementos existan antes de manipularlos
    const formularioTitulo = document.getElementById('formulario-titulo');
    const formProducto = document.getElementById('form-producto');
    const formularioProducto = document.getElementById('formulario-producto');
    
    if (!formularioTitulo || !formProducto || !formularioProducto) {
        console.error('Error: Elementos del formulario no encontrados');
        return;
    }
    
    formularioTitulo.textContent = 'Agregar Nuevo Producto';
    formProducto.reset();
    formularioProducto.style.display = 'block';
}

function cerrarFormularioProducto() {
    document.getElementById('formulario-producto').style.display = 'none';
}

async function editarProducto(id) {
    const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    productoEditar = id;
    document.getElementById('formulario-titulo').textContent = 'Editar Producto';
    
    // Proteger acceso a elementos
    const nombre = document.getElementById('prod-nombre');
    const precio = document.getElementById('prod-precio');
    const categoria = document.getElementById('prod-categoria');
    const etiqueta = document.getElementById('prod-etiqueta');
    const descripcion = document.getElementById('prod-descripcion');
    const stock = document.getElementById('prod-stock');
    
    if (!nombre || !precio || !categoria || !etiqueta || !descripcion || !stock) {
        alert('Error: Elementos del formulario no encontrados');
        return;
    }
    
    nombre.value = data.nombre;
    precio.value = data.precio;
    categoria.value = data.categoria;
    etiqueta.value = data.etiqueta || '';
    descripcion.value = data.descripcion || '';
    stock.value = data.stock || 0;
    
    document.getElementById('formulario-producto').style.display = 'block';
}

async function guardarProducto(e) {
    try {
        if (!e || !e.preventDefault) {
            console.error('Evento inválido');
            return;
        }
        e.preventDefault();
        
        // Esperar a que supabase esté listo
        if (!supabaseAdmin) {
            alert('Error: Sistema no inicializado. Por favor recarga la página.');
            return;
        }
        
        console.log('Guardando producto...');
        
        let imagenes = [];
        const archivosImagen = document.getElementById('prod-imagen-file');
        
        if (!archivosImagen) {
            alert('Error: No se encontró el campo de imágenes');
            return;
        }
        
        // Subir todas las imágenes
        if (archivosImagen.files.length > 0) {
            for (let i = 0; i < archivosImagen.files.length; i++) {
                console.log('Subiendo imagen:', archivosImagen.files[i].name);
                const url = await subirImagen(archivosImagen.files[i], 'productos');
                if (url) {
                    imagenes.push(url);
                    console.log('Imagen subida:', url);
                }
            }
        }
        
        // Guardar como string JSON
        const imagenUrl = imagenes.length > 0 ? JSON.stringify(imagenes) : null;
        
        // Obtener elementos con validación
        const nombre = document.getElementById('prod-nombre');
        const precio = document.getElementById('prod-precio');
        const categoria = document.getElementById('prod-categoria');
        const etiqueta = document.getElementById('prod-etiqueta');
        const descripcion = document.getElementById('prod-descripcion');
        const stock = document.getElementById('prod-stock');
        
        console.log('Elementos encontrados:', {nombre, precio, categoria, etiqueta, descripcion, stock});
        
        if (!nombre || !precio || !categoria || !etiqueta || !descripcion || !stock) {
            console.error('Faltan elementos:', {nombre, precio, categoria, etiqueta, descripcion, stock});
            alert('Error: Faltan campos en el formulario');
            return;
        }
        
        const datos = {
            nombre: nombre.value.trim(),
            precio: parseFloat(precio.value),
            categoria: categoria.value,
            etiqueta: etiqueta.value.trim(),
            descripcion: descripcion.value.trim(),
            imagen_url: imagenUrl,
            stock: parseInt(stock.value) || 0
        };
        
        console.log('Datos a guardar:', datos);
        
        if (!datos.nombre) {
            alert('El nombre del producto es obligatorio');
            return;
        }
        
        if (isNaN(datos.precio) || datos.precio <= 0) {
            alert('El precio debe ser un número válido mayor que 0');
            return;
        }
        
        let response;
        
        if (productoEditar) {
            console.log('Actualizando producto:', productoEditar);
            response = await supabaseAdmin
                .from('products')
                .update(datos)
                .eq('id', productoEditar);
        } else {
            console.log('Creando nuevo producto');
            response = await supabaseAdmin
                .from('products')
                .insert([datos]);
        }
        
        if (response.error) {
            console.error('Error de base de datos:', response.error);
            alert('Error: ' + response.error.message);
            return;
        }
        
        console.log('Producto guardado exitosamente');
        cerrarFormularioProducto();
        cargarProductos();
        actualizarStats();
        alert('Producto guardado correctamente');
    } catch (err) {
        console.error('Error inesperado:', err);
        alert('Error inesperado: ' + err.message);
    }
}

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    
    const { error } = await supabaseAdmin
        .from('products')
        .delete()
        .eq('id', id);
    
    if (error) {
        alert('Error: ' + error.message);
        return;
    }
    
    cargarProductos();
    actualizarStats();
    alert('Producto eliminado');
}

// ========== OFERTAS ==========

async function cargarOfertas() {
    const { data, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .gt('descuento_oferta', 0)  // Solo productos con descuento
        .order('created_at', { ascending: false });
    
    if (error) {
        console.error('Error al cargar ofertas:', error);
        return;
    }
    
    const tbody = document.getElementById('ofertas-tbody');
    tbody.innerHTML = '';
    
    if (data.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:20px;">No hay ofertas activas</td></tr>';
        return;
    }
    
    data.forEach(producto => {
        const precioConDescuento = producto.precio * (1 - producto.descuento_oferta / 100);
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${producto.nombre}</td>
            <td>${producto.descuento_oferta}%</td>
            <td>€${producto.precio.toFixed(2)}</td>
            <td>€${precioConDescuento.toFixed(2)}</td>
            <td>
                <button class="btn-editar" onclick="editarOferta(${producto.id})">Editar</button>
                <button class="btn-eliminar" onclick="eliminarOferta(${producto.id})">Eliminar</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

async function cargarProductosEnDropdown() {
    const select = document.getElementById('oferta-producto');
    if (!select) return;
    
    const { data, error } = await supabaseAdmin
        .from('products')
        .select('id, nombre')
        .order('nombre', { ascending: true });
    
    if (error) {
        console.error('Error al cargar productos:', error);
        return;
    }
    
    select.innerHTML = '<option value="">Selecciona un producto</option>';
    data.forEach(producto => {
        const option = document.createElement('option');
        option.value = producto.id;
        option.textContent = producto.nombre;
        select.appendChild(option);
    });
}

function abrirFormularioOferta() {
    ofertaEditar = null;
    
    const tituloEl = document.getElementById('oferta-titulo');
    const formEl = document.getElementById('form-oferta');
    const formularioEl = document.getElementById('formulario-oferta');
    const selectEl = document.getElementById('oferta-producto');
    
    if (!tituloEl || !formEl || !formularioEl || !selectEl) {
        console.error('Error: Elementos del formulario de oferta no encontrados');
        return;
    }
    
    tituloEl.textContent = 'Agregar Oferta a Producto';
    formEl.reset();
    formularioEl.style.display = 'block';
    
    // Cargar productos en el dropdown
    cargarProductosEnDropdown();
}

function cerrarFormularioOferta() {
    document.getElementById('formulario-oferta').style.display = 'none';
}

async function editarOferta(id) {
    // Para editar una oferta, necesitamos obtener el producto asociado
    const { data: productoData, error } = await supabaseAdmin
        .from('products')
        .select('*')
        .eq('descuento_oferta', '>', 0)  // Solo obtener si tiene descuento
        .eq('id', id)
        .single();
    
    if (error || !productoData) {
        // Buscar si el id es del producto directamente
        const { data: prod, error: err } = await supabaseAdmin
            .from('products')
            .select('*')
            .eq('id', id)
            .single();
        
        if (err) {
            console.error('Error:', err);
            return;
        }
        
        ofertaEditar = id;
        document.getElementById('oferta-titulo').textContent = 'Editar Oferta';
        document.getElementById('oferta-producto').value = id;
        document.getElementById('oferta-descuento').value = prod.descuento_oferta || '';
        document.getElementById('formulario-oferta').style.display = 'block';
        cargarProductosEnDropdown();
        return;
    }
    
    ofertaEditar = id;
    document.getElementById('oferta-titulo').textContent = 'Editar Oferta';
    document.getElementById('oferta-producto').value = id;
    document.getElementById('oferta-descuento').value = productoData.descuento_oferta || '';
    document.getElementById('formulario-oferta').style.display = 'block';
    cargarProductosEnDropdown();
}

async function guardarOferta(e) {
    try {
        if (!e || !e.preventDefault) return;
        e.preventDefault();
        
        if (!supabaseAdmin) {
            alert('Error: Sistema no inicializado');
            return;
        }
        
        // Obtener elementos
        const productoSelect = document.getElementById('oferta-producto');
        const descuentoInput = document.getElementById('oferta-descuento');
        
        if (!productoSelect || !descuentoInput) {
            alert('Error: Elementos del formulario no encontrados');
            return;
        }
        
        const productoId = parseInt(productoSelect.value);
        const descuentoPorcentaje = parseInt(descuentoInput.value) || 0;
        
        if (!productoId || descuentoPorcentaje <= 0) {
            alert('Debes seleccionar un producto e indicar un descuento');
            return;
        }
        
        // Actualizar el producto con el descuento
        const { error } = await supabaseAdmin
            .from('products')
            .update({ descuento_oferta: descuentoPorcentaje })
            .eq('id', productoId);
        
        if (error) {
            alert('Error: ' + error.message);
            return;
        }
        
        cerrarFormularioOferta();
        cargarOfertas();
        actualizarStats();
        alert('Oferta agregada correctamente');
    } catch (err) {
        console.error('Error:', err);
        alert('Error inesperado: ' + err.message);
    }
}

async function eliminarOferta(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta oferta?')) return;
    
    // Eliminar el descuento del producto
    const { error } = await supabaseAdmin
        .from('products')
        .update({ descuento_oferta: 0 })
        .eq('id', id);
    
    if (error) {
        alert('Error: ' + error.message);
        return;
    }
    
    cargarOfertas();
    actualizarStats();
    alert('Oferta eliminada');
}

// ========== GALERÍA ==========

async function cargarGaleria() {
    const { data, error } = await supabaseAdmin
        .from('gallery_slides')
        .select('*')
        .order('orden', { ascending: true });
    
    if (error) {
        console.error('Error al cargar galería:', error);
        return;
    }
    
    const grid = document.getElementById('galeria-grid');
    grid.innerHTML = '';
    
    data.forEach(slide => {
        const card = document.createElement('div');
        card.className = 'slide-card';
        card.innerHTML = `
            <img src="${slide.imagen_url || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjUwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjUwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2RkZCIvPjwvc3ZnPg=='}" alt="${slide.titulo}" class="slide-imagen">
            <div class="slide-info">
                <h3>${slide.titulo}</h3>
                <p>${slide.descripcion || ''}</p>
                <div class="slide-actions">
                    <button class="btn-editar" onclick="editarSlide(${slide.id})">Editar</button>
                    <button class="btn-eliminar" onclick="eliminarSlide(${slide.id})">Eliminar</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

function abrirFormularioSlide() {
    slideEditar = null;
    
    const tituloEl = document.getElementById('slide-titulo');
    const formEl = document.getElementById('form-slide');
    const activoEl = document.getElementById('slide-activo');
    const formularioEl = document.getElementById('formulario-slide');
    
    if (!tituloEl || !formEl || !activoEl || !formularioEl) {
        console.error('Error: Elementos del formulario de slide no encontrados');
        return;
    }
    
    slideEditar = null;
    tituloEl.textContent = 'Agregar Nuevo Slide';
    formEl.reset();
    activoEl.checked = true;
    formularioEl.style.display = 'block';
}

function cerrarFormularioSlide() {
    document.getElementById('formulario-slide').style.display = 'none';
}

async function editarSlide(id) {
    const { data, error } = await supabaseAdmin
        .from('gallery_slides')
        .select('*')
        .eq('id', id)
        .single();
    
    if (error) {
        console.error('Error:', error);
        return;
    }
    
    slideEditar = id;
    document.getElementById('slide-titulo').textContent = 'Editar Slide';
    document.getElementById('slide-titulo-input').value = data.titulo;
    document.getElementById('slide-descripcion').value = data.descripcion || '';
    document.getElementById('slide-imagen').value = data.imagen_url || '';
    document.getElementById('slide-orden').value = data.orden || 1;
    document.getElementById('slide-activo').checked = data.activo;
    
    document.getElementById('formulario-slide').style.display = 'block';
}

async function guardarSlide(e) {
    try {
        if (!e || !e.preventDefault) return;
        e.preventDefault();
        
        if (!supabaseAdmin) {
            alert('Error: Sistema no inicializado');
            return;
        }
        
        // Obtener elementos
        const tituloInput = document.getElementById('slide-titulo-input');
        const descripcionInput = document.getElementById('slide-descripcion');
        const imagenInput = document.getElementById('slide-imagen');
        const imagenFileInput = document.getElementById('slide-imagen-file');
        const ordenInput = document.getElementById('slide-orden');
        const activoInput = document.getElementById('slide-activo');
        
        if (!tituloInput || !descripcionInput || !imagenInput || !imagenFileInput || !ordenInput || !activoInput) {
            alert('Error: Elementos del formulario no encontrados');
            return;
        }
        
        let imagenUrl = imagenInput.value;
        const archivoImagen = imagenFileInput.files[0];
        
        // Si hay archivo, subirlo
        if (archivoImagen) {
            imagenUrl = await subirImagen(archivoImagen, 'galeria');
            if (!imagenUrl) return;
        }
        
        const datos = {
            titulo: tituloInput.value.trim(),
            descripcion: descripcionInput.value.trim(),
            imagen_url: imagenUrl || null,
            orden: parseInt(ordenInput.value) || 0,
            activo: activoInput.checked
        };
        
        if (!datos.titulo) {
            alert('El título del slide es obligatorio');
            return;
        }
        
        let response;
        
        if (slideEditar) {
            response = await supabaseAdmin
                .from('gallery_slides')
                .update(datos)
                .eq('id', slideEditar);
        } else {
            response = await supabaseAdmin
                .from('gallery_slides')
                .insert([datos]);
        }
        
        if (response.error) {
            alert('Error: ' + response.error.message);
            return;
        }
        
        cerrarFormularioSlide();
        cargarGaleria();
        actualizarStats();
        alert('Slide guardado correctamente');
    } catch (err) {
        console.error('Error:', err);
        alert('Error inesperado: ' + err.message);
    }
}

async function eliminarSlide(id) {
    if (!confirm('¿Estás seguro de que quieres eliminar este slide?')) return;
    
    const { error } = await supabaseAdmin
        .from('gallery_slides')
        .delete()
        .eq('id', id);
    
    if (error) {
        alert('Error: ' + error.message);
        return;
    }
    
    cargarGaleria();
    actualizarStats();
    alert('Slide eliminado');
}

// ========== STATS ==========

async function actualizarStats() {
    const { count: countProductos } = await supabaseAdmin
        .from('products')
        .select('*', { count: 'exact' });
    
    const { count: countOfertas } = await supabaseAdmin
        .from('offers')
        .select('*', { count: 'exact' });
    
    const { count: countGaleria } = await supabaseAdmin
        .from('gallery_slides')
        .select('*', { count: 'exact' });
    
    document.getElementById('stat-productos').textContent = countProductos || 0;
    document.getElementById('stat-ofertas').textContent = countOfertas || 0;
    document.getElementById('stat-galeria').textContent = countGaleria || 0;
}
