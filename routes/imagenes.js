const express = require('express');
const router = express.Router();
const db = require('../db'); // tu pool de PostgreSQL
const multer = require('multer');
const path = require('path');
const fs = require('fs');

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
  res.redirect('/nuevoi');
});

// 🧾 Renderizar formulario de imágenes
router.get('/nuevoi', async (req, res) => {
  try {
    const categorias = await obtenerCategorias();
    res.render('imagenes/nuevoi', { categorias, mensaje: null, error: null });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al cargar formulario de imágenes');
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
      return res.status(404).json({ error: 'No hay productos para esta categoría' });
    }
    res.json(productos);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 📤 Guardar nueva imagen
router.post('/', upload.single('imagen'), async (req, res) => {
  try {
    const { producto_id } = req.body;
    const categorias = await obtenerCategorias();

    if (!req.file) {
      return res.status(400).json({ error: 'Debe subir una imagen válida' });
    }

    const url = '/imagenes/productos/' + req.file.filename;
    await db.query('INSERT INTO imagenes_productos (url, producto_id) VALUES ($1, $2)', [url, producto_id]);

    res.status(201).json({ mensaje: 'Imagen agregada correctamente', url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
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
      return res.status(404).json({ error: 'No hay imágenes para este producto' });
    }

    res.json(imagenes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// ✏️ Editar imagen
router.put('/:id', upload.single('imagen'), async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ error: 'Debe subir una nueva imagen' });
    }

    const { rows } = await db.query('SELECT url FROM imagenes_productos WHERE id = $1', [id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Imagen no encontrada' });

    const rutaAnterior = 'public' + rows[0].url;
    if (fs.existsSync(rutaAnterior)) fs.unlinkSync(rutaAnterior);

    const url = '/imagenes/productos/' + req.file.filename;
    await db.query('UPDATE imagenes_productos SET url = $1 WHERE id = $2', [url, id]);

    res.status(200).json({ mensaje: 'Imagen actualizada correctamente', url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 🗑️ Eliminar imagen
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('SELECT url FROM imagenes_productos WHERE id = $1', [id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Imagen no encontrada' });

    const rutaArchivo = 'public' + rows[0].url;
    if (fs.existsSync(rutaArchivo)) fs.unlinkSync(rutaArchivo);

    await db.query('DELETE FROM imagenes_productos WHERE id = $1', [id]);

    res.status(200).json({ mensaje: 'Imagen eliminada correctamente' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
