const express = require('express');
const router = express.Router();
const db = require('../db'); // Pool de PostgreSQL

// Helper para detectar si viene de Postman (JSON)
const isJson = (req) => req.is('application/json') || req.headers.accept?.includes('application/json');

// ✅ GET - Listar categorías
router.get('/', async (req, res) => {
  try {
    const { rows: categorias } = await db.query('SELECT * FROM categorias ORDER BY id ASC');

    if (isJson(req)) {
      return res.status(200).json({ mensaje: 'Categorías obtenidas correctamente', categorias });
    }

    res.render('categorias/index', { categorias, mensaje: null, error: null });
  } catch (err) {
    console.error('❌ Error al obtener categorías:', err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/categorias?error=Error cargando categorías');
  }
});

// ✅ POST - Crear categoría
router.post('/', async (req, res) => {
  const { nombre } = req.body;
  try {
    if (!nombre || nombre.trim() === '') {
      const msg = 'El nombre de la categoría es obligatorio';
      if (isJson(req)) return res.status(400).json({ error: msg });
      return res.redirect(`/categorias?error=${encodeURIComponent(msg)}`);
    }

    await db.query('INSERT INTO categorias (nombre) VALUES ($1)', [nombre.trim()]);

    const msg = 'Categoría creada correctamente';
    if (isJson(req)) return res.status(201).json({ mensaje: msg });
    res.redirect(`/categorias?mensaje=${encodeURIComponent(msg)}`);
  } catch (err) {
    console.error('❌ Error al crear categoría:', err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/categorias?error=Error al guardar categoría');
  }
});

// ✅ PUT - Actualizar categoría
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  try {
    if (!nombre || nombre.trim() === '') {
      const msg = 'El nombre de la categoría es obligatorio';
      if (isJson(req)) return res.status(400).json({ error: msg });
      return res.redirect(`/categorias?error=${encodeURIComponent(msg)}`);
    }

    const { rowCount } = await db.query(
      'UPDATE categorias SET nombre = $1 WHERE id = $2',
      [nombre.trim(), id]
    );

    if (rowCount === 0) {
      const msg = 'Categoría no encontrada';
      if (isJson(req)) return res.status(404).json({ error: msg });
      return res.redirect(`/categorias?error=${encodeURIComponent(msg)}`);
    }

    const msg = 'Categoría actualizada correctamente';
    if (isJson(req)) return res.status(200).json({ mensaje: msg });
    res.redirect(`/categorias?mensaje=${encodeURIComponent(msg)}`);
  } catch (err) {
    console.error('❌ Error al actualizar categoría:', err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/categorias?error=Error al actualizar categoría');
  }
});

// ✅ DELETE - Eliminar categoría
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await db.query('DELETE FROM categorias WHERE id = $1', [id]);

    if (rowCount === 0) {
      const msg = 'Categoría no encontrada';
      if (isJson(req)) return res.status(404).json({ error: msg });
      return res.redirect(`/categorias?error=${encodeURIComponent(msg)}`);
    }

    const msg = 'Categoría eliminada correctamente';
    if (isJson(req)) return res.status(200).json({ mensaje: msg });
    res.redirect(`/categorias?mensaje=${encodeURIComponent(msg)}`);
  } catch (err) {
    console.error('❌ Error al eliminar categoría:', err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/categorias?error=Error al eliminar categoría');
  }
});

module.exports = router; para render y postgress 
