const express = require('express');
const router = express.Router();
const db = require('../db'); // tu pool de PostgreSQL
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Helper para detectar si la petición espera JSON
function isJson(req) {
  return req.is('application/json') || req.headers.accept?.includes('application/json');
}

// 📦 Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const carpeta = 'public/imagenes/productos/';
    if (!fs.existsSync(carpeta)) fs.mkdirSync(carpeta, { recursive: true });
    cb(null, carpeta);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage });

// 📂 Obtener todas las categorías
async function obtenerCategorias() {
  const { rows: categorias } = await db.query('SELECT * FROM categorias');
  return categorias;
}

// 🔁 Redirigir /imagenes → /imagenes/nuevoi
router.get('/', (req, res) => {
  res.redirect('/imagenes/nuevoi');
});

// 🧾 Renderizar formulario de imágenes
router.get('/nuevoi', async (req, res) => {
  try {
    const categorias = await obtenerCategorias();
    res.render('imagenes/nuevoi', { 
      categorias, 
      mensaje: req.query.mensaje || null, 
      error: req.query.error || null 
    });
  } catch (err) {
    console.error(err);
    if (isJson(req)) return res.status(500).json({ error: 'Error al cargar formulario de imágenes' });
    res.redirect('/imagenes?error=Error al cargar formulario de imágenes');
  }
});

// 🧭 Obtener productos por categoría
router.get('/productos/byCategoria/:categoriaId', async (req, res) => {
  try {
    const { categoriaId } = req.params;
    const { rows: productos } = await db.query(
      'SELECT id, nombre FROM productos WHERE categoria_id = $1',
      [categoriaId]
    );

    if (productos.length === 0) {
      if (isJson(req)) return res.status(404).json({ error: 'No hay productos para esta categoría' });
      return res.redirect(`/imagenes/nuevoi?error=${encodeURIComponent('No hay productos para esta categoría')}`);
    }

    if (isJson(req)) return res.json(productos);
    res.render('imagenes/productos', { productos, mensaje: null, error: null });
  } catch (err) {
    console.error(err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/imagenes?error=Error interno del servidor');
  }
});

// 📤 Guardar nueva imagen
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { producto_id } = req.body;

    if (!req.file) {
      const errorMsg = 'Debe subir una imagen válida';
      if (isJson(req)) return res.status(400).json({ error: errorMsg });
      return res.redirect(`/imagenes/nuevoi?error=${encodeURIComponent(errorMsg)}`);
    }

    const url = '/imagenes/productos/' + req.file.filename;
    await db.query('INSERT INTO imagenes_productos (url, producto_id) VALUES ($1, $2)', [url, producto_id]);

    const mensaje = 'Imagen agregada correctamente';
    if (isJson(req)) return res.status(201).json({ mensaje, url });
    res.redirect(`/imagenes/nuevoi?mensaje=${encodeURIComponent(mensaje)}`);
  } catch (err) {
    console.error(err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/imagenes/nuevoi?error=Error al agregar imagen');
  }
});

// 📜 Listar imágenes por producto
router.get('/list/:producto_id', async (req, res) => {
  try {
    const { producto_id } = req.params;
    const { rows: imagenes } = await db.query(
      'SELECT * FROM imagenes_productos WHERE producto_id = $1',
      [producto_id]
    );

    if (imagenes.length === 0) {
      const errorMsg = 'No hay imágenes para este producto';
      if (isJson(req)) return res.status(404).json({ error: errorMsg });
      return res.redirect(`/imagenes/nuevoi?error=${encodeURIComponent(errorMsg)}`);
    }

    if (isJson(req)) return res.json(imagenes);
    res.render('imagenes/list', { imagenes, mensaje: null, error: null });
  } catch (err) {
    console.error(err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/imagenes/nuevoi?error=Error al listar imágenes');
  }
});

// ✏️ Editar imagen
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      const errorMsg = 'Debe subir una nueva imagen';
      if (isJson(req)) return res.status(400).json({ error: errorMsg });
      return res.redirect(`/imagenes/nuevoi?error=${encodeURIComponent(errorMsg)}`);
    }

    const { rows } = await db.query('SELECT url FROM imagenes_productos WHERE id = $1', [id]);
    if (rows.length === 0) {
      const errorMsg = 'Imagen no encontrada';
      if (isJson(req)) return res.status(404).json({ error: errorMsg });
      return res.redirect(`/imagenes/nuevoi?error=${encodeURIComponent(errorMsg)}`);
    }

    const rutaAnterior = 'public' + rows[0].url;
    if (fs.existsSync(rutaAnterior)) fs.unlinkSync(rutaAnterior);

    const url = '/imagenes/productos/' + req.file.filename;
    await db.query('UPDATE imagenes_productos SET url = $1 WHERE id = $2', [url, id]);

    const mensaje = 'Imagen actualizada correctamente';
    if (isJson(req)) return res.status(200).json({ mensaje, url });
    res.redirect(`/imagenes/nuevoi?mensaje=${encodeURIComponent(mensaje)}`);
  } catch (err) {
    console.error(err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/imagenes/nuevoi?error=Error al actualizar imagen');
  }
});

// 🗑️ Eliminar imagen
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT url FROM imagenes_productos WHERE id = $1', [id]);

    if (rows.length === 0) {
      const errorMsg = 'Imagen no encontrada';
      if (isJson(req)) return res.status(404).json({ error: errorMsg });
      return res.redirect(`/imagenes/nuevoi?error=${encodeURIComponent(errorMsg)}`);
    }

    const rutaArchivo = 'public' + rows[0].url;
    if (fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo);

    await db.query('DELETE FROM imagenes_productos WHERE id = $1', [id]);

    const mensaje = 'Imagen eliminada correctamente';
    if (isJson(req)) return res.status(200).json({ mensaje });
    res.redirect(`/imagenes/nuevoi?mensaje=${encodeURIComponent(mensaje)}`);
  } catch (err) {
    console.error(err);
    if (isJson(req)) return res.status(500).json({ error: 'Error interno del servidor' });
    res.redirect('/imagenes/nuevoi?error=Error al eliminar imagen');
  }
});

module.exports = router;
