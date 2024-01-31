-- Creación de la base de datos
CREATE DATABASE padelDB;

-- Creación de las tablas
\connect padelDB;

drop table pagos;
drop table reservas;
drop table pistas;
drop table usuarios;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) UNIQUE NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  apellidos VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  saldo DECIMAL(10,2) NOT NULL DEFAULT 0,
  tipo INT NOT NULL DEFAULT 1,
  fecha_alta TIMESTAMP NOT NULL,
  fecha_baja TIMESTAMP,
  activo BOOLEAN NOT NULL DEFAULT FALSE,
  token_activacion VARCHAR(255)
);

CREATE TABLE pistas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  ubicacion VARCHAR(50) NOT NULL,
  lat DECIMAL(10,2) NOT NULL DEFAULT 10.8,
  lon DECIMAL(10,2) NOT NULL DEFAULT 5.3,
  precio DECIMAL(10,2) NOT NULL,
  duracion_reserva INT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  hora_inicio TIME NOT NULL DEFAULT '09:00:00',
  hora_fin TIME NOT NULL DEFAULT '22:00:00'
);

CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  pista_id INT NOT NULL,
  fecha_inicio timestamp NOT NULL,
  fecha_fin timestamp NOT NULL
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

CREATE TABLE movimientos (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  reserva_id INT NOT NULL,
  motivo VARCHAR(20) NOT NULL,
  importe DECIMAL(10,2) NOT NULL,
  tipo VARCHAR(20) NOT NULL,
  fecha TIMESTAMP NOT NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  FOREIGN KEY (reserva_id) REFERENCES reservas (id)
)

INSERT INTO usuarios (id, username, nombre, apellidos, email, telefono, "password", saldo, tipo, fecha_alta, fecha_baja, activo, token_activacion) VALUES(13, 'charlesmcmahon', 'Carlos', 'Díez', 'cdiez1995@gmail.com', '645773320', '$2b$10$65DXZ7mQrblDL95fEeUyduRBOI2mHXF6j0OhNc3MdZe9kmIoMPUTS', 0.00, 2, '2024-01-14 19:46:57.398', NULL, true, 'GY2vvXy6Hc8DwtvY');
