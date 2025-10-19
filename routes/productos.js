const express = require('express');
const router = express.Router();
const db = require('../db'); // Pool PostgreSQL

function isJson(req) {
  return req.is('application/json') || req.headers.accept?.includes('application/json');
}

// LISTAR PRODUCTOS con filtro opcional por categoría
router.get('/', async (req, res) => {
  try {
    const categoriaId = req.query.categoria || null;

    // Traer productos
    let query = `
      SELECT p.id, p.nombre, p.precio, c.nombre AS categoria,
             (SELECT i.url FROM imagenes_productos i WHERE i.producto_id = p.id LIMIT 1) AS imagen
      FROM productos p
      LEFT JOIN categorias c ON p.categoria_id = c.id
    `;
    let params = [];
    if (categoriaId) {
      query += ` WHERE p.categoria_id = $1`;
      params.push(categoriaId);
    }
    query += ` ORDER BY p.id ASC`;

    const { rows: productos } = await db.query(query, params);

    // Traer categorías para filtro
    const { rows: categorias } = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');

    if (isJson(req)) return res.json({ mensaje: 'Productos obtenidos', productos });

    res.render('productos/indexp', { 
      productos, 
      categorias, 
      categoriaId, 
      mensaje: req.query.mensaje || null, 
      error: req.query.error || null 
    });
  } catch (err) {
    console.error(err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/productos?error=Error cargando productos');
  }
});

// FORMULARIO NUEVO PRODUCTO
router.get('/nuevop', async (req, res) => {
  try {
    const { rows: categorias } = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');
    res.render('productos/nuevop', { categorias, producto: null, mensaje: req.query.mensaje || null, error: req.query.error || null });
  } catch (err) {
    console.error(err);
    res.redirect('/productos?error=Error al cargar formulario');
  }
});

// CREAR PRODUCTO
router.post('/', async (req, res) => {
  try {
    const { nombre, precio, categoria_id } = req.body;
    if (!nombre || !precio || !categoria_id) {
      return res.redirect(`/productos/nuevop?error=${encodeURIComponent('Todos los campos son obligatorios')}`);
    }

    const { rowCount } = await db.query('SELECT id FROM categorias WHERE id = $1', [categoria_id]);
    if (rowCount === 0) return res.redirect(`/productos/nuevop?error=${encodeURIComponent('Categoría no existe')}`);

    await db.query('INSERT INTO productos (nombre, precio, categoria_id) VALUES ($1,$2,$3)', [nombre.trim(), precio, categoria_id]);
    res.redirect('/productos?mensaje=Producto creado correctamente');
  } catch (err) {
    console.error(err);
    res.redirect('/productos/nuevop?error=Error al crear producto');
  }
});

// FORMULARIO EDITAR PRODUCTO
router.get('/editarp/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: productoRows } = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
    if (productoRows.length === 0) return res.redirect('/productos?error=Producto no encontrado');

    const { rows: categorias } = await db.query('SELECT * FROM categorias ORDER BY nombre ASC');
    res.render('productos/editarp', { producto: productoRows[0], categorias, mensaje: null, error: null });
  } catch (err) {
    console.error(err);
    res.redirect('/productos?error=Error al cargar formulario');
  }
});

// ACTUALIZAR PRODUCTO
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, categoria_id } = req.body;

    const { rowCount } = await db.query('SELECT * FROM productos WHERE id=$1', [id]);
    if (rowCount === 0) return res.redirect(`/productos?error=Producto no encontrado`);

    await db.query('UPDATE productos SET nombre=$1, precio=$2, categoria_id=$3 WHERE id=$4', [nombre.trim(), precio, categoria_id, id]);
    res.redirect('/productos?mensaje=Producto actualizado correctamente');
  } catch (err) {
    console.error(err);
    res.redirect(`/productos/editarp/${req.params.id}?error=Error al actualizar producto`);
  }
});

// ELIMINAR PRODUCTO
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await db.query('SELECT * FROM productos WHERE id=$1', [id]);
    if (rowCount === 0) return res.redirect(`/productos?error=Producto no encontrado`);

    await db.query('DELETE FROM productos WHERE id=$1', [id]);
    res.redirect('/productos?mensaje=Producto eliminado correctamente');
  } catch (err) {
    console.error(err);
    res.redirect('/productos?error=Error al eliminar producto');
  }
});

// DETALLE DE PRODUCTO (/:id) → al final siempre
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: productos } = await db.query('SELECT p.id,p.nombre,p.precio,c.nombre AS categoria FROM productos p LEFT JOIN categorias c ON p.categoria_id=c.id WHERE p.id=$1', [id]);
    if (productos.length === 0) return res.redirect('/productos?error=Producto no encontrado');
    res.render('productos/detail', { producto: productos[0], mensaje: null, error: null });
  } catch (err) {
    console.error(err);
    res.redirect('/productos?error=Error al obtener producto');
  }
});

module.exports = router;
