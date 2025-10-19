const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db'); // db.js con Pool de pg y SSL

// GET /register
router.get('/', (req, res) => {
  res.render('register', { 
    title: 'Registro - Cake Sweet',
    error: null
  });
});

// POST /register
router.post('/', async (req, res) => {
  try {
    const isJson = req.is('application/json'); // Detecta si viene de Postman/API
    const { usuario, password } = req.body;

    console.log('🧠 Body recibido:', req.body);

    // Validaciones básicas
    if (!usuario || !password) {
      const msg = 'Usuario y contraseña son necesarios';
      if (isJson) return res.status(400).json({ error: msg });
      return res.render('register', { error: msg });
    }

    if (usuario.length < 3) {
      const msg = 'El usuario debe tener al menos 3 caracteres';
      if (isJson) return res.status(400).json({ error: msg });
      return res.render('register', { error: msg });
    }

    if (password.length < 4) {
      const msg = 'La contraseña debe tener al menos 4 caracteres';
      if (isJson) return res.status(400).json({ error: msg });
      return res.render('register', { error: msg });
    }

    // Verificar si el usuario ya existe
    const existingUsers = await db.query(
      'SELECT id FROM usuarios WHERE usuario = $1',
      [usuario]
    );

    if (existingUsers.rows.length > 0) {
      const msg = 'El usuario ya existe';
      if (isJson) return res.status(400).json({ error: msg });
      return res.render('register', { error: msg });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario en la base de datos
    await db.query(
      'INSERT INTO usuarios (usuario, password) VALUES ($1, $2)',
      [usuario, hashedPassword]
    );

    console.log('✅ Usuario registrado:', usuario);

    if (isJson) return res.status(201).json({ mensaje: 'Usuario registrado correctamente' });

    res.redirect('/login?mensaje=Usuario registrado exitosamente');

  } catch (error) {
    console.error('❌ Error en registro:', error);

    // Detectar si la conexión requiere SSL
    if (error.code === 'ECONNREFUSED') {
      console.error('❌ Verifica que db.js tenga ssl: { rejectUnauthorized: false } para Render');
    }

    const isJson = req.is('application/json');
    if (isJson) return res.status(500).json({ error: 'Error interno del servidor' });
    res.render('register', { error: 'Error interno del servidor' });
  }
});

module.exports = router;
