-- Creación de la base de datos
CREATE DATABASE padelDB;

-- Creación de las tablas
\connect padelDB;

CREATE TABLE usuarios (
  id SERIAL PRIMARY KEY,
  username VARCHAR(25) UNIQUE NOT NULL,
  nombre VARCHAR(50) NOT NULL,
  apellidos VARCHAR(50) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  telefono VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  saldo DECIMAL(10,2) NOT NULL DEFAULT 0,
  tipo INT NOT NULL DEFAULT 2,
  fecha_alta TIMESTAMP NOT NULL,
  fecha_baja TIMESTAMP,
  activo BOOLEAN NOT NULL DEFAULT FALSE,
  token_activacion VARCHAR(255),
  email_verificado BOOLEAN NOT NULL DEFAULT FALSE,
  numero_socio INT UNIQUE NULL
);

CREATE TABLE pistas (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  ubicacion VARCHAR(50) NOT NULL,
  duracion_reserva INT NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  hora_inicio TIME NOT NULL DEFAULT '09:00:00',
  hora_fin TIME NOT NULL DEFAULT '22:00:00'
);

CREATE TABLE tarifas (
  id INT PRIMARY KEY,
  nombre VARCHAR(50) UNIQUE NOT NULL,
  tipo_dia VARCHAR(20) NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  tipo_usuario INT NOT NULL DEFAULT 0
);

CREATE TABLE reservas (
  id SERIAL PRIMARY KEY,
  usuario_id INT NOT NULL,
  pista_id INT NOT NULL,
  fecha_inicio timestamp NOT NULL,
  fecha_fin timestamp NOT NULL,
  importe DECIMAL(10,2) NOT NULL,
  tarifa_id INT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'Confirmada',
  FOREIGN KEY (usuario_id) REFERENCES usuarios (id),
  FOREIGN KEY (pista_id) REFERENCES pistas (id),
  FOREIGN KEY (tarifa_id) REFERENCES tarifas (id)
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
);

INSERT INTO usuarios (id, username, nombre, apellidos, email, telefono, password, saldo, tipo, fecha_alta, fecha_baja, activo, token_activacion) VALUES(1, 'charlesmcmahon', 'Carlos', 'Díez Manjón', 'cdiez1995@gmail.com', '645773320', '$2b$10$65DXZ7mQrblDL95fEeUyduRBOI2mHXF6j0OhNc3MdZe9kmIoMPUTS', 0.00, 0, '2024-01-14 19:46:57.398', NULL, true, 'GY2vvXy6Hc8DwtvY');

insert into tarifas(id, nombre, tipo_dia, hora_inicio, hora_fin, precio, activo, tipo_usuario) values(1, 'Socio Mañana', 'SEMANA', '09:00', '14:00', 7.00, true, 1);

insert into tarifas(id, nombre, tipo_dia, hora_inicio, hora_fin, precio, activo, tipo_usuario) values(2, 'Socio Tarde', 'SEMANA', '15:00', '22:00', 8.00, true, 1);

insert into tarifas(id, nombre, tipo_dia, hora_inicio, hora_fin, precio, activo, tipo_usuario) values(3, 'Socio Fin de semana', 'FINDE', '09:00', '22:00', 10.00, true, 1);

insert into tarifas(id, nombre, tipo_dia, hora_inicio, hora_fin, precio, activo, tipo_usuario) values(4, 'No socio Mañana', 'SEMANA', '09:00', '14:00', 10.00, true, 2);

insert into tarifas(id, nombre, tipo_dia, hora_inicio, hora_fin, precio, activo, tipo_usuario) values(5, 'No socio Tarde', 'SEMANA', '15:00', '22:00', 18.00, true, 2);

insert into tarifas(id, nombre, tipo_dia, hora_inicio, hora_fin, precio, activo, tipo_usuario) values(6, 'No socio Fin de semana', 'FINDE', '09:00', '22:00', 20.00, true, 2);

insert into tarifas(id, nombre, tipo_dia, hora_inicio, hora_fin, precio, activo, tipo_usuario) values(7, 'Externo Mañana', 'TODO', '09:00', '14:00', 15.00, true, 3);

insert into tarifas(id, nombre, tipo_dia, hora_inicio, hora_fin, precio, activo, tipo_usuario) values(8, 'Externo Tarde', 'TODO', '15:00', '22:00', 20.00, true, 3);
