# Sistema de Ofertas Rediseñado ✨

## Vista General
El sistema de ofertas ha sido completamente rediseñado para **vincular descuentos directamente a los productos existentes** en lugar de tener ofertas como entidades separadas.

## Cambios Implementados

### 1. Admin Panel (`admin.html` + `js/admin.js`)

#### Antes ❌
- Formulario complejo con: Título, Descuento, Descripción, Imagen, Vigencia
- Tabla separada de ofertas sin relación con productos

#### Ahora ✅
- Formulario simple: **Seleccionar Producto + Porcentaje**
- Tabla actualizada con: Producto | Descuento | Precio Original | Precio con Descuento
- Resultado: Un producto puede tener descuento directamente

#### Flujo de Uso
```
1. Click "+ Nueva Oferta"
2. Seleccionar producto del dropdown
3. Indicar % descuento
4. Guardar
→ Producto aparece con descuento en toda la tienda
```

---

### 2. Página Principal (`js/script.js`)

#### Sección de Ofertas
- Ahora muestra **productos con descuento activo**
- Cada tarjeta incluye:
  - 🔴 Badge rojo con `-XX%`
  - ~~Precio original~~ tachado
  - **Precio con descuento en dorado**
  - Botón "Ver Producto"

#### Listado de Productos
- Todos los productos muestran badge rojo si tienen descuento
- Precio mostrado: `$XX.XX` (sin descuento) o `~~$XX.XX~~ $YY.YY` (con descuento)

---

### 3. Detalle de Producto (`js/product-detail.js`)

#### Visualización
- Badge `-XX%` en **esquina superior derecha de la galería**
- Precio con descuento:
  - ~~$100~~ $80 (ejemplo)
  - Badge rojo `-20%`
- Todo claramente visible en la sección de precios

---

### 4. Categorías (`js/categorias.js`)

#### Actualización
- Cards de productos muestran badge de descuento
- Precio se actualiza automáticamente en cada categoría
- Anillos, Collares, Pendientes, Pulseras con ofertas destacadas

---

## Base de Datos

### Cambio Principal
```
Tabla: products
Nueva columna: descuento_oferta (INTEGER DEFAULT 0)
```

### Valores
- `0` = Sin descuento
- `1-99` = Porcentaje de descuento

### Índice
```sql
CREATE INDEX idx_products_descuento_oferta ON products(descuento_oferta);
```

---

## Ejemplos Visuales

### Producto Con Oferta
```
┌─────────────────────┐
│  -20%               │  ← Badge rojo
├─────────────────────┤
│                     │
│    [IMAGEN]         │
│                     │
├─────────────────────┤
│ Anillo de Oro       │
│ Description...      │
│ ~~$100~~ $80 -20%   │  ← Precio con descuento
│ [Ver Detalle][Carrito]
└─────────────────────┘
```

### Admin Panel
```
┌──────────────────────────────────────────┐
│ + Nueva Oferta                           │
├──────────────────────────────────────────┤
│ OFERTAS ACTIVAS                          │
├────────────┬──────┬────────┬────────────┤
│ Producto   │ Desc │ Original│ Con Dscto │
├────────────┼──────┼────────┼────────────┤
│ Anillo Oro │ 20%  │ $100   │ $80      │ │ [Edit][Del]
│ Collar Plata│15%  │ $150   │ $127.50  │ │ [Edit][Del]
└────────────┴──────┴────────┴────────────┘
```

---

## Funciones Clave

### Admin Panel
| Función | Descripción |
|---------|------------|
| `abrirFormularioOferta()` | Abre formulario con dropdown de productos |
| `guardarOferta(e)` | Guarda descuento en el producto |
| `cargarOfertas()` | Carga productos con descuento > 0 |
| `eliminarOferta(id)` | Establece descuento = 0 |
| `cargarProductosEnDropdown()` | Llena dropdown con productos |

### Frontend
| Función | Descripción |
|---------|------------|
| `cargarOfertasWeb()` | Muestra sección de ofertas en inicio |
| `cargarProductosWeb()` | Agrega badges a productos |

---

## Cambios de Estilos

### CSS Nuevo
```css
.oferta-badge {
    /* Badge rojo circular con descuento % */
    background: linear-gradient(135deg, #ff4444, #cc0000);
    color: white;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    position: absolute;
    top: 20px;
    right: 20px;
    z-index: 10;
}
```

**Aplicado en:**
- `styles.css` (productos en inicio)
- `categorias.css` (listados de categorías)
- `product-detail.css` (detalle de producto)

---

## Flujo de Datos Completo

```
[Admin Panel]
     ↓
   (selecciona producto + %)
     ↓
[guardarOferta() actualiza DB]
     ↓
products.descuento_oferta = XX
     ↓
[Frontend carga productos]
     ↓
¿descuento_oferta > 0?
  ├─ YES → Mostrar badge + precio descuento
  └─ NO → Mostrar precio normal
```

---

## Testing Recomendado

1. **Crear una oferta**
   - Admin → Nuevaerta
   - Seleccionar producto
   - Guardar descuento 20%
   - ✅ Verificar badge en todas las páginas

2. **Ver precio descuento**
   - Inicio: Sección Ofertas
   - Categoría: Badge visible
   - Detalle: Precio y badge claros

3. **Editar oferta**
   - Cambiar % descuento
   - ✅ Se actualiza en todos lados

4. **Eliminar oferta**
   - Click eliminar
   - ✅ Descuento se quita en todas partes

---

## Notas Importantes ⚠️

- La tabla `offers` **NO se elimina** (por compatibilidad)
- Pero **NO se usa** en el nuevo sistema
- Si necesitas datos antiguos, están en `offers`
- El nuevo sistema usa solo `products.descuento_oferta`

---

## Próximos Pasos Opcionales

1. **Vigencia de ofertas**: Agregar fecha de expiración
2. **Ofertas automáticas**: Por categoría o cantidad
3. **Analytics**: Ver qué productos tienen más descuentos
4. **Notificaciones**: Alertar cuando una oferta expira
