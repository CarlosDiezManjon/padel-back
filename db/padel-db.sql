-- Creación de la base de datos
CREATE DATABASE padel-db;

-- Creación de las tablas
\connect padel-db;

CREATE TABLE usuarios (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  apellidos VARCHAR(50) NOT NULL,
  correo VARCHAR(100) NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  saldo DECIMAL(10,2) NOT NULL DEFAULT 0,
  PRIMARY KEY (id)
);

CREATE TABLE pistas (
  id INT NOT NULL AUTO_INCREMENT,
  nombre VARCHAR(50) NOT NULL,
  ubicación VARCHAR(50) NOT NULL,
  dimensiones VARCHAR(50) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE reservas (
  id INT NOT NULL AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  pista_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  importe DECIMAL(10,2) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  PRIMARY KEY (id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  FOREIGN KEY (pista_id) REFERENCES pistas (id)
);

CREATE TABLE pagos (
  id INT NOT NULL AUTO_INCREMENT,
  reserva_id INT NOT NULL,
  importe DECIMAL(10,2) NOT NULL,
  método_pago VARCHAR(20) NOT NULL,
  fecha DATE NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (reserva_id) REFERENCES reservas (id)
);

-- Inicialización de datos
INSERT INTO usuarios (nombre, apellidos, correo, contraseña, saldo)
VALUES ('Juan', 'Pérez', 'juan.perez@gmail.com', '123456', 100);

INSERT INTO usuarios (nombre, apellidos, correo, contraseña, saldo)
VALUES ('María', 'García', 'maria.garcia@gmail.com', '654321', 200);

INSERT INTO pistas (nombre, ubicación, dimensiones, precio)
VALUES ('Pista 1', 'Frontón', '20x10', 10);

INSERT INTO pistas (nombre, ubicación, dimensiones, precio)
VALUES ('Pista 2', 'Pista 1', '20x10', 15);

INSERT INTO reservas (usuario_id, pista_id, fecha, hora, importe)
VALUES (1, 1, '2023-12-20', '17:00', 10);

INSERT INTO reservas (usuario_id, pista_id, fecha, hora, importe)
VALUES (2, 2, '2023-12-21', '18:00', 15);
