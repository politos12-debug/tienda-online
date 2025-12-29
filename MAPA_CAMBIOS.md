# 🗺️ MAPA DE CAMBIOS - Dónde Ver Cada Cosa

## 🏠 PÁGINA PRINCIPAL (/)

### Sección OFERTAS (Nueva visualización)
```
Ubicación: Debajo de "PRODUCTOS DESTACADOS"
Antes: Mostraba ofertas con título y descripción
Ahora: Muestra productos reales con descuento

Ver: 
┌──────────────┐  ┌──────────────┐
│   -20%       │  │   -15%       │
│              │  │              │
│  IMAGEN      │  │   IMAGEN     │
│ Anillo Oro   │  │ Collar Plata │
│ ~~$100~~ $80 │  │~~$150~~ $127.50│
│ [Ver Producto]│  │ [Ver Producto]│
└──────────────┘  └──────────────┘
```

### Listado de Productos (Con badges)
```
Ubicación: Sección "PRODUCTOS DESTACADOS"
Cambio: Productos con descuento muestran badge rojo

Buscar:
- Badge circular rojo "-XX%" en esquina superior derecha
- Precio en formato: ~~$100~~ $80
- Botón "Ver Detalle" funciona igual
```

---

## 👤 PANEL ADMIN (/admin.html)

### Sección OFERTAS

#### Formulario Nueva Oferta
```
Antes:
┌──────────────────────────────┐
│ Título: [______________]     │  ❌ REMOVIDO
│ Descuento: [__]%             │  ✅ MANTIENE
│ Descripción: [__________]    │  ❌ REMOVIDO
│ Imagen: [Choose File]        │  ❌ REMOVIDO
│ Vigencia: [YYYY-MM-DD]       │  ❌ REMOVIDO
└──────────────────────────────┘

Ahora:
┌──────────────────────────────┐
│ Producto: [▼ Seleccionar]    │  ✅ NUEVO
│ Descuento: [__]%             │  ✅ MANTIENE
└──────────────────────────────┘

Cambio: -60% campos | +100% claridad
```

#### Tabla de Ofertas
```
Antes:
┌────────────┬─────┬──────────┬─────────┐
│ Título     │ Desc│ Vigencia │ Acciones│
├────────────┼─────┼──────────┼─────────┤
│ "Oferta 1" │ 20% │2025-01-31│[E][D]  │
└────────────┴─────┴──────────┴─────────┘

Ahora:
┌──────────────┬──────┬────────┬──────────┐
│ Producto     │ Desc │ Original│ Descuento│
├──────────────┼──────┼────────┼──────────┤
│ Anillo Oro   │ 20%  │ $100   │ $80     │
│ [Editar] [Eliminar]                   │
└──────────────┴──────┴────────┴──────────┘

Cambio: Muestra producto real + cálculos
```

---

## 📦 PÁGINA DE DETALLE DE PRODUCTO (/product-detail.html)

### Galería de Imágenes
```
Cambio: Agregar badge de descuento

ANTES:
┌──────────────┐
│              │
│   IMAGEN     │
│              │
└──────────────┘

AHORA:
┌──────────────┐
│  -20% ← BADGE│
│              │
│   IMAGEN     │
│              │
└──────────────┘
```

### Sección de Precio
```
ANTES:
$100

AHORA:
~~$100~~ $80 -20%
(original tachado + nuevo precio + badge)

Ubicación: Debajo del nombre del producto
Colores: Precio original gris, nuevo precio dorado
```

---

## 🏷️ PÁGINA DE CATEGORÍAS (/categorias.html)

### Tarjetas de Productos
```
Cada producto puede mostrar:

CON DESCUENTO:
┌────────────────┐
│    -20%   ← Badge rojo
│ [IMAGEN]       │
│ Nombre         │
│ Descripción    │
│~~$100~~ $80 ← Precio actualizado
│ [Botones]      │
└────────────────┘

SIN DESCUENTO:
┌────────────────┐
│    
│ [IMAGEN]       │
│ Nombre         │
│ Descripción    │
│ $100           │
│ [Botones]      │
└────────────────┘

Todas las categorías afectadas:
- Anillos
- Collares
- Pendientes
- Pulseras
```

---

## 🎨 ELEMENTOS VISUALES NUEVOS

### Badge de Descuento
```
┌─────────┐
│  -XX%   │  Círculo rojo
├─────────┤  Texto blanco
│ Ubicación: Top-right
│ Tamaño: 50x50px
│ Gradiente: rojo → rojo oscuro
│ Visible: Todas las páginas
└─────────┘
```

### Precio con Descuento
```
Formato:    ~~$100~~ $80 -20%
Original:   Tachado (strikethrough)
Descuento:  Dorado (#d4af37), bold
Badge:      Rojo pequeño
```

---

## 📍 BÚSQUEDA RÁPIDA POR FEATURE

### "Quiero ver dónde está el badge"
```
1. Ir a /
2. Buscar sección "OFERTAS"
3. Badge visible en cada tarjeta
4. O buscar en cualquier categoría
```

