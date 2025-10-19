const express = require('express');
const router = express.Router();
const db = require('../db'); // Pool de PostgreSQL

// Helper para detectar si la petición espera JSON
function isJson(req) {
  return req.is('application/json') || req.headers.accept?.includes('application/json');
}

// ✅ GET - Listar categorías
router.get('/', async (req, res) => {
  try {
    const { rows: categorias } = await db.query('SELECT * FROM categorias ORDER BY id ASC');

    if (isJson(req)) {
      return res.status(200).json({ categorias });
    }

    res.render('categorias/index', { 
      categorias, 
      mensaje: req.query.mensaje || null, 
      error: req.query.error || null 
    });
  } catch (err) {
    console.error('❌ Error al obtener categorías:', err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/categorias?error=Error cargando categorías');
  }
});

// ✅ POST - Crear categoría
router.post('/', async (req, res) => {
  const { nombre } = req.body;

  if (!nombre || nombre.trim() === '') {
    const errorMsg = 'El nombre de la categoría es obligatorio';
    if (isJson(req)) return res.status(400).json({ error: errorMsg });
    return res.redirect(`/categorias?error=${encodeURIComponent(errorMsg)}`);
  }

  try {
    await db.query('INSERT INTO categorias (nombre) VALUES ($1)', [nombre.trim()]);

    const mensaje = 'Categoría agregada correctamente';
    if (isJson(req)) return res.status(201).json({ mensaje });
    res.redirect(`/categorias?mensaje=${encodeURIComponent(mensaje)}`);
  } catch (err) {
    console.error('❌ Error al crear categoría:', err);
    const errorMsg = 'Error al guardar categoría';
    if (isJson(req)) return res.status(500).json({ error: errorMsg });
    res.redirect(`/categorias?error=${encodeURIComponent(errorMsg)}`);
  }
});

// ✅ PUT - Actualizar categoría
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  if (!nombre || nombre.trim() === '') {
    const errorMsg = 'El nombre de la categoría es obligatorio';
    if (isJson(req)) return res.status(400).json({ error: errorMsg });
    return res.redirect(`/categorias?error=${encodeURIComponent(errorMsg)}`);
  }

  try {
    const { rowCount } = await db.query(
      'UPDATE categorias SET nombre = $1 WHERE id = $2',
      [nombre.trim(), id]
    );

    if (rowCount === 0) {
      const errorMsg = 'Categoría no encontrada';
      if (isJson(req)) return res.status(404).json({ error: errorMsg });
      return res.redirect(`/categorias?error=${encodeURIComponent(errorMsg)}`);
    }

    const mensaje = 'Categoría actualizada correctamente';
    if (isJson(req)) return res.status(200).json({ mensaje });
    res.redirect(`/categorias?mensaje=${encodeURIComponent(mensaje)}`);
  } catch (err) {
    console.error('❌ Error al actualizar categoría:', err);
    const errorMsg = 'Error al actualizar categoría';
    if (isJson(req)) return res.status(500).json({ error: errorMsg });
    res.redirect(`/categorias?error=${encodeURIComponent(errorMsg)}`);
  }
});

// ✅ DELETE - Eliminar categoría
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const { rowCount } = await db.query('DELETE FROM categorias WHERE id = $1', [id]);

    if (rowCount === 0) {
      const errorMsg = 'Categoría no encontrada';
      if (isJson(req)) return res.status(404).json({ error: errorMsg });
      return res.redirect(`/categorias?error=${encodeURIComponent(errorMsg)}`);
    }

    const mensaje = 'Categoría eliminada correctamente';
    if (isJson(req)) return res.status(200).json({ mensaje });
    res.redirect(`/categorias?mensaje=${encodeURIComponent(mensaje)}`);
  } catch (err) {
    console.error('❌ Error al eliminar categoría:', err);
    const errorMsg = 'Error al eliminar categoría';
    if (isJson(req)) return res.status(500).json({ error: errorMsg });
    res.redirect(`/categorias?error=${encodeURIComponent(errorMsg)}`);
  }
});

module.exports = router;
