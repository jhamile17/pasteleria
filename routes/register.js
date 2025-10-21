const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const pool = require('../db');

router.get('/', (req, res) => {
  res.render('register', { 
    title: 'Registro - Cake Sweet',
    error: null
  });
});

router.post('/', async (req, res) => {
  try {
    const isJson = req.is('application/json');
    const { usuario, password } = req.body;

    console.log('🧠 Body recibido:', req.body);

    if (!usuario || !password) {
      if (isJson) return res.status(400).json({ error: 'Usuario y contraseña son necesarios' });
      return res.render('register', { error: 'Usuario y contraseña son necesarios' });
    }

    if (usuario.length < 3) {
      if (isJson) return res.status(400).json({ error: 'El usuario debe tener al menos 3 caracteres' });
      return res.render('register', { error: 'El usuario debe tener al menos 3 caracteres' });
    }

    if (password.length < 4) {
      if (isJson) return res.status(400).json({ error: 'La contraseña debe tener al menos 4 caracteres' });
      return res.render('register', { error: 'La contraseña debe tener al menos 4 caracteres' });
    }

    // Verificar si ya existe
    const { rows: existingUsers } = await pool.query(
      'SELECT * FROM usuarios WHERE usuario = $1',
      [usuario]
    );

    if (existingUsers.length > 0) {
      if (isJson) return res.status(400).json({ error: 'El usuario ya existe' });
      return res.render('register', { error: 'El usuario ya existe' });
    }

    // Encriptar y guardar
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      'INSERT INTO usuarios (usuario, password) VALUES ($1, $2)',
      [usuario, hashedPassword]
    );

    if (isJson) {
      return res.status(201).json({ mensaje: 'Usuario registrado correctamente' });
    }

    res.redirect('/login?mensaje=Usuario registrado exitosamente');
  } catch (error) {
    console.error('❌ Error en registro:', error);
    const isJson = req.is('application/json');
    if (isJson) return res.status(500).json({ error: 'Error interno del servidor' });
    res.render('register', { error: 'Error interno del servidor' });
  }
});

module.exports = router;