### "Quiero ver el precio descuento"
```
1. /admin.html → Sección OFERTAS → Tabla
   Ver columna "Precio con Descuento"
2. / → Cualquier producto con oferta
   Precio en formato ~~$100~~ $80
3. /product-detail.html?id=X
   Debajo del nombre, sección precios
```

### "Quiero ver el formulario nuevo"
```
1. /admin.html
2. Sección OFERTAS
3. Click "+ Nueva Oferta"
4. Ver solo 2 campos: Producto + Descuento
```

### "Quiero ver productos sin descuento"
```
1. / → Sección "PRODUCTOS DESTACADOS"
2. Productos sin badge rojo
3. Precio normal sin tachado
```

---

## 🔍 CAMBIOS POR PÁGINA

### index.html
```
NO CAMBIA la estructura HTML
SÍ CAMBIA el contenido via JavaScript:
- cargarOfertasWeb() actualiza .ofertas-grid
- cargarProductosWeb() agrega badges
```

### admin.html
```
CAMBIOS VISIBLES:
1. Formulario ofertas (menos campos)
2. Tabla ofertas (diferentes columnas)
3. Dropdown de productos (nuevo)

CAMBIOS NO VISIBLES:
- IDs de inputs actualizados
- HTML más limpio
```

### product-detail.html
```
CAMBIOS VISIBLES:
1. Badge en galería de imágenes
2. Precio con descuento claro

CAMBIOS NO VISIBLES:
- Nuevo div #oferta-badge-container
- JavaScript renderiza el badge
```

### categorias.html
```
CAMBIOS NO VISIBLES (solo funcionalidad):
- JavaScript detecta descuento_oferta
- Renderiza badge en cada tarjeta
- Calcula precio automáticamente
```

---

## 🔊 CAMBIOS AUDIBLES/INTERACTIVOS

### Crear Oferta
```
Admin hace:
1. Click "+ Nueva Oferta"
2. Selecciona producto en dropdown
3. Escribe descuento
4. Click "Guardar"

Resultado:
- Aparece en tabla OFERTAS ACTIVAS
- Badge aparece en web inmediatamente
- Precio se recalcula en toda la tienda
```

### Editar Oferta
```
Admin hace:
1. Click "Editar" en tabla
2. Dropdown mantiene producto
3. Cambia descuento a nuevo valor
4. Click "Guardar"

Resultado:
- Tabla se actualiza
- Web muestra nuevo descuento
- Precios recalculados
```

### Eliminar Oferta
```
Admin hace:
1. Click "Eliminar" en tabla
2. Confirma eliminación

Resultado:
- Fila desaparece de tabla
- Badge desaparece de web
- Producto sigue existiendo
- Precio vuelve a normal
```

---

## ✨ RESUMO DE CAMBIOS VISUALES

```
┌─ INDEX.HTML ─────────────────────┐
│ Sección OFERTAS: Muestra productos│
│ con badges y precios descuento   │
└──────────────────────────────────┘
         ↑
         │ Alimentado por
         │
┌─ ADMIN.HTML ─────────────────────┐
│ Formulario: 2 campos (producto+%) │
│ Tabla: producto|desc|precio|dscto │
└──────────────────────────────────┘
         │ Actualiza
         ↓
┌─ PRODUCT-DETAIL.HTML ────────────┐
│ Badge: -XX% en galería           │
│ Precio: ~~$100~~ $80            │
└──────────────────────────────────┘
         ↑
         │ Y también afecta
         │
┌─ CATEGORIAS.HTML ────────────────┐
│ Badges en tarjetas               │
│ Precios actualizados             │
└──────────────────────────────────┘
```

---

## 🎯 ANTES Y DESPUÉS VISUAL

### Antes
```
Admin Panel          Web
┌─────────────┐     ┌──────────┐
│Ofertas (sep)│────→│¿Qué desc?│
├─────────────┤     ├──────────┤
│Productos    │─────│Productos │
│(sin desc)   │     │(sin badges
└─────────────┘     └──────────┘
```

### Ahora
```
Admin Panel          Web
┌─────────────┐     ┌──────────┐
│Producto +   │────→│Badge -XX%│
│Desc linked  │     │Precio ~~$│
├─────────────┤     ├──────────┤
│Vinculado    │────→│Todo claro│
│Sincronizado │     │Inmediato │
└─────────────┘     └──────────┘
```

---

## 📋 COSAS QUE NO CAMBIAN VISUALMENTE

```
✅ Header/Navegación
✅ Footer
✅ Colores principales
✅ Tipografía
✅ Tamaño de páginas
✅ Responsive design
✅ Funcionalidad de carrito
✅ Checkout
✅ Categorías
✅ Búsqueda (si existe)
✅ Autenticación admin
```

---

## 🎨 ELEMENTOS NUEVOS EN CSS

```
.oferta-badge {
    /* Badge rojo circular */
    background: linear-gradient(135deg, #ff4444, #cc0000);
    color: white;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
    font-size: 0.85rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 8px rgba(255, 0, 0, 0.3);
}
```

---

**¡Eso es todo! El sistema está completamente integrado y visible en toda la tienda.** ✨
