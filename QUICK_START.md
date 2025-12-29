# 🚀 Guía Rápida: Nuevo Sistema de Ofertas

## ⚡ PASOS RÁPIDOS (5 minutos)

### 1️⃣ Ejecutar SQL en Supabase
```
Ir a: https://supabase.com → Tu proyecto → SQL Editor
Copiar y ejecutar esto:

ALTER TABLE products ADD COLUMN descuento_oferta INTEGER DEFAULT 0;
CREATE INDEX idx_products_descuento_oferta ON products(descuento_oferta);
```

### 2️⃣ Refrescar el navegador
```
F5 o Cmd+R
```

### 3️⃣ Ir a Admin Panel
```
http://localhost:8001/admin.html
```

### 4️⃣ Crear una oferta
```
Sección OFERTAS → "+ Nueva Oferta"
1. Seleccionar producto
2. Escribir descuento (ej: 20)
3. Click "Guardar Oferta"
```

### 5️⃣ Ver cambios en la web
```
Ir a http://localhost:8001/
- Sección "OFERTAS" muestra el producto
- Badge rojo -20% visible
- Precio original tachado
- Precio con descuento en dorado
```

---

## 📋 CHECKLIST DE FUNCIONALIDAD

- [ ] Columna `descuento_oferta` existe en DB
- [ ] Admin panel carga sin errores
- [ ] Dropdown de productos lleno en formulario
- [ ] Puedo crear una oferta
- [ ] La oferta aparece en tabla "Ofertas Activas"
- [ ] Aparece badge -XX% en productos
- [ ] Precio descuento se calcula correctamente
- [ ] Precio original está tachado
- [ ] Funciona en todas las categorías
- [ ] Funciona en página de detalle
- [ ] Puedo editar el descuento
- [ ] Puedo eliminar la oferta

---

## 🎯 CASOS DE USO COMUNES

### Caso 1: Black Friday
```
Quiero: Descuentos grandes en varios productos
Hacer:
  1. Admin → "+ Nueva Oferta" × 5
  2. Seleccionar 5 productos
  3. Poner descuento 40%
  4. Guardar
  ✅ Listos 5 productos en 5 minutos
```

### Caso 2: Liquidación de Categoría
```
Quiero: Todo lo de Anillos con 30% descuento
Hacer:
  1. Listar productos de Anillos
  2. Para cada uno: "+ Nueva Oferta"
  3. Seleccionar producto
  4. Descuento 30%
  5. Guardar × N
  ✅ Todos los anillos con descuento
```

### Caso 3: Promoción Flash
```
Quiero: Descuento hoy, sin descuento mañana
Hacer:
  1. Crear oferta (20% descuento)
  2. Producto aparece en web al instante
  3. Mañana: Click "Eliminar" en admin
  4. Descuento desaparece instantáneamente
  ✅ Sin complicaciones
```

---

## 🔍 VERIFICACIÓN VISUAL

### En Admin Panel Debe Verse

```
SECCIÓN OFERTAS:

┌─────────────────────────────────────────┐
│ [+ Nueva Oferta]                        │
├─────────────────────────────────────────┤
│ OFERTAS ACTIVAS                         │
├──────────────┬──────┬────────┬──────────┤
│ Producto     │ Desc │ Original│ Descuento│
├──────────────┼──────┼────────┼──────────┤
│ [Producto]   │ XX%  │ $XXX   │ $XXX    │
│ [Editar] [Eliminar]                    │
└─────────────────────────────────────────┘
```

### En Web Debe Verse

**Sección OFERTAS (inicio):**
```
┌──────────────┬──────────────┐
│   -20%       │   -15%       │
│              │              │
│  IMAGEN 1    │   IMAGEN 2   │
│ Producto 1   │  Producto 2  │
│~~$100~~ $80  │ ~~$200~~ $170│
│[Ver Producto]│ [Ver Producto]│
└──────────────┴──────────────┘
```

**Listado de Productos:**
```
┌──────────────┐  ┌──────────────┐
│              │  │   -20%       │ ← Badge visible
│  IMAGEN      │  │   IMAGEN     │
│  Producto 1  │  │ Producto c/o │
│   $100       │  │ ~~$100~~ $80 │
└──────────────┘  └──────────────┘
```

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Dónde se ve el descuento?**
```
R: En todas partes:
   - Sección OFERTAS en inicio
   - Listado de productos
   - Categorías (Anillos, Collares, etc)
   - Página detalle del producto
```

**P: ¿El descuento se aplica en carrito?**
```
R: Por ahora se muestra el precio calculado.
   El carrito guarda el precio que se mostró.
```

**P: ¿Puedo cambiar el descuento después?**
```
R: Sí, click "Editar" en admin, cambiar % y guardar.
   Cambia automáticamente en toda la web.
```

**P: ¿Cuál es el descuento máximo?**
```
R: 99% (pero recomendado máximo 70%).
```

**P: ¿Puedo tener múltiples descuentos en un producto?**
```
R: No, un producto tiene un descuento. 
   Si quieres cambiar, edita el existente.
```

**P: ¿Si elimino la oferta, se pierde el producto?**
```
R: No, el producto sigue existiendo.
   Solo se quita el descuento (descuento_oferta = 0).
```

---

## 🛠️ TROUBLESHOOTING

### Problema: "El dropdown de productos está vacío"
```
Solución:
1. Verifica que tengas productos creados
2. Recarga la página (F5)
3. Revisa la consola (F12 → Console) para errores
```

### Problema: "El badge no se ve en los productos"
```
Solución:
1. Verifica que creaste la oferta (está en tabla)
2. Recarga la página (F5)
3. Comprueba que el descuento > 0
```

### Problema: "El precio calculado es incorrecto"
```
Solución:
Fórmula: Precio Con Descuento = Precio × (1 - %/100)
Ejemplo: $100 × (1 - 20/100) = $100 × 0.8 = $80
Verifica que el % sea correcto en admin
```

### Problema: "Error al guardar oferta"
```
Solución:
1. Asegúrate de estar logueado como admin
2. Selecciona un producto (no dejes vacío)
3. Escribe un número en descuento (1-99)
4. Revisa F12 → Console para mensajes de error
```

---

## 📞 SOPORTE TÉCNICO

**Archivo SQL a ejecutar**: `schema-migration.sql`
**Documentación completa**: `SISTEMA_OFERTAS.md`
**Comparativa**: `COMPARATIVA_ANTES_DESPUES.md`

---

## ✅ ¡LISTO!

El sistema de ofertas está 100% funcional.

**Próximos pasos opcionales:**
- Agregar vigencia de oferta (fecha de expiración)
- Crear ofertas automáticas por categoría
- Analytics de descuentos más efectivos
- Sistema de cupones complementario

¡Que disfrutes! 🎉
