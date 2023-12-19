class Usuario {
    constructor({ id, nombre, apellidos, correo, contraseña, saldo }) {
      this.id = id;
      this.nombre = nombre;
      this.apellidos = apellidos;
      this.correo = correo;
      this.contraseña = contraseña;
      this.saldo = saldo;
    }
  }
  
  module.exports = Usuario;