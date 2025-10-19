const express = require('express');
const router = express.Router();
const db = require('../db'); // Pool de PostgreSQL
const methodOverride = require('method-override');

router.use(methodOverride('_method')); // Para soportar PUT/DELETE desde formularios

// Helper para detectar JSON
const isJson = (req) => req.is('application/json') || req.headers.accept?.includes('application/json');

// =======================
// GET - Formulario Crear Producto
// =======================
router.get('/nuevop', async (req, res) => {
  try {
    const { rows: categorias } = await db.query('SELECT * FROM categorias ORDER BY id ASC');
    res.render('productos/nuevop', { categorias, mensaje: req.query.mensaje, error: req.query.error });
  } catch (err) {
    console.error('❌ Error cargando formulario:', err.message);
    res.redirect('/productos?error=Error cargando formulario');
  }
});

// =======================
// GET - Formulario Editar Producto
// =======================
router.get('/editar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: producto } = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (producto.length === 0) return res.redirect('/productos?error=Producto no encontrado');

    const { rows: categorias } = await db.query('SELECT * FROM categorias ORDER BY id ASC');
    res.render('productos/editp', { producto: producto[0], categorias, mensaje: req.query.mensaje, error: req.query.error });
  } catch (err) {
    console.error('❌ Error cargando formulario de edición:', err.message);
    res.redirect('/productos?error=Error cargando formulario de edición');
  }
});

// =======================
// GET - Listar Productos
// =======================
router.get('/', async (req, res) => {
  try {
    const { rows: productos } = await db.query(`
      SELECT p.id, p.nombre, p.precio, c.nombre AS categoria,
             (SELECT i.url FROM imagenes_productos i WHERE i.producto_id = p.id LIMIT 1) AS imagen
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id ASC
    `);

    if (isJson(req)) return res.status(200).json({ mensaje: 'Lista de productos obtenida', productos });
    res.render('productos/indexp', { productos, mensaje: req.query.mensaje, error: req.query.error });
  } catch (err) {
    console.error('❌ Error al listar productos:', err.message);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/productos?error=Error cargando productos');
  }
});

// =======================
// POST - Crear Producto
// =======================
router.post('/', async (req, res) => {
  try {
    const { nombre, precio, categoria_id } = req.body;
    if (!nombre || !precio || !categoria_id) {
      const msg = 'Todos los campos son obligatorios';
      if (isJson(req)) return res.status(400).json({ error: msg });
      return res.redirect(`/productos?error=${encodeURIComponent(msg)}`);
    }

    const { rows: categoria } = await db.query('SELECT id FROM categorias WHERE id = $1', [categoria_id]);
    if (categoria.length === 0) {
      const msg = 'La categoría seleccionada no existe';
      if (isJson(req)) return res.status(400).json({ error: msg });
      return res.redirect(`/productos?error=${encodeURIComponent(msg)}`);
    }

    await db.query('INSERT INTO productos (nombre, precio, categoria_id) VALUES ($1, $2, $3)', [nombre, precio, categoria_id]);

    const msg = 'Producto creado correctamente';
    if (isJson(req)) return res.status(201).json({ mensaje: msg });
    res.redirect(`/productos?mensaje=${encodeURIComponent(msg)}`);
  } catch (err) {
    console.error('❌ Error al crear producto:', err.message);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/productos?error=Error al crear producto');
  }
});

// =======================
// GET - Detalle Producto
// =======================
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: producto } = await db.query(`
      SELECT p.id, p.nombre, p.precio, c.nombre AS categoria
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (producto.length === 0) {
      if (isJson(req)) return res.status(404).json({ error: 'Producto no encontrado' });
      return res.redirect('/productos?error=Producto no encontrado');
    }

    if (isJson(req)) return res.status(200).json({ mensaje: 'Detalle de producto obtenido', producto: producto[0] });
    res.render('productos/showp', { producto: producto[0] });
  } catch (err) {
    console.error('❌ Error al obtener producto:', err.message);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/productos?error=Error al obtener producto');
  }
});

// =======================
// PUT - Actualizar Producto
// =======================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, categoria_id } = req.body;
  try {
    const { rows: productoCheck } = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (productoCheck.length === 0) {
      if (isJson(req)) return res.status(404).json({ error: 'Producto no encontrado' });
      return res.redirect('/productos?error=Producto no encontrado');
    }

    await db.query('UPDATE productos SET nombre = $1, precio = $2, categoria_id = $3 WHERE id = $4', [nombre, precio, categoria_id, id]);

    const msg = 'Producto actualizado correctamente';
    if (isJson(req)) return res.status(200).json({ mensaje: msg });
    res.redirect(`/productos?mensaje=${encodeURIComponent(msg)}`);
  } catch (err) {
    console.error('❌ Error al actualizar producto:', err.message);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/productos?error=Error al actualizar producto');
  }
});

// =======================
// DELETE - Eliminar Producto
// =======================
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: productoCheck } = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (productoCheck.length === 0) {
      if (isJson(req)) return res.status(404).json({ error: 'Producto no encontrado' });
      return res.redirect('/productos?error=Producto no encontrado');
    }

    await db.query('DELETE FROM productos WHERE id = $1', [id]);

    const msg = 'Producto eliminado correctamente';
    if (isJson(req)) return res.status(200).json({ mensaje: msg });
    res.redirect(`/productos?mensaje=${encodeURIComponent(msg)}`);
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err.message);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/productos?error=Error al eliminar producto');
  }
});

module.exports = router;
