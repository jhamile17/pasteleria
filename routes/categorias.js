const express = require('express');
const router = express.Router();
const db = require('../db'); // Pool de PostgreSQL
const methodOverride = require('method-override');

// Middleware para soportar PUT y DELETE desde formularios
router.use(methodOverride('_method'));

// Helper para detectar si la petición espera JSON
function isJson(req) {
  return req.is('application/json') || req.headers.accept?.includes('application/json');
}

// --------------------
// LISTAR CATEGORÍAS
// --------------------
router.get('/', async (req, res) => {
  try {
    const { rows: categorias } = await db.query('SELECT * FROM categorias ORDER BY id ASC');
    res.render('categorias/index', {
      categorias,
      mensaje: req.query.mensaje || null,
      error: req.query.error || null
    });
  } catch (err) {
    console.error(err);
    res.redirect('/categorias?error=Error cargando categorías');
  }
});

// --------------------
// FORMULARIO NUEVA CATEGORÍA
// --------------------
router.get('/nuevo', (req, res) => {
  res.render('categorias/nuevo', { mensaje: null, error: null, nombre: '' });
});

// --------------------
// CREAR CATEGORÍA
// --------------------
router.post('/', async (req, res) => {
  const { nombre } = req.body;
  if (!nombre || nombre.trim() === '') {
    return res.render('categorias/nuevo', { mensaje: null, error: 'El nombre es obligatorio', nombre });
  }

  try {
    await db.query('INSERT INTO categorias (nombre) VALUES ($1)', [nombre.trim()]);
    res.redirect('/categorias?mensaje=Categoría agregada correctamente');
  } catch (err) {
    console.error(err);
    res.render('categorias/nuevo', { mensaje: null, error: 'Error al guardar categoría', nombre });
  }
});

// --------------------
// FORMULARIO EDITAR CATEGORÍA
// --------------------
router.get('/editar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM categorias WHERE id = $1', [id]);
    if (rows.length === 0) return res.redirect('/categorias?error=Categoría no encontrada');

    res.render('categorias/editar', { categoria: rows[0], mensaje: null, error: null });
  } catch (err) {
    console.error(err);
    res.redirect('/categorias?error=Error al cargar categoría');
  }
});

// --------------------
// ACTUALIZAR CATEGORÍA
// --------------------
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre || nombre.trim() === '') {
    return res.redirect(`/categorias/editar/${id}?error=${encodeURIComponent('El nombre es obligatorio')}`);
  }

  try {
    const { rowCount } = await db.query('UPDATE categorias SET nombre = $1 WHERE id = $2', [nombre.trim(), id]);
    if (rowCount === 0) return res.redirect('/categorias?error=Categoría no encontrada');

    res.redirect('/categorias?mensaje=Categoría actualizada correctamente');
  } catch (err) {
    console.error(err);
    res.redirect(`/categorias/editar/${id}?error=Error al actualizar categoría`);
  }
});

// --------------------
// ELIMINAR CATEGORÍA
// --------------------
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM categorias WHERE id = $1', [id]);
    if (rowCount === 0) return res.redirect('/categorias?error=Categoría no encontrada');

    res.redirect('/categorias?mensaje=Categoría eliminada correctamente');
  } catch (err) {
    console.error(err);
    res.redirect('/categorias?error=Error al eliminar categoría');
  }
});

module.exports = router;
