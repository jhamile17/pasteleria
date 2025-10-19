const express = require('express');
const router = express.Router();
const db = require('../db'); // Pool de PostgreSQL

// Helper para detectar si viene de Postman (JSON)
function isJson(req) {
  return req.is('application/json') || req.headers.accept?.includes('application/json');
}

// ✅ GET - Listar categorías
router.get('/', async (req, res) => {
  try {
    const { rows: categorias } = await db.query('SELECT * FROM categorias ORDER BY id ASC');
    if (isJson(req)) return res.status(200).json({ categorias });
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
      if (isJson(req)) return res.status(400).json({ error: 'El nombre de la categoría es obligatorio' });
      return res.redirect('/categorias?error=El nombre de la categoría es obligatorio');
    }

    await db.query('INSERT INTO categorias (nombre) VALUES ($1)', [nombre]);

    if (isJson(req)) return res.status(201).json({ mensaje: 'Categoría creada correctamente' });
    res.redirect('/categorias?mensaje=Categoría agregada correctamente');
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
    const { rowCount } = await db.query('UPDATE categorias SET nombre = $1 WHERE id = $2', [nombre, id]);

    if (rowCount === 0) {
      if (isJson(req)) return res.status(404).json({ error: 'Categoría no encontrada' });
      return res.redirect('/categorias?error=Categoría no encontrada');
    }

    if (isJson(req)) return res.status(200).json({ mensaje: 'Categoría actualizada correctamente' });
    res.redirect('/categorias?mensaje=Categoría actualizada correctamente');
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
      if (isJson(req)) return res.status(404).json({ error: 'Categoría no encontrada' });
      return res.redirect('/categorias?error=Categoría no encontrada');
    }

    if (isJson(req)) return res.status(200).json({ mensaje: 'Categoría eliminada correctamente' });
    res.redirect('/categorias?mensaje=Categoría eliminada correctamente');
  } catch (err) {
    console.error('❌ Error al eliminar categoría:', err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/categorias?error=Error al eliminar categoría');
  }
});

module.exports = router;
