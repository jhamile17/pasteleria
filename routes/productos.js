const express = require('express');
const router = express.Router();
const db = require('../db'); // Importa la conexión a PostgreSQL

// ✅ LISTAR PRODUCTOS
router.get('/', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT p.id, p.nombre, p.precio, c.nombre AS categoria,
             (SELECT i.url FROM imagenes_productos i WHERE i.producto_id = p.id LIMIT 1) AS imagen
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
      ORDER BY p.id ASC
    `);

    const productos = result.rows;

    // Respuesta según tipo de solicitud
    if (req.is('application/json') || req.headers.accept?.includes('application/json')) {
      return res.status(200).json({
        mensaje: 'Lista de productos obtenida correctamente',
        productos,
      });
    }

    // Renderiza vista EJS (si se usa en el panel)
    res.render('productos/indexp', { productos, categorias: [], categoriaId: null });
  } catch (err) {
    console.error('❌ Error al listar productos:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ CREAR PRODUCTO
router.post('/', async (req, res) => {
  try {
    const { nombre, precio, categoria_id } = req.body;

    if (!nombre || !precio || !categoria_id) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const categoriaCheck = await db.query('SELECT id FROM categorias WHERE id = $1', [categoria_id]);
    if (categoriaCheck.rows.length === 0) {
      return res.status(400).json({ error: 'La categoría seleccionada no existe' });
    }

    await db.query(
      'INSERT INTO productos (nombre, precio, categoria_id) VALUES ($1, $2, $3)',
      [nombre, precio, categoria_id]
    );

    res.status(201).json({ mensaje: 'Producto creado correctamente' });
  } catch (err) {
    console.error('❌ Error al crear producto:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ DETALLE DE PRODUCTO
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT p.id, p.nombre, p.precio, c.nombre AS categoria
       FROM productos p
       LEFT JOIN categorias c ON p.categoria_id = c.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.status(200).json({ mensaje: 'Detalle de producto obtenido', producto: result.rows[0] });
  } catch (err) {
    console.error('❌ Error al obtener producto:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ ACTUALIZAR PRODUCTO
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, categoria_id } = req.body;

    const productoCheck = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (productoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await db.query(
      'UPDATE productos SET nombre = $1, precio = $2, categoria_id = $3 WHERE id = $4',
      [nombre, precio, categoria_id, id]
    );

    res.status(200).json({ mensaje: 'Producto actualizado correctamente' });
  } catch (err) {
    console.error('❌ Error al actualizar producto:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✅ ELIMINAR PRODUCTO
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const productoCheck = await db.query('SELECT * FROM productos WHERE id = $1', [id]);

    if (productoCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    await db.query('DELETE FROM productos WHERE id = $1', [id]);
    res.status(200).json({ mensaje: 'Producto eliminado correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar producto:', err.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
