

class UsuarioController{
    constructor() {
    }
  
    get() {
      return this.db.any('SELECT * FROM Usuarios');
    }
  
    post() {
      const { nombre, apellidos, correoElectronico, telefono, password, saldo, tipoUsuario } = this.req.body;
      return this.db.none('INSERT INTO Usuarios (Nombre, Apellidos, Correo,Telefono, Password,Saldo, Tipo) VALUES ($1, $2, $3, $4, $5, $6)',
       [nombre, apellidos, correoElectronico, telefono, password, saldo, tipoUsuario]);
    }

    put(){
        return "updated"
    }
    delete(){
        return "deleted"
    }
  }
  
  export default UsuarioController;
  