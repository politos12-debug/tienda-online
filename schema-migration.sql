-- ============================================
-- SCRIPT SQL PARA NUEVA ESTRUCTURA DE OFERTAS
-- ============================================
-- Ejecuta estos comandos en tu consola Supabase SQL

-- 1. Agregar columna descuento_oferta a la tabla products
ALTER TABLE products ADD COLUMN descuento_oferta INTEGER DEFAULT 0;

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX idx_products_descuento_oferta ON products(descuento_oferta);

-- ¡Listo! 
-- Ya puedes usar el nuevo sistema de ofertas.
-- Los productos ahora tienen directamente el campo descuento_oferta

-- OPCIONAL: Si tienes datos en la tabla "offers" que quieras migrar:
-- (Solo si tu tabla offers tiene la estructura: id, product_id, descuento)
-- UPDATE products p
-- SET descuento_oferta = o.descuento
-- FROM offers o
-- WHERE p.id = o.product_id AND o.descuento > 0;
