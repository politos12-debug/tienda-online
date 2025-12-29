# Instrucciones de Migración - Sistema de Ofertas

## Descripción del Cambio
El sistema de ofertas ha sido rediseñado para vincular descuentos directamente a los productos existentes, en lugar de tener una tabla separada de ofertas.

## Cambios en la Base de Datos

### 1. Agregar columna a tabla `products`
Ejecuta el siguiente SQL en tu consola de Supabase:

```sql
-- Agregar columna descuento_oferta a la tabla products
ALTER TABLE products ADD COLUMN descuento_oferta INTEGER DEFAULT 0;

-- Crear un índice para búsquedas rápidas
CREATE INDEX idx_products_descuento_oferta ON products(descuento_oferta);
```

### 2. (Opcional) Migrar datos de la tabla `offers` si existen
Si tenías ofertas en la tabla `offers`, puedes migrar los datos:

```sql
-- Esta consulta asume que tu tabla offers tiene un campo product_id
-- Si no lo tiene, necesitarás crear una relación diferente
UPDATE products p
SET descuento_oferta = o.descuento
FROM offers o
WHERE p.id = o.product_id AND o.descuento > 0;
```

## Cambios en el Frontend

### Interfaz de Admin (`admin.html`)
- ✅ Formulario de ofertas rediseñado
- ✅ Ahora solo tiene: Selector de Producto + Descuento (%)
- ✅ Tabla actualizada para mostrar: Producto, Descuento, Precio Original, Precio con Descuento

### Funciones JavaScript Actualizadas

#### `js/admin.js`
- ✅ `abrirFormularioOferta()` - Ahora carga lista de productos
- ✅ `guardarOferta()` - Guarda el descuento directamente en el producto
- ✅ `cargarOfertas()` - Lee productos con descuento_oferta > 0
- ✅ `eliminarOferta()` - Establece descuento_oferta = 0
- ✅ `cargarProductosEnDropdown()` - Carga productos para selector

#### `js/script.js`
- ✅ `cargarOfertasWeb()` - Muestra productos con descuento en la sección de ofertas
- ✅ `cargarProductosWeb()` - Agrega badge de descuento a productos
- ✅ Badge rojo en tarjetas de productos con oferta

#### `js/product-detail.js`
- ✅ Muestra precio original tachado + precio con descuento
- ✅ Badge de descuento en la galería de imágenes

#### `js/categorias.js`
- ✅ Muestra badges de descuento en listado de categorías
- ✅ Calcula y muestra precio con descuento

### Cambios CSS
- ✅ `.oferta-badge` - Estilo para badges redondos en rojo
- ✅ Aplicado en: `styles.css`, `categorias.css`, `product-detail.css`

## Cómo Usar el Nuevo Sistema

### Crear una Oferta
1. Ir a Panel Admin → Ofertas
2. Click en "+ Nueva Oferta"
3. Seleccionar producto del dropdown
4. Introducir porcentaje de descuento
5. Click en "Guardar Oferta"
6. El producto aparecerá:
   - En la sección "Ofertas" del inicio
   - Con badge rojo de descuento en todos los listados
   - Con precio original tachado en detalle

### Editar una Oferta
1. Click en "Editar" al lado de la oferta
2. Cambiar el descuento
3. Guardar

### Eliminar una Oferta
1. Click en "Eliminar" al lado de la oferta
2. Se quitará el descuento del producto

## Migración Completada ✅
Todos los archivos han sido actualizados. Solo necesitas:
1. Ejecutar el SQL en Supabase
2. Refrescar el navegador
3. Las ofertas ahora están vinculadas a productos
