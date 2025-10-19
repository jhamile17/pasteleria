const express = require('express');
const router = express.Router();
const db = require('../db');

// Detecta si la petición es JSON
const isJson = (req) => req.is('application/json') || req.headers.accept?.includes('application/json');

// ✅ GET - Listar categorías
router.get('/', async (req, res) => {
  try {
    const { rows: categorias } = await db.query('SELECT * FROM categorias ORDER BY id ASC');

    if (isJson(req)) return res.status(200).json({ mensaje: 'Categorías obtenidas correctamente', categorias });

    res.render('categorias/index', { categorias, mensaje: req.flash('mensaje'), error: req.flash('error') });
  } catch (err) {
    console.error(err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    req.flash('error', 'Error cargando categorías');
    res.redirect('/');
  }
});

// ✅ GET - Formulario nueva categoría
router.get('/nuevo', (req, res) => {
  res.render('categorias/nuevo', { categoria: {}, error: req.flash('error') });
});

// ✅ POST - Crear categoría
router.post('/', async (req, res) => {
  const { nombre } = req.body;
  try {
    if (!nombre || nombre.trim() === '') throw new Error('El nombre de la categoría es obligatorio');

    await db.query('INSERT INTO categorias (nombre) VALUES ($1)', [nombre.trim()]);

    if (isJson(req)) return res.status(201).json({ mensaje: 'Categoría creada correctamente' });

    req.flash('mensaje', 'Categoría creada correctamente');
    res.redirect('/categorias');
  } catch (err) {
    console.error(err);
    if (isJson(req)) return res.status(400).json({ error: err.message });
    req.flash('error', err.message);
    res.redirect('/categorias/nuevo');
  }
});

// ✅ GET - Formulario editar categoría
router.get('/editar/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM categorias WHERE id = $1', [id]);
    if (rows.length === 0) {
      req.flash('error', 'Categoría no encontrada');
      return res.redirect('/categorias');
    }
    res.render('categorias/editar', { categoria: rows[0], error: req.flash('error') });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Error cargando categoría');
    res.redirect('/categorias');
  }
});

// ✅ PUT - Actualizar categoría
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    if (!nombre || nombre.trim() === '') throw new Error('El nombre de la categoría es obligatorio');

    const { rowCount } = await db.query('UPDATE categorias SET nombre = $1 WHERE id = $2', [nombre.trim(), id]);

    if (rowCount === 0) throw new Error('Categoría no encontrada');

    if (isJson(req)) return res.status(200).json({ mensaje: 'Categoría actualizada correctamente' });

    req.flash('mensaje', 'Categoría actualizada correctamente');
    res.redirect('/categorias');
  } catch (err) {
    console.error(err);
    if (isJson(req)) return res.status(400).json({ error: err.message });
    req.flash('error', err.message);
    res.redirect(`/categorias/editar/${id}`);
  }
});

// ✅ DELETE - Eliminar categoría
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await db.query('DELETE FROM categorias WHERE id = $1', [id]);
    if (rowCount === 0) throw new Error('Categoría no encontrada');

    if (isJson(req)) return res.status(200).json({ mensaje: 'Categoría eliminada correctamente' });

    req.flash('mensaje', 'Categoría eliminada correctamente');
    res.redirect('/categorias');
  } catch (err) {
    console.error(err);
    if (isJson(req)) return res.status(400).json({ error: err.message });
    req.flash('error', err.message);
    res.redirect('/categorias');
  }
});

module.exports = router;
