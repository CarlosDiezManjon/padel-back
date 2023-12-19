class Reserva {
    constructor({ id, usuarioId, pistaId, fecha, hora, importe, estado }) {
      this.id = id;
      this.usuarioId = usuarioId;
      this.pistaId = pistaId;
      this.fecha = fecha;
      this.hora = hora;
      this.importe = importe;
      this.estado = estado;
    }
  }
  
  module.exports = Reserva;