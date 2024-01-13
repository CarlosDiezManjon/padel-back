-- Creación de la base de datos
CREATE DATABASE padelDB;

-- Creación de las tablas
\connect padelDB;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) UNIQUE NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  apellidos VARCHAR(50) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(100) NOT NULL,
  contraseña VARCHAR(255) NOT NULL,
  saldo DECIMAL(10,2) NOT NULL DEFAULT 0,
  tipo INT,
  fecha_alta TIMESTAMP NOT NULL,
  fecha_baja TIMESTAMP
);

CREATE TABLE pistas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  ubicacion VARCHAR(50) NOT NULL,
  lat DECIMAL(10,2) NOT NULL,
  lon DECIMAL(10,2) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  duracion_reserva DECIMAL(2,1) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  pista_id INT NOT NULL,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  importe DECIMAL(10,2) NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente',
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  FOREIGN KEY (pista_id) REFERENCES pistas (id)
);

CREATE TABLE pagos (
  id SERIAL PRIMARY KEY,
  reserva_id INT NOT NULL,
  importe DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(20) NOT NULL,
  fecha TIMESTAMP NOT NULL,
  FOREIGN KEY (reserva_id) REFERENCES reservas (id)
);

INSERT INTO usuarios (username, nombre, apellidos, correo, telefono, contraseña, tipo, fecha_alta)
VALUES
  ('usuario1', 'Juan', 'Pérez', 'juan@example.com', '123456789', 'contraseña1', 1, '2024-01-01 10:00:00'),
  ('usuario2', 'María', 'López', 'maria@example.com', '987654321', 'contraseña2', 2, '2024-01-02 12:30:00'),
  ('usuario3', 'Carlos', 'Gómez', 'carlos@example.com', '555555555', 'contraseña3', 1, '2024-01-03 15:45:00');

INSERT INTO pistas (nombre, ubicacion, lat, lon, precio, duracion_reserva)
VALUES
  ('Pista1', 'Ubicación1', 10.8, 5.7, 30.00, 1.5),
  ('Pista2', 'Ubicación2', 10.8, 5.7, 50.00, 2.0),
  ('Pista3', 'Ubicación3', 10.8, 5.7, 40.00, 1.0);

INSERT INTO reservas (usuario_id, pista_id, fecha, hora, importe, estado)
VALUES
  (1, 2, '2024-01-10', '14:00:00', 30.00, 'confirmada'),
  (2, 1, '2024-01-11', '16:30:00', 50.00, 'pendiente'),
  (3, 3, '2024-01-12', '09:45:00', 40.00, 'confirmada');

INSERT INTO pagos (reserva_id, importe, metodo_pago, fecha)
VALUES
  (1, 30.00, 'tarjeta', '2024-01-10 15:00:00'),
  (2, 50.00, 'efectivo', '2024-01-11 17:00:00'),
  (3, 40.00, 'transferencia', '2024-01-12 10:00:00');

