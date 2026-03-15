-- Script para crear la base de datos Centro Médico (SQL Server / Azure SQL)
-- Ejecutar en una base de datos vacía (local o Azure).

-- Usuarios (login)
CREATE TABLE Usuario (
    idUsuario INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    passwordHash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL DEFAULT 'usuario'
);

-- Especialidades
CREATE TABLE Especialidad (
    idEspecialidad INT IDENTITY(1,1) PRIMARY KEY,
    especialidad VARCHAR(30) NOT NULL
);

-- Médicos
CREATE TABLE Medico (
    idMedico INT IDENTITY(1,1) PRIMARY KEY,
    numeroCarnet VARCHAR(20) NOT NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL
);

-- Pacientes
CREATE TABLE Paciente (
    idPaciente INT IDENTITY(1,1) PRIMARY KEY,
    dni VARCHAR(20) NULL,
    nombre VARCHAR(50) NOT NULL,
    apellido VARCHAR(50) NOT NULL,
    fechaNacimiento DATE NOT NULL,
    domicilio VARCHAR(50) NOT NULL,
    idPais CHAR(3) NULL,
    telefono VARCHAR(20) NULL,
    email VARCHAR(30) NOT NULL,
    observacion VARCHAR(MAX) NULL
);

-- Estados de turno (para el JOIN en Turno)
CREATE TABLE TurnoEstado (
    idEstado SMALLINT PRIMARY KEY,
    descripcion VARCHAR(30) NOT NULL
);
INSERT INTO TurnoEstado (idEstado, descripcion) VALUES (1, 'Pendiente'), (2, 'Confirmado'), (3, 'Atendido'), (4, 'Cancelado');

-- Turnos
CREATE TABLE Turno (
    idTurno INT IDENTITY(1,1) PRIMARY KEY,
    fechaTurno DATETIME NOT NULL,
    estado SMALLINT NOT NULL DEFAULT 1,
    observacion VARCHAR(MAX) NULL,
    CONSTRAINT FK_Turno_Estado FOREIGN KEY (estado) REFERENCES TurnoEstado(idEstado)
);

-- Historias clínicas
CREATE TABLE Historia (
    idHistoria INT IDENTITY(1,1) PRIMARY KEY,
    fechaHistoria DATETIME NOT NULL,
    observacion VARCHAR(MAX) NOT NULL
);

-- Usuario inicial: créalo desde la API (registro) o ejecuta después de generar el hash:
-- En la raíz del proyecto: node -e "const b=require('bcryptjs'); console.log(b.hashSync('admin123',10));"
-- Luego: INSERT INTO Usuario (username, passwordHash, rol) VALUES ('admin', '<el_hash_que_imprimio>', 'admin');
