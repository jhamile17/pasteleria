const express = require('express');
const router = express.Router();
const db = require('../db'); // Pool de PostgreSQL

// Helper para detectar si la petición espera JSON
function isJson(req) {
  return req.is('application/json') || req.headers.accept?.includes('application/json');
}

// ✅ LISTAR PRODUCTOS
router.get('/', async (req, res) => {
  try {
    const { rows: productos } = await db.query(`
      SELECT p.id, p.nombre, p.precio, c.nombre AS categoria,
             (SELECT i.url FROM imagenes_productos i WHERE i.producto_id = p.id LIMIT 1) AS imagen
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id ASC
    `);

    if (isJson(req)) {
      return res.status(200).json({
        mensaje: 'Lista de productos obtenida correctamente',
        productos,
      });
    }

    // Renderiza vista EJS
    res.render('productos/indexp', { productos, categorias: [], categoriaId: null, mensaje: req.query.mensaje || null, error: req.query.error || null });
  } catch (err) {
    console.error('❌ Error al listar productos:', err.message);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/productos?error=Error cargando productos');
  }
});

// ✅ CREAR PRODUCTO
router.post('/', async (req, res) => {
  try {
    const { nombre, precio, categoria_id } = req.body;

    if (!nombre || !precio || !categoria_id) {
      const errorMsg = 'Todos los campos son obligatorios';
      if (isJson(req)) return res.status(400).json({ error: errorMsg });
      return res.redirect(`/productos?error=${encodeURIComponent(errorMsg)}`);
    }

    const { rowCount: categoriaExists } = await db.query('SELECT id FROM categorias WHERE id = $1', [categoria_id]);
    if (categoriaExists === 0) {
      const errorMsg = 'La categoría seleccionada no existe';
      if (isJson(req)) return res.status(400).json({ error: errorMsg });
      return res.redirect(`/productos?error=${encodeURIComponent(errorMsg)}`);
    }

    await db.query(
      'INSERT INTO productos (nombre, precio, categoria_id) VALUES ($1, $2, $3)',
      [nombre.trim(), precio, categoria_id]
    );

    const mensaje = 'Producto creado correctamente';
    if (isJson(req)) return res.status(201).json({ mensaje });
    res.redirect(`/productos?mensaje=${encodeURIComponent(mensaje)}`);
  } catch (err) {
    console.error('❌ Error al crear producto:', err.message);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/productos?error=Error al crear producto');
  }
});

// ✅ DETALLE DE PRODUCTO
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: productos } = await db.query(
      `SELECT p.id, p.nombre, p.precio, c.nombre AS categoria
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (productos.length === 0) {
      const errorMsg = 'Producto no encontrado';
      if (isJson(req)) return res.status(404).json({ error: errorMsg });
      return res.redirect(`/productos?error=${encodeURIComponent(errorMsg)}`);
    }

    if (isJson(req)) return res.status(200).json({ mensaje: 'Detalle de producto obtenido', producto: productos[0] });
    res.render('productos/detail', { producto: productos[0], mensaje: null, error: null });
  } catch (err) {
    console.error('❌ Error al obtener producto:', err.message);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/productos?error=Error al obtener producto');
  }
});

// ✅ ACTUALIZAR PRODUCTO
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, categoria_id } = req.body;

    const { rows: productoCheck } = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (productoCheck.length === 0) {
      const errorMsg = 'Producto no encontrado';
      if (isJson(req)) return res.status(404).json({ error: errorMsg });
      return res.redirect(`/productos?error=${encodeURIComponent(errorMsg)}`);
    }

    await db.query(
      'UPDATE productos SET nombre = $1, precio = $2, categoria_id = $3 WHERE id = $4',
      [nombre.trim(), precio, categoria_id, id]
    );

    const mensaje = 'Producto actualizado correctamente';
    if (isJson(req)) return res.status(200).json({ mensaje });
    res.redirect(`/productos?mensaje=${encodeURIComponent(mensaje)}`);
  } catch (err) {
    console.error('❌ Error al actualizar producto:', err.message);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/productos?error=Error al actualizar producto');
  }
});

// ✅ ELIMINAR PRODUCTO
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: productoCheck } = await db.query('SELECT * FROM productos WHERE id = $1', [id]);

    if (productoCheck.length === 0) {
      const errorMsg = 'Producto no encontrado';
      if (isJson(req)) return res.status(404).json({ error: errorMsg });
      return res.redirect(`/productos?error=${encodeURIComponent(errorMsg)}`);
    }

    await db.query('DELETE FROM productos WHERE id = $1', [id]);
    const mensaje = 'Producto eliminado correctamente';
    if (isJson(req)) return res.status(200).json({ mensaje });
    res.redirect(`/productos?mensaje=${encodeURIComponent(mensaje)}`);
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err.message);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/productos?error=Error al eliminar producto');
  }
});

module.exports = router;
