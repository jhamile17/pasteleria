-- ======================================
-- Script convertido de MySQL a PostgreSQL
-- Fecha: 18-10-2025
-- ======================================

BEGIN;

-- =========================
-- Tabla: categorias
-- =========================
CREATE TABLE categorias (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

INSERT INTO categorias (id, nombre) VALUES
(3, 'Cupcakes'),
(4, 'Galletas'),
(6, 'Donas'),
(13, 'Galletas'),
(14, 'Jugos'),
(15, 'Pasteles'),
(16, 'Pasteles');

-- =========================
-- Tabla: productos
-- =========================
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    precio NUMERIC(10,2) NOT NULL,
    categoria_id INT,
    CONSTRAINT fk_categoria
        FOREIGN KEY (categoria_id)
        REFERENCES categorias (id)
        ON DELETE SET NULL
);

INSERT INTO productos (id, nombre, precio, categoria_id) VALUES
(54, 'Pastel Red Velvet', 28.00, 16),
(55, 'Pastel Tres Leches', 26.00, 16),
(56, 'Pastel de Café', 27.00, 16),
(57, 'Pastel Arcoíris', 30.00, 16),
(58, 'Pastel de Zanahoria', 25.00, 16),
(59, 'Pastel de Vainilla con Fresas', 26.50, 16),
(60, 'Pastel de Mango', 27.50, 16),
(61, 'Pastel de Pistacho', 31.00, 16),
(69, 'Cupcake Red Velvet', 4.00, 3),
(70, 'Cupcake de Zanahoria', 4.20, 3),
(71, 'Cupcake de Limón', 3.80, 3),
(72, 'Cupcake de Frambuesa', 4.50, 3),
(73, 'Cupcake de Galleta Oreo', 4.70, 3),
(74, 'Cupcake con Buttercream de Fresa', 4.30, 3),
(75, 'Cupcake de Dulce de Leche', 4.60, 3),
(76, 'Galletas de Almendra', 2.00, 4),
(77, 'Galletas de Nuez', 2.20, 4),
(78, 'Galletas de Canela', 1.80, 4),
(79, 'Galletas de Limón', 1.90, 4),
(80, 'Galletas de Avena y Pasas', 2.00, 4),
(81, 'Galletas de Coco', 2.10, 4),
(82, 'Galletas de Chocolate Blanco', 2.30, 4),
(90, 'Dona de Vainilla', 1.70, 6),
(91, 'Dona Glaseada', 1.80, 6),
(92, 'Dona de Maple', 2.00, 6),
(93, 'Dona Rellena de Crema', 2.20, 6),
(94, 'Dona de Caramelo', 2.10, 6),
(95, 'Dona de Fresa', 1.90, 6),
(96, 'Dona de Avellana', 2.40, 6);

-- =========================
-- Tabla: imagenes_productos
-- =========================
CREATE TABLE imagenes_productos (
    id SERIAL PRIMARY KEY,
    url VARCHAR(255) NOT NULL,
    producto_id INT,
    CONSTRAINT fk_producto
        FOREIGN KEY (producto_id)
        REFERENCES productos (id)
        ON DELETE CASCADE
);

INSERT INTO imagenes_productos (id, url, producto_id) VALUES
(3, '/imagenes/productos/1755899977373.jpg', 56),
(5, '/imagenes/productos/1755899445014.jpg', 58),
(6, '/imagenes/productos/1755899539279.jpg', 59),
(7, '/imagenes/productos/1755900119929.jpg', 60),
(8, 'https://ejemplo.com/images/pastel_de_pistacho.jpg', 61),
(16, 'https://ejemplo.com/images/cupcake_red_velvet.jpg', 69),
(18, 'https://ejemplo.com/images/cupcake_de_limon.jpg', 71),
(19, 'https://ejemplo.com/images/cupcake_de_frambuesa.jpg', 72),
(20, 'https://ejemplo.com/images/cupcake_de_galleta_oreo.jpg', 73),
(21, 'https://ejemplo.com/images/cupcake_con_buttercream_de_fresa.jpg', 74),
(22, 'https://ejemplo.com/images/cupcake_de_dulce_de_leche.jpg', 75),
(23, '/imagenes/productos/1755903478135.jpg', 76),
(24, 'https://ejemplo.com/images/galletas_de_nuez.jpg', 77),
(25, 'https://ejemplo.com/images/galletas_de_canela.jpg', 78),
(26, 'https://ejemplo.com/images/galletas_de_limon.jpg', 79),
(27, 'https://ejemplo.com/images/galletas_de_avena_y_pasas.jpg', 80),
(28, 'https://ejemplo.com/images/galletas_de_coco.jpg', 81),
(29, 'https://ejemplo.com/images/galletas_de_chocolate_blanco.jpg', 82),
(37, 'https://ejemplo.com/images/dona_de_vainilla.jpg', 90),
(38, 'https://ejemplo.com/images/dona_glaseada.jpg', 91),
(39, 'https://ejemplo.com/images/dona_de_maple.jpg', 92),
(40, 'https://ejemplo.com/images/dona_rellena_de_crema.jpg', 93),
(41, 'https://ejemplo.com/images/dona_de_caramelo.jpg', 94),
(42, 'https://ejemplo.com/images/dona_de_fresa.jpg', 95),
(43, 'https://ejemplo.com/images/dona_de_avellana.jpg', 96);

-- =========================
-- Tabla: usuarios
-- =========================
CREATE TABLE usuarios (
    id SERIAL PRIMARY KEY,
    usuario VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

INSERT INTO usuarios (id, usuario, password) VALUES
(1, 'carlos', '81dc9bdb52d04dc20036dbd8313ed055'),
(2, 'maria', 'e2fc714c4727ee9395f324cd2e7f331f'),
(3, 'ricardo', '$2b$10$XBs5ft.JzOgq1y9GSNyR/OsMq'),
(6, 'jhamy', '$2b$10$qOwPZOSg6lWxvN7HJuG/h.jwl5iJpXM93C1olGcYGPayOi2qplOsO'),
(9, 'greisy', '$2b$10$GaLRYjko2hSvmeUG1kvGRuHg2oxe1iBGGCP2yx8J1gq76NQpLYTJW'),
(10, 'greisy1', '$2b$10$IbXffsytq15gF5Cnd37pSOetQQy36uqsahqL3Dj./DWgXapH1uNJm'),
(11, 'greeicy', '$2b$10$yyqfrQfErFxrXyddgAorXuX6EXCqMvQFqaf49WuHS6702UsGNZL0a');

COMMIT;
